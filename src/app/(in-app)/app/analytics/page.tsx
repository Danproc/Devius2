/**
 * Analytics Dashboard Page
 *
 * Displays comprehensive analytics for user's DevCard including:
 * - Total views, unique visitors, QR scans, shares, connection requests
 * - Time-series chart of activity
 * - Geographic breakdown by country
 * - Referrer sources breakdown
 * - Date range selector for custom time periods
 */

import { Suspense } from 'react';
import { Metadata } from 'next/metadata';
import { AnalyticsDashboard } from '@/components/analytics/dashboard';

export const metadata: Metadata = {
  title: 'Analytics - DevCard',
  description: 'View detailed analytics for your DevCard including views, shares, and engagement metrics.',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">
          Track your DevCard performance and engagement metrics
        </p>
      </div>

      {/* Analytics Dashboard */}
      <Suspense fallback={<AnalyticsDashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton for analytics dashboard
 */
function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#121824] rounded-lg p-6 h-28">
            <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-[#121824] rounded-lg p-6 h-96">
        <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
        <div className="h-full bg-gray-700 rounded"></div>
      </div>

      {/* Breakdown Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#121824] rounded-lg p-6 h-80">
          <div className="h-6 bg-gray-700 rounded w-40 mb-6"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-[#121824] rounded-lg p-6 h-80">
          <div className="h-6 bg-gray-700 rounded w-40 mb-6"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
