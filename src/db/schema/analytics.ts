import { pgTable, text, timestamp, index, uuid, integer, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { devcards } from './devcard';

export const analytics_events = pgTable('analytics_events', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Event Details
  event_type: text('event_type').$type<
    'card_view' | 'qr_scan' | 'share' | 'connection_request' | 'profile_edit'
  >().notNull(),

  // Target DevCard
  devcard_id: text('devcard_id').references(() => devcards.id, { onDelete: 'cascade' }),
  username: text('username').notNull(), // Denormalized for fast queries

  // Visitor (Hashed, No PII)
  visitor_id: text('visitor_id'), // SHA-256 hash of IP + User Agent

  // Context
  referrer: text('referrer'),
  country: text('country'), // From Vercel geo headers
  share_method: text('share_method'), // twitter, linkedin, qr, email, etc.

  // Timestamp
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('idx_analytics_username_timestamp').on(table.username, table.timestamp),
  index('idx_analytics_devcard_type').on(table.devcard_id, table.event_type),
  index('idx_analytics_timestamp').on(table.timestamp), // For cleanup jobs
]);

// Aggregated Analytics (for fast dashboard queries)
export const analytics_daily = pgTable('analytics_daily', {
  // Composite Key
  username: text('username').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),

  // Metrics
  total_views: integer('total_views').default(0).notNull(),
  unique_visitors: integer('unique_visitors').default(0).notNull(),
  qr_scans: integer('qr_scans').default(0).notNull(),
  shares: integer('shares').default(0).notNull(),
  connection_requests: integer('connection_requests').default(0).notNull(),

  // Geographic breakdown (JSON for flexibility)
  countries: jsonb('countries').$type<Record<string, number>>(), // { "US": 120, "CA": 45 }
  referrers: jsonb('referrers').$type<Record<string, number>>(), // { "twitter.com": 50 }

  // Timestamp
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.username, table.date] }),
  index('idx_analytics_daily_date').on(table.date),
]);
