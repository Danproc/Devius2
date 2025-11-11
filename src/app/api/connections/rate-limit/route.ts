import { NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getConnectionRateLimitStatus } from '@/lib/connections/rate-limit';

/**
 * GET /api/connections/rate-limit
 * Get current rate limit status for authenticated user
 * Does not consume a rate limit token
 */
export const GET = withAuthRequired(async (req, context) => {
  try {
    const userId = context.session.user.id;

    const rateLimitStatus = await getConnectionRateLimitStatus(userId);

    return NextResponse.json(
      {
        limit: rateLimitStatus.limit,
        remaining: rateLimitStatus.remaining,
        reset: rateLimitStatus.reset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/connections/rate-limit:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to get rate limit status',
      },
      { status: 500 }
    );
  }
});
