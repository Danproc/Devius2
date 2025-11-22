import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { acceptRequest, declineRequest, blockUser } from '@/lib/connections/requests';
import { notifyConnectionAccepted } from '@/lib/connections/notifications';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';

/**
 * PATCH /api/connections/requests/[requesterId]
 * Accept, decline, or block a connection request
 * The requesterId is the ID of the user who sent the connection request
 */
export const PATCH = withAuthRequired(async (req, context) => {
  try {
    const userId = context.session.user.id;
    const params = await context.params;
    const requesterId = params.requesterId as string;

    if (!requesterId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'requesterId is required',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action } = body;

    // Validate action parameter
    const validActions = ['accept', 'decline', 'block'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid action. Must be one of: accept, decline, block',
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'accept': {
        // Accept the connection request
        result = await acceptRequest(requesterId, userId);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Not Found',
              message: result.error || 'Connection request not found',
            },
            { status: 404 }
          );
        }

        // Get user details for notification
        const accepter = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (accepter[0]) {
          const accepterName = accepter[0].name || 'A DevCard user';
          const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${accepter[0].github_username || accepter[0].id}`;

          // Send notification to requester (fire and forget)
          notifyConnectionAccepted(requesterId, accepterName, cardUrl).catch(
            (error) => {
              console.error('Failed to send connection accepted notification:', error);
            }
          );
        }

        break;
      }

      case 'decline': {
        // Decline the connection request
        result = await declineRequest(requesterId, userId);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Not Found',
              message: result.error || 'Connection request not found',
            },
            { status: 404 }
          );
        }

        break;
      }

      case 'block': {
        // Block the user (this also removes any existing connection)
        result = await blockUser(userId, requesterId);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Bad Request',
              message: result.error,
            },
            { status: 400 }
          );
        }

        // For block action, return a different response structure
        return NextResponse.json(
          {
            success: true,
            message: 'User blocked successfully',
          },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Invalid action',
          },
          { status: 400 }
        );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/connections/requests/[requesterId]:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to process connection request',
      },
      { status: 500 }
    );
  }
});
