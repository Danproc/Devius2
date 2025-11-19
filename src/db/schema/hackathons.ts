import { pgTable, text, timestamp, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './user';

// Hackathon status lifecycle
export const hackathonStatusEnum = pgEnum('hackathon_status', [
  'draft',
  'upcoming',
  'registration',
  'active',
  'voting',
  'completed'
]);

export const hackathons = pgTable('hackathons', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // URL & Identity
  slug: text('slug').notNull().unique(), // URL-safe: build-a-tool-2025-01
  title: text('title').notNull(), // Display name
  theme: text('theme'), // Short theme description
  description: text('description').notNull(), // Full description
  rules: text('rules'), // Detailed rules (markdown)

  // Lifecycle
  status: hackathonStatusEnum('status').notNull().default('draft'),

  // Dates & Deadlines
  registration_start_at: timestamp('registration_start_at', { withTimezone: true }),
  registration_end_at: timestamp('registration_end_at', { withTimezone: true }),
  start_at: timestamp('start_at', { withTimezone: true }).notNull(),
  submission_deadline_at: timestamp('submission_deadline_at', { withTimezone: true }).notNull(),
  voting_start_at: timestamp('voting_start_at', { withTimezone: true }),
  voting_end_at: timestamp('voting_end_at', { withTimezone: true }),

  // Prizes
  prizes: jsonb('prizes').notNull().$type<{
    currency: string; // 'USD'
    first: number;
    second: number;
    third: number;
  }>(),

  // Participation Limits
  max_participants: jsonb('max_participants').$type<number | null>(), // null = unlimited

  // Metadata
  created_by: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Hackathon = typeof hackathons.$inferSelect;
export type NewHackathon = typeof hackathons.$inferInsert;
