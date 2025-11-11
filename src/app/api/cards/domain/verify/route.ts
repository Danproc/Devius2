/**
 * POST /api/cards/domain/verify
 *
 * Verify custom domain ownership via DNS TXT record
 * Requires authentication and premium status
 */

import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getDevCard } from '@/lib/devcard';
import { verifyDomainOwnership } from '@/lib/devcard/domain-verification';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';

/**
 * POST /api/cards/domain/verify
 * Verify custom domain ownership
 */
export const POST = withAuthRequired(async (req: NextRequest, context) => {
  const { session } = context;
  const userId = session.user.id;

  try {
    // Check if user is premium
    const [user] = await db
      .select({ is_premium: users.is_premium })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.is_premium) {
      return NextResponse.json(
        {
          error: 'Premium required',
          message: 'Custom domains are only available for premium users',
        },
        { status: 403 }
      );
    }

    // Check if user has a DevCard
    const existingCard = await getDevCard(userId);

    if (!existingCard) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: 'You need to create a DevCard before verifying a custom domain',
        },
        { status: 404 }
      );
    }

    // Check if user has a custom domain set
    if (!existingCard.custom_domain) {
      return NextResponse.json(
        {
          error: 'No custom domain',
          message: 'You need to set a custom domain before verifying it',
        },
        { status: 400 }
      );
    }

    // Verify domain ownership
    const result = await verifyDomainOwnership(existingCard.id, existingCard.custom_domain);

    if (!result.verified) {
      return NextResponse.json(
        {
          verified: false,
          error: result.error || 'Domain verification failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: 'Domain verified successfully',
    });
  } catch (error: any) {
    console.error('Domain verification error:', error);

    return NextResponse.json(
      {
        verified: false,
        error: error.message || 'An error occurred while verifying your domain',
      },
      { status: 500 }
    );
  }
});
