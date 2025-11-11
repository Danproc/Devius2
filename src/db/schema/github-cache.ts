import { pgTable, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { devcards } from './devcard';

export const github_cache = pgTable('github_cache', {
  // Primary Key
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Foreign Key
  devcard_id: text('devcard_id').notNull().references(() => devcards.id, { onDelete: 'cascade' }),

  // GitHub Profile Data
  login: text('login').notNull(),
  name: text('name'),
  bio: text('bio'),
  location: text('location'),
  email: text('email'),
  avatar_url: text('avatar_url').notNull(),
  html_url: text('html_url').notNull(),

  // GitHub Stats
  public_repos: integer('public_repos').default(0).notNull(),
  public_gists: integer('public_gists').default(0).notNull(),
  followers: integer('followers').default(0).notNull(),
  following: integer('following').default(0).notNull(),
  total_stars: integer('total_stars').default(0), // Calculated
  contribution_streak: integer('contribution_streak').default(0), // Days

  // Repository Data
  repositories: jsonb('repositories').$type<Array<{
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    topics: string[];
  }>>(),

  // Contribution Data
  contributions: jsonb('contributions').$type<{
    last_year_total: number;
    current_streak: number;
    longest_streak: number;
  }>(),

  // Metadata
  cached_at: timestamp('cached_at', { mode: 'date' }).defaultNow().notNull(),
  expires_at: timestamp('expires_at', { mode: 'date' }).notNull(),
}, (table) => [
  index('idx_github_cache_devcard_id').on(table.devcard_id),
  index('idx_github_cache_expires_at').on(table.expires_at),
]);
