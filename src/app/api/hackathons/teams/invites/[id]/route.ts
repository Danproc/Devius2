import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathon_team_invites } from '@/db/schema/hackathon-team-invites';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/hackathons/teams/invites/[id]/accept
 * Accept a team invite
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

    const { id: inviteId } = await params;

    // Get invite
    const [invite] = await db
      .select()
      .from(hackathon_team_invites)
      .where(eq(hackathon_team_invites.id, inviteId));

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user is the invitee
    if (invite.invitee_user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'This invite is not for you' },
        { status: 403 }
      );
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invite has already been responded to' },
        { status: 400 }
      );
    }

    // Get team
    const [team] = await db
      .select()
      .from(hackathon_teams)
      .where(eq(hackathon_teams.id, invite.team_id));

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check team size
    const members = team.members as Array<{ user_id: string; joined_at: string }>;
    if (members.length >= 5) {
      return NextResponse.json(
        { error: 'Team is full (maximum 5 members)' },
        { status: 400 }
      );
    }

    // Add user to team members
    const updatedMembers = [
      ...members,
      {
        user_id: session.user.id,
        joined_at: new Date().toISOString(),
      },
    ];

    // Update team and invite in transaction
    await db.transaction(async (tx) => {
      // Update team members
      await tx
        .update(hackathon_teams)
        .set({
          members: updatedMembers,
          updated_at: new Date(),
        })
        .where(eq(hackathon_teams.id, invite.team_id));

      // Update invite status
      await tx
        .update(hackathon_team_invites)
        .set({
          status: 'accepted',
          responded_at: new Date(),
        })
        .where(eq(hackathon_team_invites.id, inviteId));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept invite' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hackathons/teams/invites/[id]
 * Decline a team invite
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: inviteId } = await params;

    // Get invite
    const [invite] = await db
      .select()
      .from(hackathon_team_invites)
      .where(eq(hackathon_team_invites.id, inviteId));

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user is the invitee
    if (invite.invitee_user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'This invite is not for you' },
        { status: 403 }
      );
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invite has already been responded to' },
        { status: 400 }
      );
    }

    // Update invite status to declined
    await db
      .update(hackathon_team_invites)
      .set({
        status: 'declined',
        responded_at: new Date(),
      })
      .where(eq(hackathon_team_invites.id, inviteId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error declining invite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to decline invite' },
      { status: 500 }
    );
  }
}
