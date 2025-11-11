/**
 * Aggregate Analytics Function
 *
 * Scheduled cron job that runs daily to aggregate raw analytics events
 * into daily summary tables for fast dashboard queries.
 *
 * Schedule: Daily at 2:00 AM UTC
 */

import { inngest } from '../client';
import { aggregateDailyMetrics } from '@/lib/analytics/aggregate';

export const aggregateAnalytics = inngest.createFunction(
  {
    id: 'aggregate-analytics',
    name: 'Daily Analytics Aggregation',
  },
  { cron: '0 2 * * *' }, // Run at 2:00 AM UTC daily
  async ({ step, logger }) => {
    logger.info('Starting daily analytics aggregation');

    // Step 1: Calculate yesterday's date (we aggregate the previous day's complete data)
    const yesterday = await step.run('calculate-yesterday-date', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    });

    logger.info(`Aggregating analytics for date: ${yesterday.toISOString().split('T')[0]}`);

    // Step 2: Run aggregation for yesterday
    const result = await step.run('aggregate-daily-metrics', async () => {
      try {
        await aggregateDailyMetrics(yesterday);
        return {
          success: true,
          date: yesterday.toISOString().split('T')[0],
        };
      } catch (error) {
        logger.error('Failed to aggregate daily metrics', { error });
        throw error;
      }
    });

    logger.info(`Analytics aggregation completed successfully for ${result.date}`);

    // Step 3: Return summary
    return await step.run('generate-summary', async () => {
      return {
        message: 'Daily analytics aggregation completed successfully',
        date: result.date,
        aggregatedAt: new Date().toISOString(),
      };
    });
  }
);
