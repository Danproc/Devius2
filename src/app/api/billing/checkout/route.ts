/**
 * Checkout API Endpoint
 * T110: Create src/app/api/billing/checkout/route.ts for POST /api/billing/checkout (create Stripe checkout session)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSubscription } from '@/lib/stripe/subscriptions';
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { priceId } = validation.data;
    const { id: userId, email } = session.user;

    // Create Stripe checkout session
    const checkoutSession = await createSubscription({
      userId,
      priceId,
      email,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
