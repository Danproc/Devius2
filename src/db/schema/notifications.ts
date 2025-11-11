import { pgTable, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './user';

export const notifications = pgTable('notifications', {
  // Primary Key
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Recipient
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Notification Details
  type: text('type').$type<
    'connection_request' | 'connection_accepted' | 'system_update' | 'premium_reminder'
  >().notNull(),

  title: text('title').notNull(),
  message: text('message').notNull(),

  // Action Link
  action_url: text('action_url'), // e.g., "/app/network/requests"

  // Metadata
  metadata: jsonb('metadata').$type<{
    requester_id?: string;
    requester_name?: string;
    connection_id?: string;
  }>(),

  // Status
  is_read: boolean('is_read').default(false).notNull(),
  is_dismissed: boolean('is_dismissed').default(false).notNull(),

  // Timestamps
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  read_at: timestamp('read_at', { mode: 'date' }),
}, (table) => [
  index('idx_notifications_user_unread').on(table.user_id, table.is_read),
  index('idx_notifications_created').on(table.created_at),
]);
