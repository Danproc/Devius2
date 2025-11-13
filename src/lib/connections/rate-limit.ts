import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

/**
 * Rate limiter for connection requests
 * Uses Upstash Rate Limit with sliding window algorithm
 * Limit: 20 requests per hour per user
 */
const connectionRateLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:connections',
});

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

/**
 * Check if a user can send a connection request based on rate limits
 * @param userId - ID of the user to check
 * @returns Rate limit result with remaining count and reset time
 */
export async function checkConnectionRateLimit(
  userId: string
): Promise<RateLimitResult> {
  try {
    // Check if KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('KV not configured, skipping rate limit check');
      // Return permissive result when KV is not configured (development mode)
      return {
        success: true,
        limit: 20,
        remaining: 20,
        reset: Date.now() + 3600000, // 1 hour from now
      };
    }

    const identifier = `connection:${userId}`;
    const { success, limit, remaining, reset } = await connectionRateLimiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset,
      error: success ? undefined : 'Rate limit exceeded. Please try again later.',
    };
  } catch (error) {
    console.error('Error checking connection rate limit:', error);
    // On error, allow the request but log the issue
    return {
      success: true,
      limit: 20,
      remaining: 20,
      reset: Date.now() + 3600000,
      error: 'Rate limit check failed',
    };
  }
}

/**
 * Get current rate limit status for a user without consuming a token
 * @param userId - ID of the user to check
 * @returns Current rate limit status
 */
export async function getConnectionRateLimitStatus(
  userId: string
): Promise<RateLimitResult> {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return {
        success: true,
        limit: 20,
        remaining: 20,
        reset: Date.now() + 3600000,
      };
    }

    const identifier = `connection:${userId}`;

    // Get limit without consuming
    const result = await connectionRateLimiter.getRemaining(identifier);

    return {
      success: result.remaining > 0,
      limit: 20, // Daily connection request limit
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Error getting connection rate limit status:', error);
    return {
      success: true,
      limit: 20,
      remaining: 20,
      reset: Date.now() + 3600000,
    };
  }
}

/**
 * Reset rate limit for a user (admin function)
 * @param userId - ID of the user to reset
 */
export async function resetConnectionRateLimit(userId: string): Promise<void> {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return;
    }

    const identifier = `connection:${userId}`;
    await connectionRateLimiter.resetUsedTokens(identifier);
  } catch (error) {
    console.error('Error resetting connection rate limit:', error);
  }
}
