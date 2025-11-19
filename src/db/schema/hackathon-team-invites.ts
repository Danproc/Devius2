import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { hackathon_teams } from './hackathon-teams';
import { users } from './user';

// Team invite status
export const teamInviteStatusEnum = pgEnum('team_invite_status', [
  'pending',
  'accepted',
  'declined',
  'expired'
]);

export const hackathon_team_invites = pgTable('hackathon_team_invites', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Keys
  team_id: uuid('team_id').notNull().references(() => hackathon_teams.id, { onDelete: 'cascade' }),
  inviter_user_id: text('inviter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invitee_user_id: text('invitee_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Status
  status: teamInviteStatusEnum('status').notNull().default('pending'),

  // Timestamps
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  responded_at: timestamp('responded_at', { withTimezone: true }),
});

export type HackathonTeamInvite = typeof hackathon_team_invites.$inferSelect;
export type NewHackathonTeamInvite = typeof hackathon_team_invites.$inferInsert;
