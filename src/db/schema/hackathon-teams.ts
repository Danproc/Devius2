import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { users } from './user';

export const hackathon_teams = pgTable('hackathon_teams', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  hackathon_id: uuid('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  creator_user_id: text('creator_user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),

  // Team Info
  team_name: text('team_name'), // Optional, defaults to submission title

  // Team Members (JSONB array of user_id + metadata)
  members: jsonb('members').notNull().$type<Array<{
    user_id: string;
    joined_at: string; // ISO timestamp
  }>>(),

  // Timestamps
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HackathonTeam = typeof hackathon_teams.$inferSelect;
export type NewHackathonTeam = typeof hackathon_teams.$inferInsert;
