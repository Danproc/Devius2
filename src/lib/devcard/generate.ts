/**
 * DevCard Generation
 *
 * Functions to automatically generate DevCards from GitHub data.
 * Creates a DevCard with profile information, repositories, and statistics.
 */

import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { github_cache } from '@/db/schema/github-cache';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';
import { generateCardUrl } from './url-utils';
import {
  fetchGitHubProfile,
  fetchUserRepositories,
  fetchGitHubOrganizations,
  calculateCompleteStats,
  simplifyRepositories,
  calculateLanguageStats,
  getMostStarredRepo,
  getTopLanguages,
  LANGUAGE_COLORS,
  cacheGitHubProfile,
  cacheGitHubRepos,
  cacheGitHubStats,
  cacheGitHubUserData,
} from '@/lib/github';
import type { GitHubProfile, GitHubRepo } from '@/types/github';

/**
 * Options for creating a DevCard
 */
export interface CreateDevCardOptions {
  /**
   * Pre-fetched GitHub profile data
   * If not provided, will be fetched from GitHub API
   */
  profile?: GitHubProfile;

  /**
   * Pre-fetched GitHub repositories
   * If not provided, will be fetched from GitHub API
   */
  repositories?: GitHubRepo[];

  /**
   * Whether to make the card public immediately
   * Default: true
   */
  isPublic?: boolean;

  /**
   * Maximum number of repositories to fetch
   * Default: 100
   */
  maxRepos?: number;

  /**
   * Custom display name (overrides GitHub name)
   */
  displayName?: string;

  /**
   * Custom bio (separate from GitHub bio)
   */
  customBio?: string;
}

/**
 * Result of creating a DevCard
 */
export interface CreateDevCardResult {
  /**
   * The created DevCard record
   */
  devcard: typeof devcards.$inferSelect;

  /**
   * Whether the card was newly created or already existed
   */
  isNew: boolean;

  /**
   * The public URL for the DevCard
   */
  url: string;
}

/**
 * Creates or updates a DevCard from GitHub data
 *
 * This function:
 * 1. Checks if user already has a DevCard
 * 2. Fetches GitHub profile and repositories if not provided
 * 3. Generates a unique URL slug
 * 4. Creates the DevCard in the database
 * 5. Caches GitHub data for performance
 * 6. Updates user's GitHub information
 *
 * @param userId - The user's ID
 * @param options - Options for DevCard creation
 * @returns The created DevCard and metadata
 * @throws {Error} If user doesn't have GitHub connected or fetch fails
 *
 * @example
 * ```typescript
 * const result = await createDevCard(userId);
 * console.log(`DevCard created at: ${result.url}`);
 * ```
 */
export async function createDevCard(
  userId: string,
  options: CreateDevCardOptions = {}
): Promise<CreateDevCardResult> {
  const {
    profile: providedProfile,
    repositories: providedRepos,
    isPublic = true,
    maxRepos = 100,
    displayName,
    customBio,
  } = options;

  // Check if DevCard already exists
  const [existingCard] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  // Fetch GitHub data if not provided
  let profile: GitHubProfile;
  let repositories: GitHubRepo[];

  if (providedProfile && providedRepos) {
    profile = providedProfile;
    repositories = providedRepos;
  } else {
    // Fetch from GitHub API
    profile = await fetchGitHubProfile(userId);
    repositories = await fetchUserRepositories(userId, {
      maxRepos,
      includeForked: false,
      includePrivate: false,
    });
  }

  // Calculate statistics
  const stats = await calculateCompleteStats(userId, profile, repositories);

  // Fetch organizations
  const organizations = await fetchGitHubOrganizations(userId).catch(() => []);

  // Calculate comprehensive stats
  const mostStarredRepo = getMostStarredRepo(repositories);
  const topLanguages = getTopLanguages(repositories, 3); // Already includes colors

  // Simplify repositories for storage
  const simplifiedRepos = simplifyRepositories(repositories, 10);

  // If card already exists, cache and return it
  if (existingCard) {
    // Cache comprehensive GitHub data directly
    const expires_at = new Date(Date.now() + 1800 * 1000);
    const existingPgCache = await db
      .select()
      .from(github_cache)
      .where(eq(github_cache.devcard_id, existingCard.id))
      .limit(1);

    const cacheData = {
      devcard_id: existingCard.id,
      login: profile.login,
      name: profile.name || null,
      bio: profile.bio || null,
      location: profile.location || null,
      email: profile.email || null,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      public_repos: profile.public_repos,
      public_gists: profile.public_gists,
      followers: profile.followers,
      following: profile.following,
      total_stars: stats.total_stars || 0,
      contribution_streak: stats.contributions?.current_streak || 0,
      repositories: simplifiedRepos,
      contributions: stats.contributions || {
        last_year_total: 0,
        current_streak: 0,
        longest_streak: 0,
      },
      organizations: organizations,
      most_starred_repo: mostStarredRepo,
      top_languages: topLanguages,
      expires_at,
    };

    if (existingPgCache.length > 0) {
      await db
        .update(github_cache)
        .set(cacheData)
        .where(eq(github_cache.devcard_id, existingCard.id));
    } else {
      await db.insert(github_cache).values(cacheData);
    }

    return {
      devcard: existingCard,
      isNew: false,
      url: `/card/${existingCard.url_slug}`,
    };
  }

  // Don't auto-populate featured repos - let users add custom projects instead
  const featuredRepos: string[] = [];

  // Calculate tech stack from repository languages
  const languageStats = calculateLanguageStats(repositories);
  const techStack = languageStats
    .slice(0, 10)
    .map((lang) => lang.language);

  // Generate unique URL slug
  const urlSlug = await generateCardUrl(profile.login);

  // Prepare social links
  const socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  } = {};

  if (profile.twitter_username) {
    socialLinks.twitter = `https://twitter.com/${profile.twitter_username}`;
  }

  if (profile.blog) {
    socialLinks.website = profile.blog;
  }

  // Calculate token expiry (if available from OAuth flow)
  // This would typically be set during OAuth, but we'll leave it null for now
  const githubAccessTokenExpires = null;

  // Create the DevCard
  const [newCard] = await db
    .insert(devcards)
    .values({
      user_id: userId,
      github_username: profile.login,
      github_id: profile.id,
      github_access_token_expires: githubAccessTokenExpires,
      url_slug: urlSlug,
      is_public: isPublic,
      display_name: displayName || profile.name || profile.login,
      custom_bio: customBio || null,
      location: profile.location,
      avatar_url: profile.avatar_url,
      social_links: socialLinks,
      featured_repos: featuredRepos,
      tech_stack: techStack,
      availability_status: 'available',
      availability_message: null,
      theme: {
        name: 'default',
      },
      view_count: 0,
      last_github_sync: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  // Update user's GitHub information
  await db
    .update(users)
    .set({
      github_id: profile.id,
      github_username: profile.login,
    })
    .where(eq(users.id, userId));

  // Cache comprehensive GitHub data for newly created card
  const expires_at_new = new Date(Date.now() + 1800 * 1000);
  const cacheDataNew = {
    devcard_id: newCard.id,
    login: profile.login,
    name: profile.name || null,
    bio: profile.bio || null,
    location: profile.location || null,
    email: profile.email || null,
    avatar_url: profile.avatar_url,
    html_url: profile.html_url,
    public_repos: profile.public_repos,
    public_gists: profile.public_gists,
    followers: profile.followers,
    following: profile.following,
    total_stars: stats.total_stars || 0,
    contribution_streak: stats.contributions?.current_streak || 0,
    repositories: simplifiedRepos,
    contributions: stats.contributions || {
      last_year_total: 0,
      current_streak: 0,
      longest_streak: 0,
    },
    organizations: organizations,
    most_starred_repo: mostStarredRepo,
    top_languages: topLanguages,
    expires_at: expires_at_new,
  };

  await db.insert(github_cache).values(cacheDataNew);

  return {
    devcard: newCard,
    isNew: true,
    url: `/card/${urlSlug}`,
  };
}

/**
 * Syncs an existing DevCard with latest GitHub data
 *
 * @param userId - The user's ID
 * @returns The updated DevCard
 * @throws {Error} If DevCard doesn't exist
 */
export async function syncDevCard(userId: string): Promise<typeof devcards.$inferSelect> {
  // Check if DevCard exists
  const [existingCard] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  if (!existingCard) {
    throw new Error('DevCard does not exist for this user');
  }

  // Fetch latest GitHub data
  const profile = await fetchGitHubProfile(userId);
  const repositories = await fetchUserRepositories(userId, {
    maxRepos: 100,
    includeForked: false,
    includePrivate: false,
  });

  // Fetch organizations
  const organizations = await fetchGitHubOrganizations(userId).catch(() => []);

  // Calculate statistics
  const stats = await calculateCompleteStats(userId, profile, repositories);

  // Calculate comprehensive stats
  const mostStarredRepo = getMostStarredRepo(repositories);
  const topLanguages = getTopLanguages(repositories, 3); // Already includes colors

  // Simplify repositories
  const simplifiedRepos = simplifyRepositories(repositories, 10);

  // Update featured repos (top 3 by stars)
  const featuredRepos = simplifiedRepos
    .slice(0, 3)
    .map((repo) => repo.full_name);

  // Update tech stack
  const languageStats = calculateLanguageStats(repositories);
  const techStack = languageStats
    .slice(0, 10)
    .map((lang) => lang.language);

  // Update social links
  const socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  } = existingCard.social_links as any || {};

  if (profile.twitter_username) {
    socialLinks.twitter = `https://twitter.com/${profile.twitter_username}`;
  }

  if (profile.blog) {
    socialLinks.website = profile.blog;
  }

  // Update the DevCard
  const [updatedCard] = await db
    .update(devcards)
    .set({
      github_username: profile.login,
      github_id: profile.id,
      location: profile.location,
      avatar_url: profile.avatar_url,
      social_links: socialLinks,
      featured_repos: featuredRepos,
      tech_stack: techStack,
      last_github_sync: new Date(),
      updated_at: new Date(),
    })
    .where(eq(devcards.user_id, userId))
    .returning();

  // Update cache with comprehensive data directly to PostgreSQL
  const expires_at = new Date(Date.now() + 1800 * 1000); // 30 minutes
  const existingPgCache = await db
    .select()
    .from(github_cache)
    .where(eq(github_cache.devcard_id, existingCard.id))
    .limit(1);

  const cacheData = {
    devcard_id: existingCard.id,
    login: profile.login,
    name: profile.name || null,
    bio: profile.bio || null,
    location: profile.location || null,
    email: profile.email || null,
    avatar_url: profile.avatar_url,
    html_url: profile.html_url,
    public_repos: profile.public_repos,
    public_gists: profile.public_gists,
    followers: profile.followers,
    following: profile.following,
    total_stars: stats.total_stars || 0,
    contribution_streak: stats.contributions?.current_streak || 0,
    repositories: simplifiedRepos,
    contributions: stats.contributions || {
      last_year_total: 0,
      current_streak: 0,
      longest_streak: 0,
    },
    organizations: organizations,
    most_starred_repo: mostStarredRepo,
    top_languages: topLanguages,
    expires_at,
  };

  if (existingPgCache.length > 0) {
    await db
      .update(github_cache)
      .set(cacheData)
      .where(eq(github_cache.devcard_id, existingCard.id));
  } else {
    await db.insert(github_cache).values(cacheData);
  }

  return updatedCard;
}

/**
 * Checks if a user has a DevCard
 *
 * @param userId - The user's ID
 * @returns True if user has a DevCard
 */
export async function hasDevCard(userId: string): Promise<boolean> {
  const [card] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  return !!card;
}

/**
 * Gets a user's DevCard
 *
 * @param userId - The user's ID
 * @returns The user's DevCard or null if not found
 */
export async function getDevCard(userId: string): Promise<typeof devcards.$inferSelect | null> {
  const [card] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  return card || null;
}

/**
 * Gets a DevCard by URL slug
 *
 * @param urlSlug - The URL slug
 * @returns The DevCard or null if not found
 */
export async function getDevCardBySlug(
  urlSlug: string
): Promise<typeof devcards.$inferSelect | null> {
  // Normalize to lowercase for case-insensitive matching
  const normalizedSlug = urlSlug.toLowerCase();

  const [card] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.url_slug, normalizedSlug))
    .limit(1);

  return card || null;
}
