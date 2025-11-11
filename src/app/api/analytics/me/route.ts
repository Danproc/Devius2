/**
 * GET /api/analytics/me
 *
 * Retrieve analytics for authenticated user's DevCard
 * Supports date range and granularity parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getDevCard } from '@/lib/devcard';
import {
  getAggregatedMetrics,
  getMetricsSummary,
  getTopCountries,
  getTopReferrers,
} from '@/lib/analytics/aggregate';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';

/**
 * GET /api/analytics/me
 * Retrieve authenticated user's analytics
 *
 * Query parameters:
 * - startDate: ISO date string (optional, defaults to 30 days ago)
 * - endDate: ISO date string (optional, defaults to today)
 * - granularity: "daily" | "weekly" | "monthly" (optional, defaults to "daily")
 */
export const GET = withAuthRequired(async (req: NextRequest, context) => {
  const { session } = context;
  const userId = session.user.id;

  try {
    // Fetch user's DevCard
    const devcard = await getDevCard(userId);

    if (!devcard) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: 'You have not created a DevCard yet',
        },
        { status: 404 }
      );
    }

    const username = devcard.github_username;

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const granularity = searchParams.get('granularity') || 'daily';

    // Default date range: last 30 days
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          error: 'Invalid date format',
          message: 'Please provide valid ISO date strings',
        },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          error: 'Invalid date range',
          message: 'Start date must be before end date',
        },
        { status: 400 }
      );
    }

    // Check if user is premium (for detailed analytics)
    const user = await db
      .select({ is_premium: devcards.is_premium })
      .from(devcards)
      .where(eq(devcards.user_id, userId))
      .limit(1);

    const isPremium = user[0]?.is_premium || false;

    // Fetch aggregated metrics
    const [dailyMetrics, summary, topCountries, topReferrers] = await Promise.all([
      getAggregatedMetrics(username, startDate, endDate),
      getMetricsSummary(username, startDate, endDate),
      getTopCountries(username, startDate, endDate, isPremium ? 20 : 5),
      getTopReferrers(username, startDate, endDate, isPremium ? 20 : 5),
    ]);

    // Apply granularity grouping if needed (weekly/monthly)
    let timeSeriesData = dailyMetrics;
    if (granularity === 'weekly' || granularity === 'monthly') {
      timeSeriesData = aggregateByGranularity(dailyMetrics, granularity);
    }

    // Build response
    const response = {
      summary: {
        totalViews: summary.totalViews,
        uniqueVisitors: summary.uniqueVisitors,
        qrScans: summary.qrScans,
        shares: summary.shares,
        connectionRequests: summary.connectionRequests,
      },
      timeSeries: timeSeriesData.map((metric) => ({
        date: metric.date.toISOString().split('T')[0],
        views: metric.totalViews,
        uniqueVisitors: metric.uniqueVisitors,
        qrScans: metric.qrScans,
        shares: metric.shares,
        connectionRequests: metric.connectionRequests,
      })),
      topCountries,
      topReferrers,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      granularity,
      isPremium,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Analytics fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        message: error.message || 'An error occurred while fetching your analytics',
      },
      { status: 500 }
    );
  }
});

/**
 * Helper function to aggregate daily metrics by week or month
 */
function aggregateByGranularity(
  dailyMetrics: any[],
  granularity: 'weekly' | 'monthly'
): any[] {
  if (dailyMetrics.length === 0) return [];

  const grouped = new Map<string, any>();

  dailyMetrics.forEach((metric) => {
    const date = new Date(metric.date);
    let key: string;

    if (granularity === 'weekly') {
      // Get the Monday of the week
      const monday = new Date(date);
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday (0)
      monday.setDate(date.getDate() + diff);
      key = monday.toISOString().split('T')[0];
    } else {
      // Monthly: use first day of month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }

    const existing = grouped.get(key) || {
      date: new Date(key),
      username: metric.username,
      totalViews: 0,
      uniqueVisitors: 0,
      qrScans: 0,
      shares: 0,
      connectionRequests: 0,
      countries: {},
      referrers: {},
    };

    existing.totalViews += metric.totalViews;
    existing.uniqueVisitors += metric.uniqueVisitors;
    existing.qrScans += metric.qrScans;
    existing.shares += metric.shares;
    existing.connectionRequests += metric.connectionRequests;

    // Merge countries and referrers
    Object.entries(metric.countries).forEach(([country, count]) => {
      existing.countries[country] = (existing.countries[country] || 0) + (count as number);
    });
    Object.entries(metric.referrers).forEach(([referrer, count]) => {
      existing.referrers[referrer] = (existing.referrers[referrer] || 0) + (count as number);
    });

    grouped.set(key, existing);
  });

  return Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}
