import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { db } from '@/db';
import { connections } from '@/db/schema/connections';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcards';
import { and, eq, or, sql, count } from 'drizzle-orm';

/**
 * GET /api/connections
 * Retrieve user's accepted connections (network)
 * Query params:
 * - limit: number (1-100, default: 50)
 * - offset: number (min: 0, default: 0)
 */
export const GET = withAuthRequired(async (req, context) => {
  try {
    const userId = context.session.user.id;
    const { searchParams } = new URL(req.url);

    // Parse and validate pagination parameters
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '50', 10), 1),
      100
    );
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

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

    // Get connections where user is the requester
    const connectionsAsRequester = await db
      .select({
        // Connection info
        connected_at: connections.responded_at,
        // Connected user info (recipient)
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        // DevCard info
        url_slug: devcards.url_slug,
        custom_bio: devcards.custom_bio,
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
      .limit(limit)
      .offset(offset)
      .orderBy(connections.responded_at);

    // Get connections where user is the recipient
    const connectionsAsRecipient = await db
      .select({
        // Connection info
        connected_at: connections.responded_at,
        // Connected user info (requester)
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        // DevCard info
        url_slug: devcards.url_slug,
        custom_bio: devcards.custom_bio,
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
      .limit(limit)
      .offset(offset)
      .orderBy(connections.responded_at);

    // Combine and deduplicate connections
    const allConnections = [...connectionsAsRequester, ...connectionsAsRecipient];

    // Remove duplicates and format response
    const uniqueConnections = Array.from(
      new Map(allConnections.map((conn) => [conn.id, conn])).values()
    );

    // Sort by connected_at (most recent first)
    uniqueConnections.sort((a, b) => {
      const dateA = a.connected_at ? new Date(a.connected_at).getTime() : 0;
      const dateB = b.connected_at ? new Date(b.connected_at).getTime() : 0;
      return dateB - dateA;
    });

    // Apply pagination to the combined results
    const paginatedConnections = uniqueConnections.slice(offset, offset + limit);

    // Format response according to UserProfile schema
    const formattedConnections = paginatedConnections.map((conn) => ({
      id: conn.id,
      name: conn.name,
      github_username: conn.github_username,
      avatar_url: conn.image,
      url_slug: conn.url_slug,
      custom_bio: conn.custom_bio,
    }));

    return NextResponse.json(
      {
        connections: formattedConnections,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/connections:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve connections',
      },
      { status: 500 }
    );
  }
});
