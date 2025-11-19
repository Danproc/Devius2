/**
 * Database mutation functions for hackathons
 */

import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { hackathon_badges } from '@/db/schema/hackathon-badges';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathon_votes } from '@/db/schema/hackathon-votes';
import { eq, and, sql } from 'drizzle-orm';
import type { CreateHackathonInput } from '@/types/hackathons';

/**
 * Create a new hackathon
 */
export async function createHackathon(input: CreateHackathonInput, createdBy: string) {
  const [hackathon] = await db.insert(hackathons).values({
    slug: input.slug,
    title: input.title,
    theme: input.theme,
    description: input.description,
    rules: input.rules,
    start_at: new Date(input.start_at),
    submission_deadline_at: new Date(input.submission_deadline_at),
    voting_start_at: input.voting_start_at ? new Date(input.voting_start_at) : null,
    voting_end_at: input.voting_end_at ? new Date(input.voting_end_at) : null,
    prizes: input.prizes,
    max_participants: input.max_participants,
    created_by: createdBy,
  }).returning();

  return hackathon;
}

/**
 * Declare winners and award badges
 */
export async function declareWinners(
  hackathonId: string,
  firstPlaceId?: string,
  secondPlaceId?: string,
  thirdPlaceId?: string
) {
  const badges: any[] = [];

  // Award 1st place
  if (firstPlaceId) {
    const awarded = await awardBadge(hackathonId, firstPlaceId, 'gold', 1);
    badges.push(...awarded);
  }

  // Award 2nd place
  if (secondPlaceId) {
    const awarded = await awardBadge(hackathonId, secondPlaceId, 'silver', 2);
    badges.push(...awarded);
  }

  // Award 3rd place
  if (thirdPlaceId) {
    const awarded = await awardBadge(hackathonId, thirdPlaceId, 'bronze', 3);
    badges.push(...awarded);
  }

  // Update hackathon status
  await db
    .update(hackathons)
    .set({ status: 'completed', updated_at: new Date() })
    .where(eq(hackathons.id, hackathonId));

  return badges;
}

/**
 * Award badge to submission (all team members)
 */
async function awardBadge(
  hackathonId: string,
  submissionId: string,
  badgeType: 'gold' | 'silver' | 'bronze',
  placement: number
) {
  // Get submission
  const [submission] = await db
    .select()
    .from(hackathon_submissions)
    .where(eq(hackathon_submissions.id, submissionId))
    .limit(1);

  if (!submission) return [];

  // Update submission
  await db
    .update(hackathon_submissions)
    .set({
      status: `winner_${badgeType === 'gold' ? 'first' : badgeType === 'silver' ? 'second' : 'third'}` as any,
      placement,
    })
    .where(eq(hackathon_submissions.id, submissionId));

  // Get user IDs
  let userIds = [submission.user_id];

  if (submission.team_id) {
    const [team] = await db
      .select()
      .from(hackathon_teams)
      .where(eq(hackathon_teams.id, submission.team_id))
      .limit(1);

    if (team) {
      const members = team.members as Array<{ user_id: string }>;
      userIds = members.map(m => m.user_id);
    }
  }

  // Create badges
  const createdBadges = [];
  for (const userId of userIds) {
    const [badge] = await db
      .insert(hackathon_badges)
      .values({
        user_id: userId,
        hackathon_id: hackathonId,
        submission_id: submissionId,
        badge_type: badgeType,
      })
      .returning();

    createdBadges.push(badge);
  }

  return createdBadges;
}

/**
 * Increment vote count on submission
 */
export async function incrementVoteCount(submissionId: string) {
  await db
    .update(hackathon_submissions)
    .set({
      vote_count: sql`vote_count + 1`,
    })
    .where(eq(hackathon_submissions.id, submissionId));
}

/**
 * Decrement vote count on submission
 */
export async function decrementVoteCount(submissionId: string) {
  await db
    .update(hackathon_submissions)
    .set({
      vote_count: sql`GREATEST(vote_count - 1, 0)`, // Don't go below 0
    })
    .where(eq(hackathon_submissions.id, submissionId));
}
