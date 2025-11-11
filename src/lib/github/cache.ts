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
    console.warn('Vercel KV not configured. Caching is disabled.');
    return null;
  }

  try {
    // Dynamic import to avoid errors if @vercel/kv is not installed
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch (error) {
    console.error('Failed to load @vercel/kv:', error);
    console.warn('Install with: npm install @vercel/kv');
    return null;
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
    if (!kv) return false;

    const key = `${PROFILE_PREFIX}${userId}`;
    await kv.setex(key, CACHE_TTL.PROFILE, JSON.stringify(profile));

    return true;
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
    if (!kv) return null;

    const key = `${PROFILE_PREFIX}${userId}`;
    const cached = await kv.get(key);

    if (!cached) return null;

    return typeof cached === 'string' ? JSON.parse(cached) : (cached as GitHubProfile);
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
    if (!kv) return false;

    const key = `${REPOS_PREFIX}${userId}`;
    await kv.setex(key, CACHE_TTL.REPOS, JSON.stringify(repos));

    return true;
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
    if (!kv) return null;

    const key = `${REPOS_PREFIX}${userId}`;
    const cached = await kv.get(key);

    if (!cached) return null;

    return typeof cached === 'string'
      ? JSON.parse(cached)
      : (cached as GitHubRepoSimplified[]);
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
    if (!kv) return false;

    const key = `${STATS_PREFIX}${userId}`;
    await kv.setex(key, CACHE_TTL.STATS, JSON.stringify(stats));

    return true;
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
    if (!kv) return null;

    const key = `${STATS_PREFIX}${userId}`;
    const cached = await kv.get(key);

    if (!cached) return null;

    return typeof cached === 'string' ? JSON.parse(cached) : (cached as GitHubStats);
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
    if (!kv) return false;

    const key = `${USER_DATA_PREFIX}${userId}`;
    await kv.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(userData));

    return true;
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
    if (!kv) return null;

    const key = `${USER_DATA_PREFIX}${userId}`;
    const cached = await kv.get(key);

    if (!cached) return null;

    return typeof cached === 'string' ? JSON.parse(cached) : (cached as GitHubUserData);
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
    if (!kv) return false;

    const keys = [
      `${PROFILE_PREFIX}${userId}`,
      `${REPOS_PREFIX}${userId}`,
      `${STATS_PREFIX}${userId}`,
      `${USER_DATA_PREFIX}${userId}`,
    ];

    await Promise.all(keys.map((key) => kv.del(key)));

    return true;
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
    if (!kv) return false;

    const prefixMap = {
      profile: PROFILE_PREFIX,
      repos: REPOS_PREFIX,
      stats: STATS_PREFIX,
      userdata: USER_DATA_PREFIX,
    };

    const key = `${prefixMap[type]}${userId}`;
    await kv.del(key);

    return true;
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
    if (!kv) {
      return {
        available: false,
        profile: false,
        repos: false,
        stats: false,
        userData: false,
      };
    }

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
    const kv = await getKVClient();
    if (!kv) return false;

    // Cache all data in parallel
    await Promise.all([
      cacheGitHubProfile(userId, userData.profile),
      cacheGitHubRepos(userId, userData.repositories),
      cacheGitHubStats(userId, userData.stats),
      cacheGitHubUserData(userId, userData),
    ]);

    return true;
  } catch (error) {
    console.error('Failed to warm up cache:', error);
    return false;
  }
}
