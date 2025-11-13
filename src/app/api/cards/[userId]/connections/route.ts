import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { connections } from '@/db/schema/connections';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcard';
import { and, eq, or, count } from 'drizzle-orm';

/**
 * GET /api/cards/[userId]/connections
 * Retrieve connection count and top 5 connected developers for a user's devcard
 * Public endpoint - no auth required (for displaying on devcard)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get total count of accepted connections
    const totalResult = await db
      .select({ count: count() })
      .from(connections)
      .where(
        and(
          or(
            eq(connections.requester_id, userId),
            eq(connections.recipient_id, userId)
          ),
          eq(connections.status, 'accepted')
        )
      );

    const total = totalResult[0]?.count || 0;

    // If no connections, return early
    if (total === 0) {
      return NextResponse.json(
        {
          count: 0,
          developers: [],
        },
        { status: 200 }
      );
    }

    // Get up to 5 connections where user is the requester
    const connectionsAsRequester = await db
      .select({
        id: users.id,
        username: users.github_username,
        avatarUrl: users.image,
        url_slug: devcards.url_slug,
        connected_at: connections.responded_at,
      })
      .from(connections)
      .innerJoin(users, eq(connections.recipient_id, users.id))
      .innerJoin(devcards, eq(users.id, devcards.user_id))
      .where(
        and(
          eq(connections.requester_id, userId),
          eq(connections.status, 'accepted')
        )
      )
      .limit(5)
      .orderBy(connections.responded_at);

    // Get up to 5 connections where user is the recipient
    const connectionsAsRecipient = await db
      .select({
        id: users.id,
        username: users.github_username,
        avatarUrl: users.image,
        url_slug: devcards.url_slug,
        connected_at: connections.responded_at,
      })
      .from(connections)
      .innerJoin(users, eq(connections.requester_id, users.id))
      .innerJoin(devcards, eq(users.id, devcards.user_id))
      .where(
        and(
          eq(connections.recipient_id, userId),
          eq(connections.status, 'accepted')
        )
      )
      .limit(5)
      .orderBy(connections.responded_at);

    // Combine and deduplicate connections
    const allConnections = [...connectionsAsRequester, ...connectionsAsRecipient];

    // Remove duplicates based on user id
    const uniqueConnections = Array.from(
      new Map(allConnections.map((conn) => [conn.id, conn])).values()
    );

    // Sort by connected_at (most recent first) and take top 5
    uniqueConnections.sort((a, b) => {
      const dateA = a.connected_at ? new Date(a.connected_at).getTime() : 0;
      const dateB = b.connected_at ? new Date(b.connected_at).getTime() : 0;
      return dateB - dateA;
    });

    const top5Connections = uniqueConnections.slice(0, 5);

    // Format response for the ConnectedDevelopers component
    const formattedDevelopers = top5Connections.map((conn) => ({
      username: conn.username || 'unknown',
      avatarUrl: conn.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.id}`,
      url_slug: conn.url_slug || conn.username?.toLowerCase() || 'unknown',
    }));

    return NextResponse.json(
      {
        count: total,
        developers: formattedDevelopers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/cards/[userId]/connections:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve connections',
      },
      { status: 500 }
    );
  }
}
