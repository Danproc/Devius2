import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { hackathon_submissions } from './hackathon-submissions';
import { users } from './user';

/**
 * Hackathon Submission Scores
 * Admin judges score submissions on 4 pillars (0-10 each)
 * Total score calculated as sum × 2.5 = score out of 100
 */
export const hackathon_scores = pgTable('hackathon_scores', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  hackathon_id: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  submission_id: uuid('submission_id').notNull().references(() => hackathon_submissions.id, { onDelete: 'cascade' }),
  judge_user_id: text('judge_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Judging Pillars (0-10 each, equal weight)
  innovation: integer('innovation').notNull().default(0), // Creativity and novelty
  technical_execution: integer('technical_execution').notNull().default(0), // Code quality and difficulty
  design_ux: integer('design_ux').notNull().default(0), // User experience and visual appeal
  completeness: integer('completeness').notNull().default(0), // Polish and finish level

  // Total Score (calculated: sum × 2.5 = out of 100)
  total_score: integer('total_score').notNull().default(0), // 0-100

  // Optional feedback
  notes: text('notes'), // Judge's comments/feedback

  // Timestamps
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HackathonScore = typeof hackathon_scores.$inferSelect;
export type NewHackathonScore = typeof hackathon_scores.$inferInsert;
