import { pgTable, text, timestamp, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './user';

export const devcards = pgTable('devcards', {
  // Primary Key
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Foreign Keys
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),

  // GitHub Integration
  github_username: text('github_username').notNull(),
  github_id: integer('github_id').notNull(),
  github_access_token_expires: timestamp('github_access_token_expires', { mode: 'date' }),

  // URL & Visibility
  url_slug: text('url_slug').notNull().unique(), // e.g., "johndoe"
  is_public: boolean('is_public').default(true).notNull(),
  custom_domain: text('custom_domain'), // Premium: e.g., "card.johndoe.dev"
  custom_domain_verified: boolean('custom_domain_verified').default(false),

  // Profile Data
  display_name: text('display_name'), // Can override GitHub name
  custom_bio: text('custom_bio'), // Max 500 chars, separate from GitHub bio
  location: text('location'), // From GitHub or custom
  avatar_url: text('avatar_url').notNull(), // Cached from GitHub

  // Social Links
  social_links: jsonb('social_links').$type<{
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  }>(),

  // Featured Content
  featured_repos: jsonb('featured_repos').$type<string[]>(), // Array of repo full names
  tech_stack: jsonb('tech_stack').$type<string[]>(), // Array of technology names

  // Availability
  availability_status: text('availability_status').$type<
    'open' | 'available' | 'not-available' | 'custom'
  >(),
  availability_message: text('availability_message'), // For custom status

  // Theme (Premium)
  theme: jsonb('theme').$type<{
    name: string; // e.g., "default", "midnight", "ocean"
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  }>(),

  // Organization Profile (Premium - T118)
  organization_profile: jsonb('organization_profile').$type<{
    name?: string;
    description?: string;
    website?: string;
    members?: Array<{
      github_username: string;
      role: string;
      display_name?: string;
    }>;
    company_size?: string;
    industry?: string;
    founded_year?: number;
  }>(),

  // Metadata
  view_count: integer('view_count').default(0).notNull(),
  last_github_sync: timestamp('last_github_sync', { mode: 'date' }),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('idx_devcards_url_slug').on(table.url_slug),
  index('idx_devcards_github_username').on(table.github_username),
  index('idx_devcards_user_id').on(table.user_id),
]);
