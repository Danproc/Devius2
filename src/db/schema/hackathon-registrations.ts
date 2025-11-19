import { pgTable, uuid, text, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { users } from './user';

// Participation type preference (advisory only)
export const participationTypeEnum = pgEnum('participation_type', ['solo', 'team']);

export const hackathon_registrations = pgTable(
  'hackathon_registrations',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Foreign Keys
    hackathon_id: uuid('hackathon_id')
      .notNull()
      .references(() => hackathons.id, { onDelete: 'cascade' }),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Registration Details
    participation_type: participationTypeEnum('participation_type').notNull(), // solo or team (advisory)

    // Timestamps
    registered_at: timestamp('registered_at', { withTimezone: true }).notNull().defaultNow(),
    unregistered_at: timestamp('unregistered_at', { withTimezone: true }), // null = active registration
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one registration per user per hackathon
    unique_user_hackathon: unique().on(table.hackathon_id, table.user_id),
  })
);

export type HackathonRegistration = typeof hackathon_registrations.$inferSelect;
export type NewHackathonRegistration = typeof hackathon_registrations.$inferInsert;
