import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_team_invites } from '@/db/schema/hackathon-team-invites';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/hackathons/teams/invites/me
 * Get all pending team invites for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all pending invites for the user with team, hackathon, and inviter details
    const invites = await db
      .select({
        invite: hackathon_team_invites,
        team: hackathon_teams,
        hackathon: hackathons,
        inviter: {
          id: users.id,
          name: users.name,
          github_username: users.github_username,
          image: users.image,
        },
      })
      .from(hackathon_team_invites)
      .innerJoin(hackathon_teams, eq(hackathon_team_invites.team_id, hackathon_teams.id))
      .innerJoin(hackathons, eq(hackathon_teams.hackathon_id, hackathons.id))
      .innerJoin(users, eq(hackathon_team_invites.inviter_user_id, users.id))
      .where(eq(hackathon_team_invites.invitee_user_id, session.user.id))
      .orderBy(desc(hackathon_team_invites.created_at));

    return NextResponse.json({ invites });
  } catch (error: any) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}
