import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, and, sql } from 'drizzle-orm';
import { getUserRegistration } from '@/lib/hackathons/queries';
import { isRegistrationPeriodActive } from '@/lib/hackathons/validations';

/**
 * POST /api/hackathons/[id]/teams
 * Create a team for a hackathon
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: hackathonId } = await params;
    const body = await req.json();
    const { team_name } = body;

    // Check hackathon exists
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check if hackathon allows team formation (time-based)
    const now = new Date();
    const isRegistrationOpen = hackathon.registration_start_at && hackathon.registration_end_at
      ? isRegistrationPeriodActive(new Date(hackathon.registration_start_at), new Date(hackathon.registration_end_at))
      : false;
    const isHackathonActive = hackathon.status === 'active';
    const submissionDeadline = new Date(hackathon.submission_deadline_at);

    if (!isRegistrationOpen && !isHackathonActive) {
      return NextResponse.json(
        { error: 'Can only form teams during registration period or active hackathon' },
        { status: 400 }
      );
    }

    // During active phase, check submission deadline hasn't passed
    if (isHackathonActive && now > submissionDeadline) {
      return NextResponse.json(
        { error: 'Cannot form teams after submission deadline' },
        { status: 400 }
      );
    }

    // Check if user is Pro
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!user?.is_premium || (user.premium_expires_at && new Date(user.premium_expires_at) < new Date())) {
      return NextResponse.json(
        { error: 'Pro membership required' },
        { status: 403 }
      );
    }

    // Check if user is registered
    if (hackathon.registration_start_at && hackathon.registration_end_at) {
      const registration = await getUserRegistration(hackathonId, session.user.id);
      if (!registration) {
        return NextResponse.json(
          { error: 'You must be registered to form a team' },
          { status: 403 }
        );
      }
    }

    // Check if user is already on a team for this hackathon
    const existingTeams = await db
      .select()
      .from(hackathon_teams)
      .where(
        and(
          eq(hackathon_teams.hackathon_id, hackathonId),
          sql`${hackathon_teams.members}::jsonb @> ${JSON.stringify([{ user_id: session.user.id }])}`
        )
      );

    if (existingTeams.length > 0) {
      return NextResponse.json(
        { error: 'You are already part of a team for this hackathon' },
        { status: 400 }
      );
    }

    // Create team with creator as first member
    const [team] = await db
      .insert(hackathon_teams)
      .values({
        hackathon_id: hackathonId,
        creator_user_id: session.user.id,
        team_name: team_name || null,
        members: [
          {
            user_id: session.user.id,
            joined_at: new Date().toISOString(),
          },
        ],
      })
      .returning();

    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hackathons/[id]/teams
 * Get all teams for a hackathon
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;

    const teams = await db
      .select()
      .from(hackathon_teams)
      .where(eq(hackathon_teams.hackathon_id, hackathonId));

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
