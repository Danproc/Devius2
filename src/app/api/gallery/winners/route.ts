import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { eq, inArray, desc, sql } from 'drizzle-orm';

/**
 * GET /api/gallery/winners
 * Get all winning submissions across all hackathons (paginated, public)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const techFilter = searchParams.get('tech'); // Optional tech stack filter

    const offset = (page - 1) * perPage;

    // Build query for winners only
    let query = db
      .select({
        submission: hackathon_submissions,
        hackathon: {
          id: hackathons.id,
          title: hackathons.title,
          slug: hackathons.slug,
          theme: hackathons.theme,
        },
        creator: {
          id: users.id,
          name: users.name,
          github_username: users.github_username,
          image: users.image,
        },
      })
      .from(hackathon_submissions)
      .innerJoin(hackathons, eq(hackathon_submissions.hackathon_id, hackathons.id))
      .innerJoin(users, eq(hackathon_submissions.user_id, users.id))
      .where(
        inArray(hackathon_submissions.status, [
          'winner_first',
          'winner_second',
          'winner_third',
        ])
      )
      .$dynamic();

    // Apply tech stack filter if provided
    if (techFilter) {
      query = query.where(
        sql`${hackathon_submissions.tech_stack}::jsonb @> ${JSON.stringify([techFilter])}`
      );
    }

    // Get winners with pagination
    const winners = await query
      .orderBy(desc(hackathon_submissions.created_at))
      .limit(perPage)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(hackathon_submissions)
      .where(
        inArray(hackathon_submissions.status, [
          'winner_first',
          'winner_second',
          'winner_third',
        ])
      );

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      winners,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error: any) {
    console.error('Error fetching winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}
