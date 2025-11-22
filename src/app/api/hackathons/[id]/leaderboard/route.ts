import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathon_scores } from '@/db/schema/hackathon-scores';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';

/**
 * GET /api/hackathons/[id]/leaderboard
 * Get all submissions with their scores and user/team info for a completed hackathon
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;

    // Fetch all submissions with user info
    const submissions = await db
      .select({
        submission: hackathon_submissions,
        user: users,
        devcard: devcards,
      })
      .from(hackathon_submissions)
      .innerJoin(users, eq(hackathon_submissions.user_id, users.id))
      .leftJoin(devcards, eq(users.id, devcards.user_id))
      .where(eq(hackathon_submissions.hackathon_id, hackathonId));

    // Fetch scores for all submissions (aggregate if multiple judges)
    const leaderboard = await Promise.all(
      submissions.map(async (entry) => {
        // Get team info if this is a team submission
        let team = null;
        if (entry.submission.team_id) {
          const [teamData] = await db
            .select()
            .from(hackathon_teams)
            .where(eq(hackathon_teams.id, entry.submission.team_id));
          team = teamData;
        }

        // Get all scores for this submission
        const scores = await db
          .select()
          .from(hackathon_scores)
          .where(eq(hackathon_scores.submission_id, entry.submission.id));

        // Calculate average score if multiple judges, or use single score
        let avgScore = null;
        if (scores.length > 0) {
          const totals = scores.reduce(
            (acc, score) => ({
              innovation: acc.innovation + score.innovation,
              technical_execution: acc.technical_execution + score.technical_execution,
              design_ux: acc.design_ux + score.design_ux,
              completeness: acc.completeness + score.completeness,
              total_score: acc.total_score + score.total_score,
            }),
            { innovation: 0, technical_execution: 0, design_ux: 0, completeness: 0, total_score: 0 }
          );

          avgScore = {
            innovation: Math.round(totals.innovation / scores.length),
            technical_execution: Math.round(totals.technical_execution / scores.length),
            design_ux: Math.round(totals.design_ux / scores.length),
            completeness: Math.round(totals.completeness / scores.length),
            total_score: Math.round(totals.total_score / scores.length),
          };
        }

        return {
          submission: entry.submission,
          user: entry.user,
          devcard: entry.devcard,
          team,
          score: avgScore,
        };
      })
    );

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
