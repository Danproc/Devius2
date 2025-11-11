'use client';

/**
 * Analytics Dashboard Component
 *
 * Main analytics dashboard displaying all metrics, charts, and breakdowns
 */

import { useState, useEffect } from 'react';
import { MetricsChart } from './metrics-chart';
import {
  Eye,
  Users,
  QrCode,
  Share2,
  UserPlus,
  TrendingUp,
  Globe,
  ExternalLink,
  Crown
} from 'lucide-react';

interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  qrScans: number;
  shares: number;
  connectionRequests: number;
}

interface TimeSeriesData {
  date: string;
  views: number;
  uniqueVisitors: number;
  qrScans: number;
  shares: number;
  connectionRequests: number;
}

interface CountryData {
  country: string;
  count: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesData[];
  topCountries: CountryData[];
  topReferrers: ReferrerData[];
  dateRange: {
    start: string;
    end: string;
  };
  granularity: string;
  isPremium: boolean;
}

type DateRangeOption = '7' | '30' | '90' | 'custom';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        let startDate: Date;
        const endDate = new Date();

        if (dateRange === 'custom' && customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate.setTime(new Date(customEndDate).getTime());
        } else {
          const days = parseInt(dateRange);
          startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
        }

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          granularity: 'daily',
        });

        const response = await fetch(`/api/analytics/me?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const analyticsData: AnalyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1cf491]"></div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
        <p className="text-red-400">{error || 'Failed to load analytics data'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-3 bg-[#121824] rounded-lg p-4">
        <span className="text-gray-400 text-sm font-medium">Time Period:</span>
        <div className="flex gap-2">
          {(['7', '30', '90'] as DateRangeOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setDateRange(option)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === option
                  ? 'bg-[#1cf491] text-black'
                  : 'bg-[#1e2838] text-gray-300 hover:bg-[#252e3f]'
              }`}
            >
              Last {option} days
            </button>
          ))}
          <button
            onClick={() => setDateRange('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === 'custom'
                ? 'bg-[#1cf491] text-black'
                : 'bg-[#1e2838] text-gray-300 hover:bg-[#252e3f]'
            }`}
          >
            Custom
          </button>
        </div>

        {dateRange === 'custom' && (
          <div className="flex items-center gap-3 ml-4">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-2 bg-[#1e2838] border border-gray-700 rounded-lg text-white text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-2 bg-[#1e2838] border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Premium Badge */}
      {data.isPremium && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-lg p-3">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">
            Premium Analytics Active - Detailed insights enabled
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Views"
          value={data.summary.totalViews}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Unique Visitors"
          value={data.summary.uniqueVisitors}
          color="green"
        />
        <MetricCard
          icon={<QrCode className="w-5 h-5" />}
          label="QR Scans"
          value={data.summary.qrScans}
          color="purple"
        />
        <MetricCard
          icon={<Share2 className="w-5 h-5" />}
          label="Shares"
          value={data.summary.shares}
          color="pink"
        />
        <MetricCard
          icon={<UserPlus className="w-5 h-5" />}
          label="Connections"
          value={data.summary.connectionRequests}
          color="cyan"
        />
      </div>

      {/* Time Series Chart */}
      <div className="bg-[#121824] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#1cf491]" />
          <h2 className="text-xl font-semibold text-white">Activity Over Time</h2>
        </div>
        <MetricsChart data={data.timeSeries} />
      </div>

      {/* Geographic and Referrer Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-[#121824] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-[#1cf491]" />
            <h2 className="text-xl font-semibold text-white">Top Countries</h2>
            {!data.isPremium && (
              <span className="ml-auto text-xs text-gray-400">Top 5 only</span>
            )}
          </div>

          {data.topCountries.length > 0 ? (
            <div className="space-y-3">
              {data.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#1e2838] rounded-full flex items-center justify-center text-sm font-medium text-gray-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{country.country}</span>
                      <span className="text-gray-400 text-sm">{country.count}</span>
                    </div>
                    <div className="w-full bg-[#1e2838] rounded-full h-2">
                      <div
                        className="bg-[#1cf491] h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(country.count / data.topCountries[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No country data available yet</p>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-[#121824] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <ExternalLink className="w-5 h-5 text-[#1cf491]" />
            <h2 className="text-xl font-semibold text-white">Top Referrers</h2>
            {!data.isPremium && (
              <span className="ml-auto text-xs text-gray-400">Top 5 only</span>
            )}
          </div>

          {data.topReferrers.length > 0 ? (
            <div className="space-y-3">
              {data.topReferrers.map((referrer, index) => (
                <div key={referrer.referrer} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#1e2838] rounded-full flex items-center justify-center text-sm font-medium text-gray-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium truncate">{referrer.referrer}</span>
                      <span className="text-gray-400 text-sm">{referrer.count}</span>
                    </div>
                    <div className="w-full bg-[#1e2838] rounded-full h-2">
                      <div
                        className="bg-[#1cf491] h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(referrer.count / data.topReferrers[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No referrer data available yet</p>
          )}
        </div>
      </div>

      {/* Upgrade Prompt for Non-Premium Users */}
      {!data.isPremium && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Crown className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Unlock Premium Analytics
              </h3>
              <p className="text-gray-300 mb-4">
                Get access to detailed insights including city-level geographic data, complete
                referrer breakdown, and advanced metrics to better understand your audience.
              </p>
              <a
                href="/app/billing/plans"
                className="inline-flex items-center px-4 py-2 bg-[#1cf491] hover:bg-[#1cf491]/90 text-black font-semibold rounded-lg transition-colors"
              >
                Upgrade to Premium
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'pink' | 'cyan';
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-[#1cf491]',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className="bg-[#121824] rounded-lg p-6 border border-[#1e2838] hover:border-[#1cf491]/30 transition-colors">
      <div className={`${colorClasses[color]} mb-3`}>{icon}</div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
