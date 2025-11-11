/**
 * Cleanup Analytics Function
 *
 * Scheduled cron job that runs daily to clean up old analytics events.
 * Deletes raw events older than 90 days (aggregated data is preserved).
 *
 * Schedule: Daily at 3:00 AM UTC (runs after aggregation at 2 AM)
 */

import { db } from '@/db';
import { analytics_events } from '@/db/schema/analytics';
import { sql, lte } from 'drizzle-orm';
import { inngest } from '../client';

export const cleanupAnalytics = inngest.createFunction(
  {
    id: 'cleanup-analytics',
    name: 'Cleanup Old Analytics Events',
  },
  { cron: '0 3 * * *' }, // Run at 3:00 AM UTC daily
  async ({ step, logger }) => {
    logger.info('Starting analytics cleanup');

    // Step 1: Calculate cutoff date (90 days ago)
    const cutoffDate = await step.run('calculate-cutoff-date', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 90);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    });

    logger.info(`Deleting analytics events older than: ${cutoffDate.toISOString()}`);

    // Step 2: Count events to be deleted
    const countToDelete = await step.run('count-events-to-delete', async () => {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(analytics_events)
        .where(lte(analytics_events.timestamp, cutoffDate));

      return result[0]?.count || 0;
    });

    if (countToDelete === 0) {
      logger.info('No analytics events to delete');
      return {
        message: 'No analytics events to delete',
        cutoffDate: cutoffDate.toISOString().split('T')[0],
        deletedCount: 0,
        cleanedAt: new Date().toISOString(),
      };
    }

    logger.info(`Found ${countToDelete} analytics events to delete`);

    // Step 3: Delete old events
    const deletedCount = await step.run('delete-old-events', async () => {
      try {
        const result = await db
          .delete(analytics_events)
          .where(lte(analytics_events.timestamp, cutoffDate));

        // Drizzle doesn't return count directly, use the counted value
        return countToDelete;
      } catch (error) {
        logger.error('Failed to delete old analytics events', { error });
        throw error;
      }
    });

    logger.info(`Successfully deleted ${deletedCount} analytics events`);

    // Step 4: Vacuum analyze the table (optional, for PostgreSQL optimization)
    await step.run('vacuum-table', async () => {
      try {
        // Run VACUUM ANALYZE to reclaim space and update statistics
        await db.execute(sql`VACUUM ANALYZE analytics_events`);
        logger.info('Table vacuumed and analyzed successfully');
      } catch (error) {
        // Non-critical error, just log it
        logger.warn('Failed to vacuum table (non-critical)', { error });
      }
    });

    // Step 5: Return summary
    return await step.run('generate-summary', async () => {
      return {
        message: 'Analytics cleanup completed successfully',
        cutoffDate: cutoffDate.toISOString().split('T')[0],
        deletedCount,
        cleanedAt: new Date().toISOString(),
      };
    });
  }
);
