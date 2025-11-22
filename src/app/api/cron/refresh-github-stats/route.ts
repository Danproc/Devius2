import { NextResponse } from 'next/server';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';
import cronAuthRequired from '@/lib/auth/cronAuthRequired';
import {
  fetchGitHubProfileByToken,
  fetchPublicRepositories,
  calculateCompleteStats,
  warmUpCache,
  getGitHubAccessToken
} from '@/lib/github';
import type { GitHubUserData } from '@/types/github';

/**
 * Daily GitHub Stats Refresh Cron Job
 * Refreshes GitHub data for all active users
 * Run once per day via Vercel Cron
 */
const handleRefreshGitHubStats = async () => {
  try {
    // Fetch all users with devcards
    const allUsers = await db
      .select({
        user: users,
        devcard: devcards,
      })
      .from(devcards)
      .innerJoin(users, eq(devcards.user_id, users.id));

    if (allUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to refresh',
        processedAt: new Date().toISOString(),
        totalUsers: 0,
      });
    }

    console.log(`Starting GitHub stats refresh for ${allUsers.length} users`);

    // Process all users concurrently (with rate limiting via Promise.allSettled)
    const refreshPromises = allUsers.map(async ({ user, devcard }) => {
      try {
        // Get GitHub access token
        const accessToken = await getGitHubAccessToken(user.id);
        if (!accessToken) {
          console.log(`No GitHub token for user ${user.id}, skipping`);
          return { status: 'skipped', userId: user.id, reason: 'no_token' };
        }

        // Fetch fresh GitHub data
        const profile = await fetchGitHubProfileByToken(accessToken);
        const repositories = await fetchPublicRepositories(devcard.github_username, 100);
        const stats = await calculateCompleteStats(user.id, profile, repositories);

        // Build complete GitHub user data
        const userData: GitHubUserData = {
          profile,
          repositories,
          stats,
          organizations: [], // Optional, skip for daily refresh to save API calls
          contributions: null, // Optional, expensive to fetch
          most_starred_repo: repositories.sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || null,
          top_languages: stats.top_languages || [],
        };

        // Warm up cache (saves to Redis or PostgreSQL)
        const cached = await warmUpCache(devcard.id, userData);

        if (cached) {
          console.log(`Refreshed GitHub stats for user ${user.id} (${devcard.github_username})`);
          return { status: 'processed', userId: user.id };
        } else {
          console.warn(`Failed to cache GitHub stats for user ${user.id}`);
          return { status: 'error', userId: user.id, reason: 'cache_failed' };
        }
      } catch (error: any) {
        console.error(`Failed to refresh GitHub stats for user ${user.id}:`, error.message);
        return { status: 'error', userId: user.id, error: error.message };
      }
    });

    // Wait for all refreshes to complete
    const settledResults = await Promise.allSettled(refreshPromises);

    // Aggregate results
    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
    };

    settledResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { status } = result.value;
        if (status === 'processed') results.processed++;
        else if (status === 'skipped') results.skipped++;
        else if (status === 'error') results.errors++;
      } else {
        results.errors++;
      }
    });

    return NextResponse.json({
      success: true,
      message: 'GitHub stats refresh completed',
      totalUsers: allUsers.length,
      processed: results.processed,
      skipped: results.skipped,
      errors: results.errors,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GitHub stats refresh cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'GitHub stats refresh failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        processedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
};

export const GET = cronAuthRequired(handleRefreshGitHubStats);
