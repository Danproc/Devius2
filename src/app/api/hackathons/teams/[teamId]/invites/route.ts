import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathon_team_invites } from '@/db/schema/hackathon-team-invites';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, and, sql } from 'drizzle-orm';
import { render } from '@react-email/components';
import sendMail from '@/lib/email/sendMail';
import TeamInvite from '@/emails/TeamInvite';

/**
 * POST /api/hackathons/teams/[teamId]/invites
 * Send team invite to a user by username
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Get team
    const [team] = await db
      .select()
      .from(hackathon_teams)
      .where(eq(hackathon_teams.id, teamId));

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is team creator
    if (team.creator_user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team creator can send invites' },
        { status: 403 }
      );
    }

    // Find invitee by username (github_username)
    const [invitee] = await db
      .select()
      .from(users)
      .where(eq(users.github_username, username));

    if (!invitee) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if invitee is Pro
    if (!invitee.is_premium || (invitee.premium_expires_at && new Date(invitee.premium_expires_at) < new Date())) {
      return NextResponse.json(
        { error: 'User must have Pro membership to join teams' },
        { status: 400 }
      );
    }

    // Check if inviting self
    if (invitee.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot invite yourself' },
        { status: 400 }
      );
    }

    // Check if already a team member
    const members = team.members as Array<{ user_id: string; joined_at: string }>;
    if (members.some(m => m.user_id === invitee.id)) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Check team size (max 5 members)
    if (members.length >= 5) {
      return NextResponse.json(
        { error: 'Team is full (maximum 5 members)' },
        { status: 400 }
      );
    }

    // Check if user already has pending invite
    const [existingInvite] = await db
      .select()
      .from(hackathon_team_invites)
      .where(
        and(
          eq(hackathon_team_invites.team_id, teamId),
          eq(hackathon_team_invites.invitee_user_id, invitee.id),
          eq(hackathon_team_invites.status, 'pending')
        )
      );

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invite already sent to this user' },
        { status: 400 }
      );
    }

    // Create invite
    const [invite] = await db
      .insert(hackathon_team_invites)
      .values({
        team_id: teamId,
        inviter_user_id: session.user.id,
        invitee_user_id: invitee.id,
        status: 'pending',
      })
      .returning();

    // Send email notification to invitee
    try {
      const [inviter] = await db.select().from(users).where(eq(users.id, session.user.id));
      const [hackathon] = await db.select().from(hackathons).where(eq(hackathons.id, team.hackathon_id));

      const html = await render(
        TeamInvite({
          inviteeName: invitee.name || invitee.github_username || 'Developer',
          inviterName: inviter.name || inviter.github_username || 'A teammate',
          teamName: team.team_name,
          hackathonTitle: hackathon.title,
          hackathonTheme: hackathon.theme,
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/hackathons/${hackathon.slug}`,
        })
      );

      await sendMail(invitee.email, `Team invitation for ${hackathon.title}`, html);
    } catch (emailError) {
      console.error('Failed to send team invite email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invite' },
      { status: 500 }
    );
  }
}
