import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { sendConnectionRequest } from '@/lib/connections/requests';
import { checkConnectionRateLimit } from '@/lib/connections/rate-limit';
import { notifyConnectionRequest } from '@/lib/connections/notifications';
import { db } from '@/db';
import { connections } from '@/db/schema/connections';
import { users } from '@/db/schema/user';
import { and, eq, or } from 'drizzle-orm';

/**
 * POST /api/connections/requests
 * Send a connection request to another DevCard user
 * Rate limited to 20 requests per hour
 */
export const POST = withAuthRequired(async (req, context) => {
  try {
    const userId = context.session.user.id;
    const body = await req.json();

    // Validate request body
    const { recipient_id, message } = body;

    if (!recipient_id) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'recipient_id is required',
        },
        { status: 400 }
      );
    }

    // Validate message length if provided
    if (message && message.length > 500) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Message must be 500 characters or less',
        },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkConnectionRateLimit(userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate Limit Exceeded',
          message: 'You can send up to 20 connection requests per hour',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Send connection request
    const result = await sendConnectionRequest(userId, recipient_id, message);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: result.error,
        },
        { status: 400 }
      );
    }

    // Get requester's details for notification
    const requester = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (requester[0]) {
      const requesterName = requester[0].name || 'A DevCard user';
      const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://devius.io'}/app/network/requests`;

      // Send notifications (fire and forget, don't block response)
      notifyConnectionRequest(
        recipient_id,
        userId,
        requesterName,
        cardUrl,
        message
      ).catch((error) => {
        console.error('Failed to send connection notification:', error);
      });
    }

    return NextResponse.json(result.data, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/connections/requests:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to send connection request',
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/connections/requests
 * Retrieve connection requests for authenticated user
 * Query params:
 * - status: 'pending' | 'accepted' | 'declined' (default: 'pending')
 */
export const GET = withAuthRequired(async (req, context) => {
  try {
    const userId = context.session.user.id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    // Validate status parameter
    const validStatuses = ['pending', 'accepted', 'declined'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid status parameter. Must be one of: pending, accepted, declined',
        },
        { status: 400 }
      );
    }

    // Get connection requests where user is either the requester or recipient
    // For pending requests, we want to show requests TO this user (where they're the recipient)
    // For accepted/declined, we might want to show all connections where user is involved

    const requestsAsRecipient = await db
      .select({
        requester_id: connections.requester_id,
        recipient_id: connections.recipient_id,
        status: connections.status,
        message: connections.message,
        requested_at: connections.requested_at,
        responded_at: connections.responded_at,
        // Include requester details
        requester_name: users.name,
        requester_email: users.email,
        requester_image: users.image,
      })
      .from(connections)
      .leftJoin(users, eq(connections.requester_id, users.id))
      .where(
        and(
          eq(connections.recipient_id, userId),
          eq(connections.status, status as 'pending' | 'accepted' | 'declined')
        )
      )
      .orderBy(connections.requested_at);

    const requestsAsSender = await db
      .select({
        requester_id: connections.requester_id,
        recipient_id: connections.recipient_id,
        status: connections.status,
        message: connections.message,
        requested_at: connections.requested_at,
        responded_at: connections.responded_at,
        // Include recipient details
        recipient_name: users.name,
        recipient_email: users.email,
        recipient_image: users.image,
      })
      .from(connections)
      .leftJoin(users, eq(connections.recipient_id, users.id))
      .where(
        and(
          eq(connections.requester_id, userId),
          eq(connections.status, status as 'pending' | 'accepted' | 'declined')
        )
      )
      .orderBy(connections.requested_at);

    // Combine and format results
    const allRequests = [
      ...requestsAsRecipient.map((r) => ({
        ...r,
        direction: 'received' as const,
      })),
      ...requestsAsSender.map((r) => ({
        ...r,
        direction: 'sent' as const,
      })),
    ];

    return NextResponse.json(
      {
        requests: allRequests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/connections/requests:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve connection requests',
      },
      { status: 500 }
    );
  }
});
