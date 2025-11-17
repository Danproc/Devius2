/**
 * GET /api/hackathons/[id]/judging - Get submissions for judging (admin only)
 * Returns all submissions with vote counts and team details
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { users } from '@/db/schema/user';
import { requireAdmin } from '@/middleware/admin-auth';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    // Verify hackathon exists
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, id))
      .limit(1);

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Get all submissions with team and user details
    const submissions = await db
      .select({
        submission: hackathon_submissions,
        team: hackathon_teams,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          github_username: users.github_username,
        },
      })
      .from(hackathon_submissions)
      .leftJoin(hackathon_teams, eq(hackathon_submissions.team_id, hackathon_teams.id))
      .leftJoin(users, eq(hackathon_submissions.user_id, users.id))
      .where(eq(hackathon_submissions.hackathon_id, id))
      .orderBy(hackathon_submissions.vote_count);

    return NextResponse.json({
      hackathon,
      submissions,
      total: submissions.length,
    });
  } catch (error: any) {
    console.error('Error fetching judging data:', error);

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch judging data', message: error.message },
      { status: 500 }
    );
  }
}
