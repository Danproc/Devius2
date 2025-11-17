import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { hackathon_submissions } from './hackathon-submissions';
import { users } from './user';

// Badge types (placement tiers)
export const badgeTypeEnum = pgEnum('badge_type', [
  'gold',   // 1st place
  'silver', // 2nd place
  'bronze'  // 3rd place
]);

export const hackathon_badges = pgTable('hackathon_badges', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hackathon_id: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'restrict' }),
  submission_id: uuid('submission_id').notNull().references(() => hackathon_submissions.id, { onDelete: 'restrict' }),

  // Badge Info
  badge_type: badgeTypeEnum('badge_type').notNull(),

  // Timestamp
  awarded_at: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HackathonBadge = typeof hackathon_badges.$inferSelect;
export type NewHackathonBadge = typeof hackathon_badges.$inferInsert;
