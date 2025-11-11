import { pgTable, text, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user';

export const connections = pgTable('connections', {
  // Composite Primary Key
  requester_id: text('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipient_id: text('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Status
  status: text('status').$type<'pending' | 'accepted' | 'declined' | 'blocked'>().notNull(),

  // Message
  message: text('message'), // Optional message with connection request

  // Timestamps
  requested_at: timestamp('requested_at', { mode: 'date' }).defaultNow().notNull(),
  responded_at: timestamp('responded_at', { mode: 'date' }),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.requester_id, table.recipient_id] }),
  index('idx_connections_recipient').on(table.recipient_id, table.status),
  index('idx_connections_requester').on(table.requester_id, table.status),
]);

// Blocked users table (separate for easier querying)
export const blocked_users = pgTable('blocked_users', {
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blocked_user_id: text('blocked_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blocked_at: timestamp('blocked_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.user_id, table.blocked_user_id] }),
  index('idx_blocked_users_user').on(table.user_id),
]);
