/**
 * Checkout API Endpoint
 * T015: Create Stripe checkout session with tier-based pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSubscription } from '@/lib/stripe/subscriptions';
import { getStripePriceId } from '@/lib/premium/tiers';
import { z } from 'zod';

const checkoutSchema = z.object({
  tierCode: z.string().min(1, 'Tier code is required'),
  billingFrequency: z.enum(['monthly', 'annual'], {
    errorMap: () => ({ message: 'Billing frequency must be monthly or annual' })
  }),
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

    const { tierCode, billingFrequency } = validation.data;
    const { id: userId, email } = session.user;

    // Get Stripe price ID for the selected tier and frequency
    const priceId = await getStripePriceId(tierCode, billingFrequency);

    console.log('Checkout request:', { tierCode, billingFrequency, priceId, userId });

    if (!priceId) {
      console.error('No price ID found for tier:', tierCode, billingFrequency);
      return NextResponse.json(
        { error: 'Invalid tier code or pricing not configured' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await createSubscription({
      userId,
      priceId,
      email,
      metadata: {
        tierCode,
        billingFrequency,
      },
    });

    console.log('Checkout session created:', checkoutSession.id);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
