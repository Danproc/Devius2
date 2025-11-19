import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { hackathon_submissions } from './hackathon-submissions';
import { users } from './user';

export const hackathon_votes = pgTable('hackathon_votes', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  hackathon_id: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  submission_id: uuid('submission_id').notNull().references(() => hackathon_submissions.id, { onDelete: 'cascade' }),
  voter_user_id: text('voter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Timestamp
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HackathonVote = typeof hackathon_votes.$inferSelect;
export type NewHackathonVote = typeof hackathon_votes.$inferInsert;
