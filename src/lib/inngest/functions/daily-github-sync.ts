/**
 * Daily GitHub Sync Function
 *
 * Scheduled cron job that runs daily to sync GitHub data for all active DevCards.
 * This function queries all DevCards and triggers the sync-github-data event for each.
 *
 * Schedule: Daily at 3:00 AM UTC
 */

import { db } from "@/db";
import { devcards } from "@/db/schema/devcard";
import { github_cache } from "@/db/schema/github-cache";
import { eq, or, lte, isNull } from "drizzle-orm";
import { inngest } from "../client";

export const dailyGitHubSync = inngest.createFunction(
  {
    id: "daily-github-sync",
    name: "Daily GitHub Sync for All DevCards",
  },
  { cron: "0 3 * * *" }, // Run at 3:00 AM UTC daily
  async ({ step, logger }) => {
    logger.info("Starting daily GitHub sync for all DevCards");

    // Step 1: Get total count of active DevCards for planning
    const totalDevCardsCount = await step.run(
      "count-active-devcards",
      async () => {
        const result = await db
          .select({ count: devcards.id })
          .from(devcards)
          .where(eq(devcards.is_public, true));

        return result.length;
      }
    );

    if (totalDevCardsCount === 0) {
      return {
        message: "No active DevCards found to sync",
        syncedAt: new Date().toISOString(),
      };
    }

    logger.info(`Found ${totalDevCardsCount} active DevCards to sync`);

    // Step 2: Fetch DevCards that need syncing
    // Priority:
    // 1. DevCards with expired cache (expires_at < now)
    // 2. DevCards never synced (last_github_sync is null)
    // 3. All other active DevCards
    const devCardsToSync = await step.run("fetch-devcards-to-sync", async () => {
      const now = new Date();

      // Get all active DevCards with their cache info
      const result = await db
        .select({
          id: devcards.id,
          user_id: devcards.user_id,
          github_username: devcards.github_username,
          last_github_sync: devcards.last_github_sync,
          cache_expires_at: github_cache.expires_at,
        })
        .from(devcards)
        .leftJoin(github_cache, eq(github_cache.devcard_id, devcards.id))
        .where(eq(devcards.is_public, true));

      // Sort by priority:
      // 1. Expired cache first
      // 2. Never synced second
      // 3. Others last
      return result.sort((a, b) => {
        // Expired cache has highest priority
        const aExpired = a.cache_expires_at && a.cache_expires_at < now;
        const bExpired = b.cache_expires_at && b.cache_expires_at < now;
        if (aExpired && !bExpired) return -1;
        if (!aExpired && bExpired) return 1;

        // Never synced has second priority
        const aNeverSynced = !a.last_github_sync;
        const bNeverSynced = !b.last_github_sync;
        if (aNeverSynced && !bNeverSynced) return -1;
        if (!aNeverSynced && bNeverSynced) return 1;

        return 0;
      });
    });

    logger.info(`Prepared ${devCardsToSync.length} DevCards for syncing`);

    // Step 3: Process DevCards in batches to avoid overwhelming the system
    const batchSize = 10; // Process 10 DevCards at a time
    const totalBatches = Math.ceil(devCardsToSync.length / batchSize);

    logger.info(
      `Processing ${devCardsToSync.length} DevCards in ${totalBatches} batches of ${batchSize}`
    );

    // Process batches sequentially to control API rate limits
    const batchResults = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchNumber = batchIndex + 1;
      const offset = batchIndex * batchSize;
      const batchDevCards = devCardsToSync.slice(offset, offset + batchSize);

      logger.info(
        `Processing batch ${batchNumber}/${totalBatches} (${batchDevCards.length} DevCards)`
      );

      const batchResult = await step.run(
        {
          id: `trigger-batch-${batchNumber}`,
          name: `Trigger Sync Batch ${batchNumber}/${totalBatches}`,
        },
        async () => {
          const triggerPromises = batchDevCards.map(async (devCard) => {
            try {
              // Trigger sync-github-data event for this DevCard
              await inngest.send({
                name: "devcard/sync.github",
                data: {
                  userId: devCard.user_id,
                  devCardId: devCard.id,
                },
              });

              return {
                status: "triggered",
                devCardId: devCard.id,
                userId: devCard.user_id,
              };
            } catch (error) {
              logger.error(
                `Failed to trigger sync for DevCard ${devCard.id}`,
                { error }
              );
              return {
                status: "failed",
                devCardId: devCard.id,
                userId: devCard.user_id,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          });

          // Wait for all triggers in this batch to complete
          const results = await Promise.allSettled(triggerPromises);

          const batchSummary = {
            batchNumber,
            triggered: 0,
            failed: 0,
          };

          results.forEach((result) => {
            if (result.status === "fulfilled") {
              if (result.value.status === "triggered") {
                batchSummary.triggered++;
              } else {
                batchSummary.failed++;
              }
            } else {
              batchSummary.failed++;
            }
          });

          logger.info(
            `Batch ${batchNumber} completed: ${batchSummary.triggered} triggered, ${batchSummary.failed} failed`
          );

          return batchSummary;
        }
      );

      batchResults.push(batchResult);

      // Add a small delay between batches to avoid rate limiting (except for last batch)
      if (batchIndex < totalBatches - 1) {
        await step.sleep("rate-limit-delay", 2000); // 2 second delay
      }
    }

    // Step 4: Generate final summary
    return await step.run("generate-summary", async () => {
      const totalSummary = batchResults.reduce(
        (acc, batch) => ({
          triggered: acc.triggered + batch.triggered,
          failed: acc.failed + batch.failed,
        }),
        { triggered: 0, failed: 0 }
      );

      logger.info(
        `Daily GitHub sync completed. ${totalSummary.triggered} DevCards triggered, ${totalSummary.failed} failed`
      );

      return {
        message: "Daily GitHub sync completed successfully",
        totalDevCards: devCardsToSync.length,
        batchesProcessed: totalBatches,
        triggered: totalSummary.triggered,
        failed: totalSummary.failed,
        syncedAt: new Date().toISOString(),
      };
    });
  }
);
