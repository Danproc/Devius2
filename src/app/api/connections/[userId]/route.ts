import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { db } from '@/db';
import { connections } from '@/db/schema/connections';
import { and, eq, or } from 'drizzle-orm';

/**
 * GET /api/connections/[userId]
 * Check connection status with a specific user
 */
export const GET = withAuthRequired(async (req, context) => {
  try {
    const currentUserId = context.session.user.id;
    const params = await context.params;
    const userId = params.userId as string;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Check if viewing own profile
    if (currentUserId === userId) {
      return NextResponse.json(
        {
          status: null,
          isOwnCard: true,
        },
        { status: 200 }
      );
    }

    // Find connection in either direction
    const connection = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.requester_id, currentUserId),
            eq(connections.recipient_id, userId)
          ),
          and(
            eq(connections.requester_id, userId),
            eq(connections.recipient_id, currentUserId)
          )
        )
      )
      .limit(1);

    if (connection.length === 0) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'No connection found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: connection[0].status,
        isOwnCard: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/connections/[userId]:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to check connection status',
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/connections/[userId]
 * Remove an accepted connection
 * The userId is the ID of the connected user to be removed
 */
export const DELETE = withAuthRequired(async (req, context) => {
  try {
    const currentUserId = context.session.user.id;
    const params = await context.params;
    const userId = params.userId as string;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Prevent self-removal
    if (currentUserId === userId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Cannot remove connection with yourself',
        },
        { status: 400 }
      );
    }

    // Delete the connection (check both directions)
    // Connection can exist in either direction: (currentUser, otherUser) or (otherUser, currentUser)
    const deleted = await db
      .delete(connections)
      .where(
        and(
          or(
            and(
              eq(connections.requester_id, currentUserId),
              eq(connections.recipient_id, userId)
            ),
            and(
              eq(connections.requester_id, userId),
              eq(connections.recipient_id, currentUserId)
            )
          ),
          eq(connections.status, 'accepted')
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Connection not found or not accepted',
        },
        { status: 404 }
      );
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/connections/[userId]:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to remove connection',
      },
      { status: 500 }
    );
  }
});
