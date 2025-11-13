/**
 * GitHub Data Caching with Redis (Vercel KV)
 *
 * Functions to cache GitHub profile, repositories, and stats data
 * to reduce API calls and improve performance.
 *
 * Note: Requires @vercel/kv to be installed
 * Install with: npm install @vercel/kv
 *
 * Environment variables required:
 * - KV_REST_API_URL
 * - KV_REST_API_TOKEN
 */

import type {
  GitHubProfile,
  GitHubRepoSimplified,
  GitHubStats,
  GitHubContributions,
  GitHubUserData,
} from '@/types/github';
import { db } from '@/db';
import { github_cache } from '@/db/schema/github-cache';
import { eq } from 'drizzle-orm';

// Cache key prefixes
const CACHE_PREFIX = 'github:';
const PROFILE_PREFIX = `${CACHE_PREFIX}profile:`;
const REPOS_PREFIX = `${CACHE_PREFIX}repos:`;
const STATS_PREFIX = `${CACHE_PREFIX}stats:`;
const USER_DATA_PREFIX = `${CACHE_PREFIX}userdata:`;

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  PROFILE: 60 * 60, // 1 hour
  REPOS: 60 * 30, // 30 minutes
  STATS: 60 * 60, // 1 hour
  USER_DATA: 60 * 30, // 30 minutes
};

/**
 * Type guard to check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Gets the KV client instance
 * @returns KV client or null if not available
 */
async function getKVClient() {
  if (!isKVAvailable()) {
    console.warn('Vercel KV not configured. Using PostgreSQL fallback.');
    return null;
  }

  try {
    // Dynamic import to avoid errors if @vercel/kv is not installed
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch (error) {
    console.error('Failed to load @vercel/kv:', error);
    console.warn('Install with: npm install @vercel/kv');
    console.warn('Using PostgreSQL fallback.');
    return null;
  }
}

/**
 * PostgreSQL Fallback Functions
 */

/**
 * Gets cached data from PostgreSQL
 * @param devcard_id - DevCard ID (used as userId in cache functions)
 * @returns Cached data or null if not found or expired
 */
async function getPgCache(devcard_id: string) {
  try {
    const [cached] = await db
      .select()
      .from(github_cache)
      .where(eq(github_cache.devcard_id, devcard_id))
      .limit(1);

    if (!cached) return null;

    // Check if expired
    if (cached.expires_at < new Date()) {
      // Delete expired cache
      await db.delete(github_cache).where(eq(github_cache.devcard_id, devcard_id));
      return null;
    }

    return cached;
  } catch (error) {
    console.error('Failed to get PostgreSQL cache:', error);
    return null;
  }
}

/**
 * Saves or updates cache in PostgreSQL
 * @param devcard_id - DevCard ID
 * @param data - Data to cache
 * @param ttl - Time to live in seconds
 * @returns True if successful
 */
async function savePgCache(
  devcard_id: string,
  data: {
    profile?: GitHubProfile;
    repos?: GitHubRepoSimplified[];
    stats?: GitHubStats;
    organizations?: string[];
    most_starred_repo?: any;
    top_languages?: any[];
    contributions?: any;
  },
  ttl: number
): Promise<boolean> {
  try {
    const expires_at = new Date(Date.now() + ttl * 1000);

    // Get existing cache to merge with
    const existing = await getPgCache(devcard_id);

    const cacheData = {
      devcard_id,
      // Profile data
      login: data.profile?.login || existing?.login || '',
      name: data.profile?.name || existing?.name || null,
      bio: data.profile?.bio || existing?.bio || null,
      location: data.profile?.location || existing?.location || null,
      email: data.profile?.email || existing?.email || null,
      avatar_url: data.profile?.avatar_url || existing?.avatar_url || '',
      html_url: data.profile?.html_url || existing?.html_url || '',
      // Stats
      public_repos: data.profile?.public_repos || existing?.public_repos || 0,
      public_gists: data.profile?.public_gists || existing?.public_gists || 0,
      followers: data.profile?.followers || existing?.followers || 0,
      following: data.profile?.following || existing?.following || 0,
      total_stars: data.stats?.total_stars || existing?.total_stars || 0,
      contribution_streak: data.stats?.contributions?.current_streak || existing?.contribution_streak || 0,
      // Repository data
      repositories: data.repos || existing?.repositories || [],
      // Contribution data
      contributions: data.contributions || data.stats?.contributions || existing?.contributions || {
        last_year_total: 0,
        current_streak: 0,
        longest_streak: 0,
      },
      // Comprehensive stats
      organizations: data.organizations || existing?.organizations || [],
      most_starred_repo: data.most_starred_repo || existing?.most_starred_repo || null,
      top_languages: data.top_languages || existing?.top_languages || [],
      expires_at,
    };

    if (existing) {
      // Update existing cache
      await db
        .update(github_cache)
        .set(cacheData)
        .where(eq(github_cache.devcard_id, devcard_id));
    } else {
      // Insert new cache
      await db.insert(github_cache).values(cacheData);
    }

    return true;
  } catch (error) {
    console.error('Failed to save PostgreSQL cache:', error);
    return false;
  }
}

/**
 * Deletes cache from PostgreSQL
 * @param devcard_id - DevCard ID
 * @returns True if successful
 */
async function deletePgCache(devcard_id: string): Promise<boolean> {
  try {
    await db.delete(github_cache).where(eq(github_cache.devcard_id, devcard_id));
    return true;
  } catch (error) {
    console.error('Failed to delete PostgreSQL cache:', error);
    return false;
  }
}

/**
 * Caches GitHub profile data
 *
 * @param userId - User ID
 * @param profile - GitHub profile data
 * @returns True if cached successfully
 */
export async function cacheGitHubProfile(
  userId: string,
  profile: GitHubProfile
): Promise<boolean> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Use Redis/KV if available
      const key = `${PROFILE_PREFIX}${userId}`;
      await kv.setex(key, CACHE_TTL.PROFILE, JSON.stringify(profile));
      return true;
    }

    // Fallback to PostgreSQL
    return await savePgCache(userId, { profile }, CACHE_TTL.PROFILE);
  } catch (error) {
    console.error('Failed to cache GitHub profile:', error);
    return false;
  }
}

/**
 * Gets cached GitHub profile data
 *
 * @param userId - User ID
 * @returns Cached profile data or null if not found
 */
export async function getCachedGitHubProfile(
  userId: string
): Promise<GitHubProfile | null> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Try Redis/KV first
      const key = `${PROFILE_PREFIX}${userId}`;
      const cached = await kv.get(key);

      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : (cached as GitHubProfile);
      }
    }

    // Fallback to PostgreSQL
    const pgCache = await getPgCache(userId);
    if (!pgCache) return null;

    return {
      login: pgCache.login,
      name: pgCache.name,
      bio: pgCache.bio,
      location: pgCache.location,
      email: pgCache.email,
      avatar_url: pgCache.avatar_url,
      html_url: pgCache.html_url,
      public_repos: pgCache.public_repos,
      public_gists: pgCache.public_gists,
      followers: pgCache.followers,
      following: pgCache.following,
      created_at: '', // Not stored in cache
      updated_at: '', // Not stored in cache
    } as GitHubProfile;
  } catch (error) {
    console.error('Failed to get cached GitHub profile:', error);
    return null;
  }
}

/**
 * Caches GitHub repositories data
 *
 * @param userId - User ID
 * @param repos - Array of simplified repositories
 * @returns True if cached successfully
 */
export async function cacheGitHubRepos(
  userId: string,
  repos: GitHubRepoSimplified[]
): Promise<boolean> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Use Redis/KV if available
      const key = `${REPOS_PREFIX}${userId}`;
      await kv.setex(key, CACHE_TTL.REPOS, JSON.stringify(repos));
      return true;
    }

    // Fallback to PostgreSQL
    return await savePgCache(userId, { repos }, CACHE_TTL.REPOS);
  } catch (error) {
    console.error('Failed to cache GitHub repos:', error);
    return false;
  }
}

/**
 * Gets cached GitHub repositories
 *
 * @param userId - User ID
 * @returns Cached repositories or null if not found
 */
export async function getCachedGitHubRepos(
  userId: string
): Promise<GitHubRepoSimplified[] | null> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Try Redis/KV first
      const key = `${REPOS_PREFIX}${userId}`;
      const cached = await kv.get(key);

      if (cached) {
        return typeof cached === 'string'
          ? JSON.parse(cached)
          : (cached as GitHubRepoSimplified[]);
      }
    }

    // Fallback to PostgreSQL
    const pgCache = await getPgCache(userId);
    if (!pgCache || !pgCache.repositories) return null;

    return pgCache.repositories as GitHubRepoSimplified[];
  } catch (error) {
    console.error('Failed to get cached GitHub repos:', error);
    return null;
  }
}

/**
 * Caches GitHub statistics
 *
 * @param userId - User ID
 * @param stats - GitHub statistics
 * @returns True if cached successfully
 */
export async function cacheGitHubStats(
  userId: string,
  stats: GitHubStats
): Promise<boolean> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Use Redis/KV if available
      const key = `${STATS_PREFIX}${userId}`;
      await kv.setex(key, CACHE_TTL.STATS, JSON.stringify(stats));
      return true;
    }

    // Fallback to PostgreSQL
    return await savePgCache(userId, { stats }, CACHE_TTL.STATS);
  } catch (error) {
    console.error('Failed to cache GitHub stats:', error);
    return false;
  }
}

/**
 * Gets cached GitHub statistics
 *
 * @param userId - User ID
 * @returns Cached statistics or null if not found
 */
export async function getCachedGitHubStats(userId: string): Promise<GitHubStats | null> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Try Redis/KV first
      const key = `${STATS_PREFIX}${userId}`;
      const cached = await kv.get(key);

      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : (cached as GitHubStats);
      }
    }

    // Fallback to PostgreSQL
    const pgCache = await getPgCache(userId);
    if (!pgCache) return null;

    return {
      total_stars: pgCache.total_stars || 0,
      total_forks: 0, // Not stored separately in cache
      total_repos: pgCache.public_repos,
      contributions: pgCache.contributions as GitHubContributions || {
        last_year_total: 0,
        current_streak: 0,
        longest_streak: 0,
      },
      languages: [], // Not stored in cache
    } as unknown as GitHubStats;
  } catch (error) {
    console.error('Failed to get cached GitHub stats:', error);
    return null;
  }
}

/**
 * Caches complete GitHub user data (profile + repos + stats)
 *
 * @param userId - User ID
 * @param userData - Complete GitHub user data
 * @returns True if cached successfully
 */
export async function cacheGitHubUserData(
  userId: string,
  userData: GitHubUserData
): Promise<boolean> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Use Redis/KV if available
      const key = `${USER_DATA_PREFIX}${userId}`;
      await kv.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(userData));
      return true;
    }

    // Fallback to PostgreSQL
    return await savePgCache(
      userId,
      {
        profile: userData.profile,
        repos: userData.repositories,
        stats: userData.stats,
      },
      CACHE_TTL.USER_DATA
    );
  } catch (error) {
    console.error('Failed to cache GitHub user data:', error);
    return false;
  }
}

/**
 * Gets cached complete GitHub user data
 *
 * @param userId - User ID
 * @returns Cached user data or null if not found
 */
export async function getCachedGitHubUserData(
  userId: string
): Promise<GitHubUserData | null> {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Try Redis/KV first
      const key = `${USER_DATA_PREFIX}${userId}`;
      const cached = await kv.get(key);

      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : (cached as GitHubUserData);
      }
    }

    // Fallback to PostgreSQL
    const pgCache = await getPgCache(userId);
    if (!pgCache) return null;

    return {
      profile: {
        login: pgCache.login,
        name: pgCache.name,
        bio: pgCache.bio,
        location: pgCache.location,
        email: pgCache.email,
        avatar_url: pgCache.avatar_url,
        html_url: pgCache.html_url,
        public_repos: pgCache.public_repos,
        public_gists: pgCache.public_gists,
        followers: pgCache.followers,
        following: pgCache.following,
        created_at: '',
        updated_at: '',
      },
      repositories: (pgCache.repositories as GitHubRepoSimplified[]) || [],
      stats: {
        total_stars: pgCache.total_stars || 0,
        total_forks: 0,
        total_repos: pgCache.public_repos,
        contributions: pgCache.contributions as GitHubContributions || {
          last_year_total: 0,
          current_streak: 0,
          longest_streak: 0,
        },
        languages: [],
        public_repos: pgCache.public_repos,
        public_gists: pgCache.public_gists,
        followers: pgCache.followers,
        following: pgCache.following,
        contribution_streak: pgCache.contribution_streak || 0,
      },
      contributions: pgCache.contributions as GitHubContributions || {
        last_year_total: 0,
        current_streak: 0,
        longest_streak: 0,
      },
      organizations: (pgCache.organizations as string[]) || [],
      most_starred_repo: pgCache.most_starred_repo as any,
      top_languages: (pgCache.top_languages as any[]) || [],
    } as unknown as GitHubUserData;
  } catch (error) {
    console.error('Failed to get cached GitHub user data:', error);
    return null;
  }
}

/**
 * Invalidates all cached data for a user
 *
 * @param userId - User ID
 * @returns True if invalidated successfully
 */
export async function invalidateGitHubCache(userId: string): Promise<boolean> {
  try {
    const kv = await getKVClient();
    let success = false;

    if (kv) {
      // Invalidate Redis/KV cache
      const keys = [
        `${PROFILE_PREFIX}${userId}`,
        `${REPOS_PREFIX}${userId}`,
        `${STATS_PREFIX}${userId}`,
        `${USER_DATA_PREFIX}${userId}`,
      ];
      await Promise.all(keys.map((key) => kv.del(key)));
      success = true;
    }

    // Also invalidate PostgreSQL cache
    const pgSuccess = await deletePgCache(userId);

    return success || pgSuccess;
  } catch (error) {
    console.error('Failed to invalidate GitHub cache:', error);
    return false;
  }
}

/**
 * Invalidates cache for a specific data type
 *
 * @param userId - User ID
 * @param type - Type of data to invalidate
 * @returns True if invalidated successfully
 */
export async function invalidateCacheByType(
  userId: string,
  type: 'profile' | 'repos' | 'stats' | 'userdata'
): Promise<boolean> {
  try {
    const kv = await getKVClient();
    let success = false;

    if (kv) {
      // Invalidate Redis/KV cache
      const prefixMap = {
        profile: PROFILE_PREFIX,
        repos: REPOS_PREFIX,
        stats: STATS_PREFIX,
        userdata: USER_DATA_PREFIX,
      };

      const key = `${prefixMap[type]}${userId}`;
      await kv.del(key);
      success = true;
    }

    // For PostgreSQL, we invalidate the entire cache entry since it stores all data together
    // Only invalidate if this is a complete userdata invalidation
    if (type === 'userdata') {
      const pgSuccess = await deletePgCache(userId);
      return success || pgSuccess;
    }

    return success;
  } catch (error) {
    console.error(`Failed to invalidate ${type} cache:`, error);
    return false;
  }
}

/**
 * Gets cache status for a user
 *
 * @param userId - User ID
 * @returns Object indicating which data is cached
 */
export async function getCacheStatus(userId: string) {
  try {
    const kv = await getKVClient();

    if (kv) {
      // Check Redis/KV cache
      const [profile, repos, stats, userData] = await Promise.all([
        kv.exists(`${PROFILE_PREFIX}${userId}`),
        kv.exists(`${REPOS_PREFIX}${userId}`),
        kv.exists(`${STATS_PREFIX}${userId}`),
        kv.exists(`${USER_DATA_PREFIX}${userId}`),
      ]);

      return {
        available: true,
        profile: profile === 1,
        repos: repos === 1,
        stats: stats === 1,
        userData: userData === 1,
      };
    }

    // Check PostgreSQL cache
    const pgCache = await getPgCache(userId);
    if (pgCache) {
      return {
        available: true,
        profile: !!pgCache.login,
        repos: !!pgCache.repositories,
        stats: !!pgCache.total_stars,
        userData: true,
      };
    }

    return {
      available: false,
      profile: false,
      repos: false,
      stats: false,
      userData: false,
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {
      available: false,
      profile: false,
      repos: false,
      stats: false,
      userData: false,
    };
  }
}

/**
 * Warms up the cache by fetching and caching all GitHub data
 * This should be called after OAuth connection or on demand
 *
 * @param userId - User ID
 * @param userData - Complete GitHub user data
 * @returns True if cache was warmed successfully
 */
export async function warmUpCache(
  userId: string,
  userData: GitHubUserData
): Promise<boolean> {
  try {
    // Cache all data in parallel (functions will use KV or PostgreSQL fallback automatically)
    const results = await Promise.all([
      cacheGitHubProfile(userId, userData.profile),
      cacheGitHubRepos(userId, userData.repositories),
      cacheGitHubStats(userId, userData.stats),
      cacheGitHubUserData(userId, userData),
    ]);

    // Return true if at least one cache operation succeeded
    return results.some((result) => result === true);
  } catch (error) {
    console.error('Failed to warm up cache:', error);
    return false;
  }
}
