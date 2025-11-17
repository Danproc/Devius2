/**
 * Reusable database queries for StackPass Hackathons
 */

import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathon_votes } from '@/db/schema/hackathon-votes';
import { hackathon_badges } from '@/db/schema/hackathon-badges';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

/**
 * Get active and upcoming hackathons
 */
export async function getActiveHackathons() {
  return db
    .select()
    .from(hackathons)
    .where(inArray(hackathons.status, ['upcoming', 'active', 'voting']))
    .orderBy(hackathons.start_at);
}

/**
 * Get hackathon by ID
 */
export async function getHackathonById(id: string) {
  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.id, id))
    .limit(1);

  return hackathon;
}

/**
 * Get hackathon by slug
 */
export async function getHackathonBySlug(slug: string) {
  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.slug, slug))
    .limit(1);

  return hackathon;
}

/**
 * Get user's submission for a hackathon
 */
export async function getUserSubmission(hackathonId: string, userId: string) {
  // Check for solo submission
  const [soloSubmission] = await db
    .select()
    .from(hackathon_submissions)
    .where(
      and(
        eq(hackathon_submissions.hackathon_id, hackathonId),
        eq(hackathon_submissions.user_id, userId)
      )
    )
    .limit(1);

  if (soloSubmission) return soloSubmission;

  // Check for team submission
  const [teamSubmission] = await db
    .select()
    .from(hackathon_submissions)
    .innerJoin(hackathon_teams, eq(hackathon_submissions.team_id, hackathon_teams.id))
    .where(
      and(
        eq(hackathon_submissions.hackathon_id, hackathonId),
        sql`${hackathon_teams.members}::jsonb @> ${JSON.stringify([{ user_id: userId }])}`
      )
    )
    .limit(1);

  return teamSubmission?.hackathon_submissions;
}

/**
 * Get all submissions for a hackathon
 */
export async function getHackathonSubmissions(hackathonId: string) {
  return db
    .select()
    .from(hackathon_submissions)
    .where(eq(hackathon_submissions.hackathon_id, hackathonId))
    .orderBy(desc(hackathon_submissions.vote_count));
}

/**
 * Get user's vote on a submission
 */
export async function getUserVote(submissionId: string, userId: string) {
  const [vote] = await db
    .select()
    .from(hackathon_votes)
    .where(
      and(
        eq(hackathon_votes.submission_id, submissionId),
        eq(hackathon_votes.voter_user_id, userId)
      )
    )
    .limit(1);

  return vote;
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: string) {
  return db
    .select({
      badge: hackathon_badges,
      hackathon_title: hackathons.title,
      hackathon_slug: hackathons.slug,
      project_title: hackathon_submissions.project_title,
    })
    .from(hackathon_badges)
    .innerJoin(hackathons, eq(hackathon_badges.hackathon_id, hackathons.id))
    .innerJoin(hackathon_submissions, eq(hackathon_badges.submission_id, hackathon_submissions.id))
    .where(eq(hackathon_badges.user_id, userId))
    .orderBy(desc(hackathon_badges.awarded_at));
}

/**
 * Get badge summary for wallet pass (top 3 badges)
 */
export async function getBadgeSummary(userId: string): Promise<string> {
  const badges = await db
    .select()
    .from(hackathon_badges)
    .where(eq(hackathon_badges.user_id, userId))
    .orderBy(desc(hackathon_badges.awarded_at))
    .limit(3);

  if (badges.length === 0) return '';

  const counts = {
    gold: badges.filter(b => b.badge_type === 'gold').length,
    silver: badges.filter(b => b.badge_type === 'silver').length,
    bronze: badges.filter(b => b.badge_type === 'bronze').length,
  };

  const total = badges.length;

  if (counts.gold > 0) {
    if (total === 1) return 'Hackathon Winner (Gold)';
    const parts = [];
    if (counts.gold) parts.push(`${counts.gold} Gold`);
    if (counts.silver) parts.push(`${counts.silver} Silver`);
    if (counts.bronze) parts.push(`${counts.bronze} Bronze`);
    return `${total}x Winner: ${parts.join(', ')}`;
  }

  return `${total}x Hackathon Participant`;
}

/**
 * Get all winners for gallery (paginated)
 */
export async function getGalleryWinners(page: number = 1, perPage: number = 20) {
  const offset = (page - 1) * perPage;

  return db
    .select()
    .from(hackathon_submissions)
    .innerJoin(hackathons, eq(hackathon_submissions.hackathon_id, hackathons.id))
    .where(sql`${hackathon_submissions.placement} IS NOT NULL`)
    .orderBy(desc(hackathons.start_at), hackathon_submissions.placement)
    .limit(perPage)
    .offset(offset);
}

/**
 * Check if user is on submission's team
 */
export async function isUserOnSubmissionTeam(submissionId: string, userId: string): Promise<boolean> {
  const [submission] = await db
    .select()
    .from(hackathon_submissions)
    .where(eq(hackathon_submissions.id, submissionId))
    .limit(1);

  if (!submission) return false;
  if (!submission.team_id) {
    // Solo submission
    return submission.user_id === userId;
  }

  // Team submission - check if user in members array
  const [team] = await db
    .select()
    .from(hackathon_teams)
    .where(eq(hackathon_teams.id, submission.team_id))
    .limit(1);

  if (!team) return false;

  const members = team.members as Array<{ user_id: string; joined_at: string }>;
  return members.some(m => m.user_id === userId);
}
