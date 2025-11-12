import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { connections } from '@/db/schema/connections';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcard';
import { and, eq, or, count } from 'drizzle-orm';

/**
 * GET /api/cards/[userId]/connections
 * Get public connections for a specific user (no auth required for public viewing)
 * Returns a limited set of connections with basic info for display on public profiles
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
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

    // Get connections where user is the requester (limit to 5 for display)
    const connectionsAsRequester = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        url_slug: devcards.url_slug,
        github_username: devcards.github_username,
      })
      .from(connections)
      .innerJoin(users, eq(connections.recipient_id, users.id))
      .leftJoin(devcards, eq(users.id, devcards.user_id))
      .where(
        and(
          eq(connections.requester_id, userId),
          eq(connections.status, 'accepted')
        )
      )
      .limit(5);

    // Get connections where user is the recipient (limit to 5 for display)
    const connectionsAsRecipient = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        url_slug: devcards.url_slug,
        github_username: devcards.github_username,
      })
      .from(connections)
      .innerJoin(users, eq(connections.requester_id, users.id))
      .leftJoin(devcards, eq(users.id, devcards.user_id))
      .where(
        and(
          eq(connections.recipient_id, userId),
          eq(connections.status, 'accepted')
        )
      )
      .limit(5);

    // Combine and deduplicate connections
    const allConnections = [...connectionsAsRequester, ...connectionsAsRecipient];

    // Remove duplicates
    const uniqueConnections = Array.from(
      new Map(allConnections.map((conn) => [conn.id, conn])).values()
    );

    // Limit to 5 for display
    const displayConnections = uniqueConnections.slice(0, 5);

    // Format response
    const formattedConnections = displayConnections.map((conn) => ({
      username: conn.github_username || conn.name || 'user',
      avatarUrl: conn.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.id}`,
    }));

    return NextResponse.json(
      {
        count: total,
        developers: formattedConnections,
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
