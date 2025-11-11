/**
 * Sync GitHub Data Function
 *
 * Event-triggered background job that syncs GitHub data for a specific DevCard.
 * This function fetches fresh GitHub profile, repositories, and stats data,
 * then updates the github_cache table.
 *
 * Trigger: "devcard/sync.github" event
 */

import { db } from "@/db";
import { github_cache } from "@/db/schema/github-cache";
import { devcards } from "@/db/schema/devcard";
import { eq } from "drizzle-orm";
import { inngest } from "../client";
import {
  getGitHubAccessToken,
  fetchGitHubProfileByToken,
  fetchUserRepositoriesByToken,
  calculateCompleteStatsByToken,
  simplifyRepositories,
} from "@/lib/github";
import { addDays } from "date-fns";

export const syncGitHubData = inngest.createFunction(
  {
    id: "sync-github-data",
    name: "Sync GitHub Data for DevCard",
  },
  { event: "devcard/sync.github" },
  async ({ event, step, logger }) => {
    const { userId, devCardId } = event.data;

    logger.info(`Starting GitHub sync for user ${userId}, devcard ${devCardId}`);

    // Step 1: Fetch DevCard data
    const devCard = await step.run("fetch-devcard", async () => {
      const result = await db
        .select({
          id: devcards.id,
          github_username: devcards.github_username,
          github_id: devcards.github_id,
        })
        .from(devcards)
        .where(eq(devcards.id, devCardId))
        .limit(1);

      if (result.length === 0) {
        throw new Error(`DevCard not found: ${devCardId}`);
      }

      return result[0];
    });

    // Step 2: Get GitHub access token
    const accessToken = await step.run("get-access-token", async () => {
      try {
        const token = await getGitHubAccessToken(userId);
        if (!token) {
          throw new Error("GitHub access token not found");
        }
        return token;
      } catch (error) {
        logger.error("Failed to get GitHub access token", { error });
        throw error;
      }
    });

    // Step 3: Fetch GitHub profile
    const profile = await step.run("fetch-github-profile", async () => {
      try {
        return await fetchGitHubProfileByToken(accessToken);
      } catch (error) {
        logger.error("Failed to fetch GitHub profile", { error });
        throw error;
      }
    });

    // Step 4: Fetch user repositories
    const repositories = await step.run("fetch-repositories", async () => {
      try {
        const repos = await fetchUserRepositoriesByToken(
          devCard.github_username,
          accessToken
        );
        return simplifyRepositories(repos);
      } catch (error) {
        logger.error("Failed to fetch repositories", { error });
        throw error;
      }
    });

    // Step 5: Calculate complete stats (includes contribution data)
    const stats = await step.run("calculate-stats", async () => {
      try {
        return await calculateCompleteStatsByToken(
          devCard.github_username,
          accessToken
        );
      } catch (error) {
        logger.error("Failed to calculate stats", { error });
        throw error;
      }
    });

    // Step 6: Update github_cache table
    const cacheResult = await step.run("update-cache", async () => {
      const now = new Date();
      const expiresAt = addDays(now, 1); // Cache expires in 24 hours

      try {
        // Check if cache entry exists
        const existingCache = await db
          .select({ id: github_cache.id })
          .from(github_cache)
          .where(eq(github_cache.devcard_id, devCardId))
          .limit(1);

        const cacheData = {
          devcard_id: devCardId,
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
          total_stars: stats.totalStars || 0,
          contribution_streak: stats.contributions?.currentStreak || 0,
          repositories: repositories,
          contributions: {
            last_year_total: stats.contributions?.lastYearTotal || 0,
            current_streak: stats.contributions?.currentStreak || 0,
            longest_streak: stats.contributions?.longestStreak || 0,
          },
          cached_at: now,
          expires_at: expiresAt,
        };

        if (existingCache.length > 0) {
          // Update existing cache
          await db
            .update(github_cache)
            .set(cacheData)
            .where(eq(github_cache.devcard_id, devCardId));

          return { action: "updated", cacheId: existingCache[0].id };
        } else {
          // Insert new cache entry
          const inserted = await db
            .insert(github_cache)
            .values(cacheData)
            .returning({ id: github_cache.id });

          return { action: "created", cacheId: inserted[0].id };
        }
      } catch (error) {
        logger.error("Failed to update cache", { error });
        throw error;
      }
    });

    // Step 7: Update devcard last_github_sync timestamp
    await step.run("update-devcard-sync-timestamp", async () => {
      await db
        .update(devcards)
        .set({ last_github_sync: new Date() })
        .where(eq(devcards.id, devCardId));
    });

    logger.info(`GitHub sync completed successfully for devcard ${devCardId}`);

    return {
      success: true,
      devCardId,
      userId,
      cacheAction: cacheResult.action,
      cacheId: cacheResult.cacheId,
      stats: {
        totalStars: stats.totalStars,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        contributionStreak: stats.contributions?.currentStreak || 0,
      },
      syncedAt: new Date().toISOString(),
    };
  }
);
