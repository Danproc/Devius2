/**
 * Subscription Management Functions
 * T108: Create src/lib/stripe/subscriptions.ts with createSubscription, cancelSubscription, updateSubscription functions
 */

import { stripe } from './client';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export interface CreateSubscriptionParams {
  userId: string;
  priceId: string;
  email: string;
  metadata?: {
    tierCode?: string;
    billingFrequency?: string;
    [key: string]: string | undefined;
  };
}

export interface SubscriptionUpdateData {
  isPremium: boolean;
  subscriptionId: string;
  customerId: string;
  expiresAt: Date;
  tierCode?: string | null;
}

/**
 * Create a new Stripe subscription for a user
 * @param params - User ID, price ID, and email
 * @returns Stripe checkout session
 */
export async function createSubscription(params: CreateSubscriptionParams) {
  const { userId, priceId, email, metadata = {} } = params;

  try {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;

    // Create a new Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing/plans?canceled=true`,
      metadata: {
        userId,
        ...metadata,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a user's subscription
 * @param subscriptionId - Stripe subscription ID
 * @returns Canceled subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Update a user's subscription (e.g., change plan)
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New price ID to switch to
 * @returns Updated subscription
 */
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription with new price
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return updated;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Update user's premium status in database
 * @param userId - User ID
 * @param data - Subscription update data
 */
export async function updateUserPremiumStatus(userId: string, data: SubscriptionUpdateData) {
  try {
    await db
      .update(users)
      .set({
        is_premium: data.isPremium,
        premium_tier: data.tierCode || null,
        stripeSubscriptionId: data.subscriptionId,
        stripeCustomerId: data.customerId,
        premium_expires_at: data.expiresAt,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Error updating user premium status:', error);
    throw error;
  }
}

/**
 * Get subscription details for a user
 * @param userId - User ID
 * @returns Subscription details or null
 */
export async function getUserSubscription(userId: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.stripeSubscriptionId) {
      return null;
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Check if a subscription is active
 * @param subscription - Stripe subscription object
 * @returns Boolean indicating if subscription is active
 */
export function isSubscriptionActive(subscription: Stripe.Subscription): boolean {
  return ['active', 'trialing'].includes(subscription.status);
}

/**
 * Get subscription expiry date
 * @param subscription - Stripe subscription object
 * @returns Date object for when subscription expires
 */
export function getSubscriptionExpiryDate(subscription: Stripe.Subscription): Date {
  return new Date(subscription.current_period_end * 1000);
}
