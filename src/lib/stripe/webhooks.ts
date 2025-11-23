/**
 * Stripe Webhook Handlers
 * T109: Create src/lib/stripe/webhooks.ts with webhook handler functions for subscription events
 */

import { stripe } from './client';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { updateUserPremiumStatus, getSubscriptionExpiryDate, isSubscriptionActive } from './subscriptions';

/**
 * Handle checkout.session.completed event
 * Called when a customer completes a checkout session
 * T017: Implement handleCheckoutCompleted to upgrade user to premium
 */
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const tierCode = session.metadata?.tierCode;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update user premium status with tier information
    await updateUserPremiumStatus(userId, {
      isPremium: isSubscriptionActive(subscription),
      subscriptionId,
      customerId,
      expiresAt: getSubscriptionExpiryDate(subscription),
      tierCode: tierCode || null,
    });

    console.log(`✅ Subscription activated for user ${userId}, tier: ${tierCode || 'default'}`);

    // T020: Send welcome email
    await sendPremiumWelcomeEmail(userId, tierCode || 'premium', subscription);
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Send premium welcome email
 * T020: Trigger welcome email when user subscribes
 */
async function sendPremiumWelcomeEmail(userId: string, tierCode: string, subscription: Stripe.Subscription) {
  try {
    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.email) {
      console.error('No email found for user', userId);
      return;
    }

    // Import email utilities
    const { render } = await import('@react-email/components');
    const sendMail = (await import('@/lib/email/sendMail')).default;
    const PremiumWelcomeEmail = (await import('@/emails/PremiumWelcomeEmail')).default;

    // Get tier name and features
    const tierName = tierCode === 'premium_pro' ? 'Premium Pro' : 'Premium';
    const features = tierCode === 'premium_pro'
      ? ['Custom Themes', 'Advanced Analytics', 'Priority Support', 'Custom Domain', 'API Access']
      : ['Custom Themes', 'Advanced Analytics', 'Priority Support'];

    // Calculate billing details
    const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0;
    const billingAmount = priceAmount / 100; // Convert cents to dollars
    const billingFrequency = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';

    const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = await render(
      PremiumWelcomeEmail({
        name: user.name || 'there',
        tierName,
        features,
        billingAmount,
        billingFrequency,
        nextBillingDate,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing`,
      })
    );

    await sendMail(
      user.email,
      `🎉 Welcome to ${tierName}!`,
      html
    );

    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - email failure shouldn't block webhook processing
  }
}

/**
 * Handle customer.subscription.updated event
 * Called when a subscription is updated (e.g., plan change, renewal)
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Find user by customer ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (!user) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    // Extract tier code from subscription metadata (if available)
    const tierCode = subscription.metadata?.tierCode || user.premium_tier;

    // Update user premium status
    await updateUserPremiumStatus(user.id, {
      isPremium: isSubscriptionActive(subscription),
      subscriptionId: subscription.id,
      customerId,
      expiresAt: getSubscriptionExpiryDate(subscription),
      tierCode,
    });

    console.log(`✅ Subscription updated for user ${user.id}, status: ${subscription.status}, tier: ${tierCode}`);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 * Called when a subscription is canceled or expires
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Find user by customer ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (!user) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    // Remove premium status and tier
    await db
      .update(users)
      .set({
        is_premium: false,
        premium_tier: null,
        stripeSubscriptionId: null,
        premium_expires_at: null,
      })
      .where(eq(users.id, user.id));

    console.log(`✅ Subscription canceled for user ${user.id}`);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 * Called when a payment fails
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    // Find user by customer ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (!user) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    // TODO: Send payment failed notification email
    console.log(`⚠️ Payment failed for user ${user.id}`);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 * Called when a payment succeeds
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
      return; // Not a subscription payment
    }

    // Find user by customer ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (!user) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update user premium status with new expiry date
    await updateUserPremiumStatus(user.id, {
      isPremium: isSubscriptionActive(subscription),
      subscriptionId,
      customerId,
      expiresAt: getSubscriptionExpiryDate(subscription),
    });

    console.log(`✅ Payment succeeded for user ${user.id}, subscription renewed`);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Verified Stripe event
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Main webhook event router
 * Routes different webhook events to their appropriate handlers
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    throw error;
  }
}
