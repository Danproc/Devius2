import { pgTable, uuid, text, timestamp, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { hackathon_teams } from './hackathon-teams';
import { users } from './user';

// Submission status lifecycle
export const submissionStatusEnum = pgEnum('submission_status', [
  'draft',
  'submitted',
  'disqualified',
  'winner_first',
  'winner_second',
  'winner_third'
]);

export const hackathon_submissions = pgTable('hackathon_submissions', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  hackathon_id: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  team_id: uuid('team_id').references(() => hackathon_teams.id, { onDelete: 'cascade' }), // null for solo
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Solo or team captain

  // Project Details
  project_title: text('project_title').notNull(),
  description: text('description').notNull(), // Max 5000 chars enforced in app
  github_url: text('github_url').notNull(),
  demo_url: text('demo_url'),
  video_url: text('video_url'),
  tech_stack: jsonb('tech_stack').notNull().$type<string[]>(), // Array of tech tags

  // Status & Results
  status: submissionStatusEnum('status').notNull().default('draft'),
  placement: integer('placement'), // 1, 2, 3, or null
  vote_count: integer('vote_count').notNull().default(0), // Denormalized for performance

  // Timestamps
  submitted_at: timestamp('submitted_at', { withTimezone: true }), // When status changed to submitted
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HackathonSubmission = typeof hackathon_submissions.$inferSelect;
export type NewHackathonSubmission = typeof hackathon_submissions.$inferInsert;
