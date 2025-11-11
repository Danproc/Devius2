/**
 * Analytics TypeScript Types
 *
 * Type definitions for privacy-compliant analytics tracking and reporting.
 */

// Analytics event types
export type AnalyticsEventType =
  | 'card_view'
  | 'qr_scan'
  | 'share'
  | 'connection_request'
  | 'profile_edit';

// Share method types
export type ShareMethod =
  | 'twitter'
  | 'linkedin'
  | 'email'
  | 'qr'
  | 'copy_link'
  | 'wallet_pass'
  | 'other';

// Analytics event (raw event data)
export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  devcard_id: string | null;
  username: string;
  visitor_id: string | null; // Hashed visitor ID
  referrer: string | null;
  country: string | null; // ISO country code
  share_method: string | null;
  timestamp: Date;
}

// Analytics event creation data
export interface AnalyticsEventCreate {
  event_type: AnalyticsEventType;
  devcard_id?: string;
  username: string;
  visitor_id?: string; // Will be hashed server-side
  referrer?: string;
  country?: string;
  share_method?: ShareMethod;
}

// Daily aggregated analytics
export interface AnalyticsDailySummary {
  username: string;
  date: Date;
  total_views: number;
  unique_visitors: number;
  qr_scans: number;
  shares: number;
  connection_requests: number;
  countries: Record<string, number>; // Country code -> count
  referrers: Record<string, number>; // Domain -> count
  created_at: Date;
}

// Analytics summary for a date range
export interface AnalyticsSummary {
  username: string;
  date_range: {
    start: Date;
    end: Date;
  };
  totals: {
    total_views: number;
    unique_visitors: number;
    qr_scans: number;
    shares: number;
    connection_requests: number;
  };
  daily_data: AnalyticsDailySummary[];
  top_countries: Array<{
    country: string;
    count: number;
  }>;
  top_referrers: Array<{
    referrer: string;
    count: number;
  }>;
  share_methods: Record<ShareMethod, number>;
}

// Analytics dashboard data
export interface AnalyticsDashboard {
  summary: {
    total_views: number;
    unique_visitors: number;
    qr_scans: number;
    shares: number;
    connection_requests: number;
    average_daily_views: number;
  };
  trends: {
    views_change_percent: number; // Compared to previous period
    visitors_change_percent: number;
    scans_change_percent: number;
    shares_change_percent: number;
  };
  time_series: Array<{
    date: string; // YYYY-MM-DD format
    views: number;
    unique_visitors: number;
    qr_scans: number;
    shares: number;
  }>;
  geographic: Array<{
    country: string;
    country_name: string;
    count: number;
    percentage: number;
  }>;
  referrers: Array<{
    referrer: string;
    count: number;
    percentage: number;
  }>;
  share_breakdown: Array<{
    method: ShareMethod;
    count: number;
    percentage: number;
  }>;
}

// Analytics query parameters
export interface AnalyticsQuery {
  username: string;
  start_date?: Date;
  end_date?: Date;
  granularity?: 'daily' | 'weekly' | 'monthly';
  event_type?: AnalyticsEventType;
  country?: string;
}

// Analytics export data
export interface AnalyticsExport {
  username: string;
  exported_at: Date;
  date_range: {
    start: Date;
    end: Date;
  };
  events: AnalyticsEvent[];
  summary: AnalyticsSummary;
}

// Privacy-compliant visitor tracking
export interface VisitorMetadata {
  ip_address: string; // Will be hashed, never stored in plaintext
  user_agent: string;
  timestamp: number;
}

// Hashed visitor ID (for privacy)
export interface HashedVisitorId {
  hash: string; // SHA-256 hash
  expires_at: Date; // 24-hour TTL
}

// Analytics retention policy
export const ANALYTICS_RETENTION = {
  RAW_EVENTS_DAYS: 90, // Delete raw events after 90 days
  AGGREGATED_RETENTION: 'indefinite', // Keep aggregated data
  VISITOR_HASH_TTL_HOURS: 24, // Visitor hash expires after 24 hours
} as const;

// Analytics permissions (premium vs free)
export interface AnalyticsPermissions {
  can_view_basic: boolean; // Basic metrics (views, scans)
  can_view_geographic: boolean; // Country-level only for free
  can_view_referrers: boolean; // Limited for free
  can_view_detailed_geographic: boolean; // City-level for premium
  can_export_data: boolean; // Premium only
  can_view_historical: boolean; // >90 days for premium
  retention_days: number; // 90 for free, unlimited for premium
}
