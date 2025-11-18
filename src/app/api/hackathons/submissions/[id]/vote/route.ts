import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathon_votes } from '@/db/schema/hackathon-votes';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, and, sql } from 'drizzle-orm';
import { isVotingPeriodActive } from '@/lib/hackathons/validations';

/**
 * POST /api/hackathons/submissions/[id]/vote
 * Cast a vote for a submission
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

    const { id: submissionId } = await params;

    // Check if user is Pro
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user?.is_premium || (user.premium_expires_at && new Date(user.premium_expires_at) < new Date())) {
      return NextResponse.json(
        { error: 'Pro membership required to vote' },
        { status: 403 }
      );
    }

    // Get submission
    const [submission] = await db
      .select()
      .from(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Only allow voting on submitted projects
    if (submission.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Can only vote on submitted projects' },
        { status: 400 }
      );
    }

    // Get hackathon
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, submission.hackathon_id));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check if voting is active
    if (
      !isVotingPeriodActive(
        hackathon.voting_start_at ? new Date(hackathon.voting_start_at) : null,
        hackathon.voting_end_at ? new Date(hackathon.voting_end_at) : null
      )
    ) {
      return NextResponse.json(
        { error: 'Voting is not currently active for this hackathon' },
        { status: 400 }
      );
    }

    // Check if user is voting on their own submission (solo)
    if (submission.user_id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own submission' },
        { status: 400 }
      );
    }

    // Check if user is voting on their team's submission
    if (submission.team_id) {
      const [team] = await db
        .select()
        .from(hackathon_teams)
        .where(eq(hackathon_teams.id, submission.team_id));

      if (team) {
        const members = team.members as Array<{ user_id: string; joined_at: string }>;
        const isTeamMember = members.some((m) => m.user_id === session.user.id);

        if (isTeamMember) {
          return NextResponse.json(
            { error: 'Cannot vote on your own team\'s submission' },
            { status: 400 }
          );
        }
      }
    }

    // Check if user already voted for this submission
    const [existingVote] = await db
      .select()
      .from(hackathon_votes)
      .where(
        and(
          eq(hackathon_votes.submission_id, submissionId),
          eq(hackathon_votes.voter_user_id, session.user.id)
        )
      );

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this submission' },
        { status: 400 }
      );
    }

    // Create vote and increment vote count in transaction
    await db.transaction(async (tx) => {
      // Create vote record
      await tx.insert(hackathon_votes).values({
        submission_id: submissionId,
        voter_user_id: session.user.id,
        hackathon_id: submission.hackathon_id,
      });

      // Increment vote count
      await tx
        .update(hackathon_submissions)
        .set({
          vote_count: sql`${hackathon_submissions.vote_count} + 1`,
          updated_at: new Date(),
        })
        .where(eq(hackathon_submissions.id, submissionId));
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hackathons/submissions/[id]/vote
 * Remove a vote from a submission
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

    const { id: submissionId } = await params;

    // Get submission
    const [submission] = await db
      .select()
      .from(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Get hackathon
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, submission.hackathon_id));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check if voting is still active
    if (
      !isVotingPeriodActive(
        hackathon.voting_start_at ? new Date(hackathon.voting_start_at) : null,
        hackathon.voting_end_at ? new Date(hackathon.voting_end_at) : null
      )
    ) {
      return NextResponse.json(
        { error: 'Voting is not currently active for this hackathon' },
        { status: 400 }
      );
    }

    // Get existing vote
    const [existingVote] = await db
      .select()
      .from(hackathon_votes)
      .where(
        and(
          eq(hackathon_votes.submission_id, submissionId),
          eq(hackathon_votes.voter_user_id, session.user.id)
        )
      );

    if (!existingVote) {
      return NextResponse.json(
        { error: 'You have not voted for this submission' },
        { status: 400 }
      );
    }

    // Delete vote and decrement vote count in transaction
    await db.transaction(async (tx) => {
      // Delete vote record
      await tx
        .delete(hackathon_votes)
        .where(eq(hackathon_votes.id, existingVote.id));

      // Decrement vote count (ensure it doesn't go below 0)
      await tx
        .update(hackathon_submissions)
        .set({
          vote_count: sql`GREATEST(0, ${hackathon_submissions.vote_count} - 1)`,
          updated_at: new Date(),
        })
        .where(eq(hackathon_submissions.id, submissionId));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove vote' },
      { status: 500 }
    );
  }
}
