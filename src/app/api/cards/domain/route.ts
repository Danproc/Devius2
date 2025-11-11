/**
 * PATCH /api/cards/domain
 *
 * Update custom domain for authenticated user's DevCard
 * Requires authentication and premium status
 */

import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getDevCard } from '@/lib/devcard';
import { updateCustomDomain } from '@/lib/devcard/domain-verification';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';

/**
 * PATCH /api/cards/domain
 * Update custom domain for authenticated user's DevCard
 */
export const PATCH = withAuthRequired(async (req: NextRequest, context) => {
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
          message: 'You need to create a DevCard before setting a custom domain',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { custom_domain } = body;

    // Validate input
    if (custom_domain !== null && typeof custom_domain !== 'string') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'custom_domain must be a string or null',
        },
        { status: 400 }
      );
    }

    // Update custom domain
    const result = await updateCustomDomain(existingCard.id, custom_domain);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Update failed',
          message: result.error || 'Failed to update custom domain',
        },
        { status: 400 }
      );
    }

    // Fetch updated DevCard
    const updatedCard = await getDevCard(userId);

    return NextResponse.json({
      id: updatedCard!.id,
      custom_domain: updatedCard!.custom_domain,
      custom_domain_verified: updatedCard!.custom_domain_verified,
    });
  } catch (error: any) {
    console.error('Custom domain update error:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update custom domain',
        message: error.message || 'An error occurred while updating your custom domain',
      },
      { status: 500 }
    );
  }
});
