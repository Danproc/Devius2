'use client';

/**
 * Metrics Chart Component
 *
 * Displays time-series chart of analytics metrics using Recharts
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricsChartProps {
  data: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    qrScans: number;
    shares: number;
    connectionRequests: number;
  }>;
}

type MetricKey = 'views' | 'uniqueVisitors' | 'qrScans' | 'shares' | 'connectionRequests';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  active: boolean;
}

export function MetricsChart({ data }: MetricsChartProps) {
  const [metrics, setMetrics] = useState<MetricConfig[]>([
    { key: 'views', label: 'Views', color: '#3b82f6', active: true },
    { key: 'uniqueVisitors', label: 'Unique Visitors', color: '#1cf491', active: true },
    { key: 'qrScans', label: 'QR Scans', color: '#a855f7', active: false },
    { key: 'shares', label: 'Shares', color: '#ec4899', active: false },
    { key: 'connectionRequests', label: 'Connections', color: '#06b6d4', active: false },
  ]);

  // Toggle metric visibility
  const toggleMetric = (key: MetricKey) => {
    setMetrics((prev) =>
      prev.map((m) => (m.key === key ? { ...m, active: !m.active } : m))
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-[#1e2838] border border-gray-700 rounded-lg p-4 shadow-lg">
        <p className="text-white font-semibold mb-2">{formatDate(label)}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => {
            const metric = metrics.find((m) => m.key === entry.dataKey);
            if (!metric) return null;

            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-300 text-sm">{metric.label}:</span>
                </div>
                <span className="text-white font-medium">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No data available yet</p>
          <p className="text-sm">Start sharing your DevCard to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metric Toggle Buttons */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              metric.active
                ? 'text-white shadow-lg'
                : 'bg-[#1e2838] text-gray-400 hover:bg-[#252e3f]'
            }`}
            style={
              metric.active
                ? {
                    backgroundColor: metric.color,
                    boxShadow: `0 0 20px ${metric.color}40`,
                  }
                : undefined
            }
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2838" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            {metrics
              .filter((m) => m.active)
              .map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  animationDuration={300}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-[#1e2838]">
        {metrics.map((metric) => {
          const total = data.reduce((sum, item) => sum + item[metric.key], 0);
          return (
            <div
              key={metric.key}
              className={`text-center p-3 rounded-lg transition-opacity ${
                metric.active ? 'opacity-100' : 'opacity-40'
              }`}
              style={
                metric.active
                  ? { backgroundColor: `${metric.color}15` }
                  : { backgroundColor: '#1e2838' }
              }
            >
              <div
                className="w-2 h-2 rounded-full mx-auto mb-1"
                style={{ backgroundColor: metric.color }}
              />
              <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
              <p className="text-lg font-bold text-white">{total.toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
