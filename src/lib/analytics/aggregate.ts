/**
 * Analytics Aggregation Functions
 *
 * Aggregates raw analytics events into daily summaries
 * for fast dashboard queries and reporting
 */

import { db } from '@/db';
import { analytics_events, analytics_daily } from '@/db/schema/analytics';
import { sql, eq, and, gte, lte, count, countDistinct } from 'drizzle-orm';

interface DailyMetrics {
  username: string;
  date: Date;
  totalViews: number;
  uniqueVisitors: number;
  qrScans: number;
  shares: number;
  connectionRequests: number;
  countries: Record<string, number>;
  referrers: Record<string, number>;
}

/**
 * Aggregate analytics events for a specific date
 *
 * @param date - Date to aggregate (defaults to yesterday)
 * @param username - Optional: aggregate for specific username only
 * @returns Promise<void>
 */
export async function aggregateDailyMetrics(
  date?: Date,
  username?: string
): Promise<void> {
  // Default to yesterday (current day data is still being collected)
  const targetDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Set to start of day (midnight UTC)
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  // Set to end of day (23:59:59.999 UTC)
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  try {
    // Get all unique usernames for the date (or just the specified username)
    const usernameFilter = username ? eq(analytics_events.username, username) : undefined;

    const usernamesResult = await db
      .selectDistinct({ username: analytics_events.username })
      .from(analytics_events)
      .where(
        and(
          gte(analytics_events.timestamp, startOfDay),
          lte(analytics_events.timestamp, endOfDay),
          usernameFilter
        )
      );

    const usernames = usernamesResult.map(r => r.username);

    // Aggregate metrics for each username
    for (const user of usernames) {
      const metrics = await calculateMetricsForUser(user, startOfDay, endOfDay);

      // Upsert into analytics_daily table
      await db
        .insert(analytics_daily)
        .values({
          username: user,
          date: startOfDay,
          total_views: metrics.totalViews,
          unique_visitors: metrics.uniqueVisitors,
          qr_scans: metrics.qrScans,
          shares: metrics.shares,
          connection_requests: metrics.connectionRequests,
          countries: metrics.countries,
          referrers: metrics.referrers,
        })
        .onConflictDoUpdate({
          target: [analytics_daily.username, analytics_daily.date],
          set: {
            total_views: sql`excluded.total_views`,
            unique_visitors: sql`excluded.unique_visitors`,
            qr_scans: sql`excluded.qr_scans`,
            shares: sql`excluded.shares`,
            connection_requests: sql`excluded.connection_requests`,
            countries: sql`excluded.countries`,
            referrers: sql`excluded.referrers`,
          },
        });
    }

    console.log(`[Analytics] Aggregated metrics for ${usernames.length} users on ${startOfDay.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error('[Analytics] Failed to aggregate daily metrics:', error);
    throw error;
  }
}

/**
 * Calculate metrics for a specific user and date range
 *
 * @param username - Username to calculate metrics for
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Promise<DailyMetrics>
 */
async function calculateMetricsForUser(
  username: string,
  startDate: Date,
  endDate: Date
): Promise<Omit<DailyMetrics, 'username' | 'date'>> {
  // Get all events for the user in the date range
  const events = await db
    .select()
    .from(analytics_events)
    .where(
      and(
        eq(analytics_events.username, username),
        gte(analytics_events.timestamp, startDate),
        lte(analytics_events.timestamp, endDate)
      )
    );

  // Calculate metrics
  const totalViews = events.filter(e => e.event_type === 'card_view').length;
  const qrScans = events.filter(e => e.event_type === 'qr_scan').length;
  const shares = events.filter(e => e.event_type === 'share').length;
  const connectionRequests = events.filter(e => e.event_type === 'connection_request').length;

  // Calculate unique visitors (count distinct visitor_ids for card_view events)
  const uniqueVisitorIds = new Set(
    events
      .filter(e => e.event_type === 'card_view' && e.visitor_id)
      .map(e => e.visitor_id)
  );
  const uniqueVisitors = uniqueVisitorIds.size;

  // Aggregate countries
  const countries: Record<string, number> = {};
  events.forEach(event => {
    if (event.country) {
      countries[event.country] = (countries[event.country] || 0) + 1;
    }
  });

  // Aggregate referrers
  const referrers: Record<string, number> = {};
  events.forEach(event => {
    if (event.referrer) {
      referrers[event.referrer] = (referrers[event.referrer] || 0) + 1;
    }
  });

  return {
    totalViews,
    uniqueVisitors,
    qrScans,
    shares,
    connectionRequests,
    countries,
    referrers,
  };
}

/**
 * Get aggregated metrics for a user within a date range
 *
 * @param username - Username to get metrics for
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Promise<DailyMetrics[]>
 */
export async function getAggregatedMetrics(
  username: string,
  startDate: Date,
  endDate: Date
): Promise<DailyMetrics[]> {
  const results = await db
    .select()
    .from(analytics_daily)
    .where(
      and(
        eq(analytics_daily.username, username),
        gte(analytics_daily.date, startDate),
        lte(analytics_daily.date, endDate)
      )
    )
    .orderBy(analytics_daily.date);

  return results.map(row => ({
    username: row.username,
    date: row.date,
    totalViews: row.total_views,
    uniqueVisitors: row.unique_visitors,
    qrScans: row.qr_scans,
    shares: row.shares,
    connectionRequests: row.connection_requests,
    countries: row.countries as Record<string, number> || {},
    referrers: row.referrers as Record<string, number> || {},
  }));
}

/**
 * Get total metrics summary for a user
 *
 * @param username - Username to get summary for
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @returns Promise with summed metrics
 */
export async function getMetricsSummary(
  username: string,
  startDate?: Date,
  endDate?: Date
) {
  const conditions = [eq(analytics_daily.username, username)];

  if (startDate) {
    conditions.push(gte(analytics_daily.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(analytics_daily.date, endDate));
  }

  const result = await db
    .select({
      totalViews: sql<number>`SUM(${analytics_daily.total_views})::int`,
      uniqueVisitors: sql<number>`SUM(${analytics_daily.unique_visitors})::int`,
      qrScans: sql<number>`SUM(${analytics_daily.qr_scans})::int`,
      shares: sql<number>`SUM(${analytics_daily.shares})::int`,
      connectionRequests: sql<number>`SUM(${analytics_daily.connection_requests})::int`,
    })
    .from(analytics_daily)
    .where(and(...conditions));

  return result[0] || {
    totalViews: 0,
    uniqueVisitors: 0,
    qrScans: 0,
    shares: 0,
    connectionRequests: 0,
  };
}

/**
 * Get top countries for a user
 *
 * @param username - Username to get countries for
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @param limit - Maximum number of countries to return
 * @returns Promise with country breakdown
 */
export async function getTopCountries(
  username: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 10
): Promise<Array<{ country: string; count: number }>> {
  const metrics = await getAggregatedMetrics(
    username,
    startDate || new Date(0),
    endDate || new Date()
  );

  // Merge all countries across days
  const countryCounts: Record<string, number> = {};
  metrics.forEach(day => {
    Object.entries(day.countries).forEach(([country, count]) => {
      countryCounts[country] = (countryCounts[country] || 0) + count;
    });
  });

  // Sort and return top N
  return Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top referrers for a user
 *
 * @param username - Username to get referrers for
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @param limit - Maximum number of referrers to return
 * @returns Promise with referrer breakdown
 */
export async function getTopReferrers(
  username: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 10
): Promise<Array<{ referrer: string; count: number }>> {
  const metrics = await getAggregatedMetrics(
    username,
    startDate || new Date(0),
    endDate || new Date()
  );

  // Merge all referrers across days
  const referrerCounts: Record<string, number> = {};
  metrics.forEach(day => {
    Object.entries(day.referrers).forEach(([referrer, count]) => {
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + count;
    });
  });

  // Sort and return top N
  return Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
