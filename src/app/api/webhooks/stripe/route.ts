/**
 * Stripe Webhook Handler
 * T016: Simplified to handle only premium subscriptions (removed legacy plan management)
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import {
  verifyWebhookSignature,
  handleWebhookEvent,
} from '@/lib/stripe/webhooks';
import { subscriptionEvents } from '@/db/schema/subscription-events';
import { db } from '@/db';
import { eq } from 'drizzle-orm';

/**
 * Maximum webhook processing time
 * Stripe expects response within 30 seconds
 */
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    // Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check for duplicate events (idempotency)
    const [existingEvent] = await db
      .select()
      .from(subscriptionEvents)
      .where(eq(subscriptionEvents.stripeEventId, event.id))
      .limit(1);

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Log event for audit trail
    await db.insert(subscriptionEvents).values({
      id: crypto.randomUUID(),
      userId: null, // Will be updated by handler if applicable
      stripeEventId: event.id,
      eventType: event.type,
      payload: event as any,
      processingStatus: 'pending',
    });

    // Handle the event
    try {
      await handleWebhookEvent(event);

      // Mark event as successfully processed
      await db
        .update(subscriptionEvents)
        .set({ processingStatus: 'success' })
        .where(eq(subscriptionEvents.stripeEventId, event.id));

      console.log(`✅ Successfully processed event ${event.type} (${event.id})`);
    } catch (error) {
      // Mark event as failed
      await db
        .update(subscriptionEvents)
        .set({
          processingStatus: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })
        .where(eq(subscriptionEvents.stripeEventId, event.id));

      console.error(`❌ Failed to process event ${event.type}:`, error);
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
