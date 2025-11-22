import { db } from "@/db";
import { devcards } from "@/db/schema/devcard";
import { users } from "@/db/schema/user";
import { user_achievements } from "@/db/schema/user-achievements";
import { hackathon_badges } from "@/db/schema/hackathon-badges";
import { hackathons } from "@/db/schema/hackathons";
import { and, or, eq, like, desc, asc, sql, isNotNull, inArray } from "drizzle-orm";
import { SearchMembersParams, MemberSummary, HackathonBadgeSummary } from "@/lib/members/types";

/**
 * Search members with pagination and filters
 * T004: Main query for member directory
 */
export async function searchMembers(params: SearchMembersParams) {
  const { search, location, tech_stack, achievement_types, winners_only, page, limit, sort = 'newest' } = params;
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions = [eq(devcards.is_public, true)]; // Only public profiles

  // Text search (name or username)
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        like(users.name, searchTerm),
        like(devcards.github_username, searchTerm),
        like(devcards.display_name, searchTerm)
      )!
    );
  }

  // Location filter
  if (location && location.trim()) {
    conditions.push(like(devcards.location, `%${location.trim()}%`));
  }

  // Tech stack filter (JSONB array contains)
  if (tech_stack && tech_stack.length > 0) {
    conditions.push(
      sql`${devcards.tech_stack} @> ${JSON.stringify(tech_stack)}::jsonb`
    );
  }

  // Achievement type filter
  if (achievement_types && achievement_types.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM user_achievements
        WHERE user_achievements.user_id = ${devcards.user_id}
        AND user_achievements.achievement_type = ANY(${achievement_types})
      )`
    );
  }

  // Hackathon winners only filter
  if (winners_only) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM hackathon_badges
        WHERE hackathon_badges.user_id = ${devcards.user_id}
      )`
    );
  }

  const whereClause = and(...conditions);

  // Determine sort order (by member_number: newest first = DESC, oldest first = ASC)
  const orderBy = sort === 'oldest'
    ? asc(devcards.member_number)
    : desc(devcards.member_number);

  // Execute parallel queries for members list and total count
  const [membersList, totalCountResult] = await Promise.all([
    // Get members
    db
      .select({
        id: devcards.id,
        user_id: devcards.user_id,
        url_slug: devcards.url_slug,
        display_name: devcards.display_name,
        github_username: devcards.github_username,
        avatar_url: devcards.avatar_url,
        location: devcards.location,
        custom_bio: devcards.custom_bio,
        tech_stack: devcards.tech_stack,
        member_number: devcards.member_number,
        availability_status: devcards.availability_status,
        is_public: devcards.is_public,
        created_at: devcards.created_at,
        user_name: users.name, // Fallback name
      })
      .from(devcards)
      .innerJoin(users, eq(devcards.user_id, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    // Get total count
    db
      .select({ count: sql<number>`count(*)` })
      .from(devcards)
      .innerJoin(users, eq(devcards.user_id, users.id))
      .where(whereClause)
      .then((res) => Number(res[0]?.count || 0))
  ]);

  // Get user IDs for fetching achievements and badges
  const userIds = membersList.map(m => m.user_id);

  // Fetch achievements and badges in parallel
  const [achievementCounts, badgesByUser] = await Promise.all([
    getMembersWithAchievements(userIds),
    getHackathonBadges(userIds),
  ]);

  // Combine data into MemberSummary objects
  const members: MemberSummary[] = membersList.map(member => ({
    id: member.id,
    user_id: member.user_id,
    url_slug: member.url_slug,
    display_name: member.display_name,
    github_username: member.github_username,
    avatar_url: member.avatar_url,
    location: member.location,
    custom_bio: member.custom_bio,
    tech_stack: member.tech_stack,
    member_number: member.member_number,
    availability_status: member.availability_status,
    is_public: member.is_public,
    created_at: member.created_at,
    achievement_count: achievementCounts.get(member.user_id) || 0,
    hackathon_badges: badgesByUser.get(member.user_id) || [],
  }));

  return {
    membersList: members,
    totalCount: totalCountResult,
  };
}

/**
 * Get achievement count per member
 * T006: Helper function for achievement aggregation
 */
export async function getMembersWithAchievements(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const achievements = await db
    .select({
      user_id: user_achievements.user_id,
      count: sql<number>`count(*)`,
    })
    .from(user_achievements)
    .where(inArray(user_achievements.user_id, userIds))
    .groupBy(user_achievements.user_id);

  // Map user_id to achievement count
  return new Map(
    achievements.map(a => [a.user_id, Number(a.count)])
  );
}

/**
 * Get hackathon badges per member
 * T007: Helper function for hackathon badge fetching
 */
export async function getHackathonBadges(userIds: string[]): Promise<Map<string, HackathonBadgeSummary[]>> {
  if (userIds.length === 0) return new Map();

  const badges = await db
    .select({
      user_id: hackathon_badges.user_id,
      badge_type: hackathon_badges.badge_type,
      hackathon_name: hackathons.title,
      earned_at: hackathon_badges.awarded_at,
    })
    .from(hackathon_badges)
    .innerJoin(hackathons, eq(hackathon_badges.hackathon_id, hackathons.id))
    .where(inArray(hackathon_badges.user_id, userIds))
    .orderBy(desc(hackathon_badges.awarded_at));

  // Group badges by user_id
  const badgesByUser = new Map<string, HackathonBadgeSummary[]>();

  for (const badge of badges) {
    const userBadges = badgesByUser.get(badge.user_id) || [];
    userBadges.push({
      badge_type: badge.badge_type as 'gold' | 'silver' | 'bronze',
      hackathon_name: badge.hackathon_name,
      earned_at: badge.earned_at,
    });
    badgesByUser.set(badge.user_id, userBadges);
  }

  return badgesByUser;
}

/**
 * Get unique filter options for the member directory
 * T005: Filter options query
 */
export async function getFilterOptions() {
  // Get unique locations (where not null and is_public)
  const locationsResult = await db
    .selectDistinct({ location: devcards.location })
    .from(devcards)
    .where(
      and(
        eq(devcards.is_public, true),
        isNotNull(devcards.location)
      )
    )
    .orderBy(asc(devcards.location));

  const locations = locationsResult
    .map(l => l.location)
    .filter((loc): loc is string => loc !== null);

  // Get unique technologies (flatten JSONB arrays)
  const techStacksResult = await db
    .select({ tech_stack: devcards.tech_stack })
    .from(devcards)
    .where(
      and(
        eq(devcards.is_public, true),
        isNotNull(devcards.tech_stack)
      )
    );

  // Flatten and deduplicate technologies
  const allTechs = techStacksResult.flatMap(row => row.tech_stack || []);
  const uniqueTechs = Array.from(new Set(allTechs)).sort();

  // Get achievement types (from all users, not just public profiles)
  const achievementsResult = await db
    .selectDistinct({ type: user_achievements.achievement_type })
    .from(user_achievements)
    .orderBy(asc(user_achievements.achievement_type));

  const achievementTypes = achievementsResult.map(a => a.type);

  return {
    locations,
    technologies: uniqueTechs,
    achievement_types: achievementTypes,
  };
}

/**
 * Update directory visibility for a user
 * T023 (for Phase 6): Privacy control query
 */
export async function updateDirectoryVisibility(userId: string, isPublic: boolean) {
  const result = await db
    .update(devcards)
    .set({
      is_public: isPublic,
      updated_at: new Date()
    })
    .where(eq(devcards.user_id, userId))
    .returning({ is_public: devcards.is_public });

  return result[0];
}
