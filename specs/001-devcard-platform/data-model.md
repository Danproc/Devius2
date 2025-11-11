# Data Model: DevCard V2

**Feature**: DevCard V2 - Developer Social Business Card Platform
**Date**: 2025-11-11
**Branch**: `001-devcard-platform`
**ORM**: Drizzle ORM 0.38.4 + PostgreSQL (Neon)

## Overview

This document defines the database schema for DevCard V2, extending the existing user authentication schema with DevCard-specific entities. All schemas use Drizzle ORM conventions and integrate with existing NextAuth.js tables.

## Schema Diagram

```text
┌──────────────┐         ┌──────────────────┐         ┌─────────────────┐
│    users     │────────<│    devcards      │>────────│  github_cache   │
│  (existing)  │         │      (NEW)       │         │     (NEW)       │
└──────────────┘         └──────────────────┘         └─────────────────┘
       │                         │
       │                         │
       │                 ┌──────────────────┐
       └────────────────<│   connections    │
                         │      (NEW)       │
                         └──────────────────┘
                                 │
                         ┌──────────────────┐
                         │ analytics_events │
                         │      (NEW)       │
                         └──────────────────┘

┌──────────────┐
│    plans     │────────< users
│  (existing)  │
└──────────────┘
```

## Entity Definitions

### 1. devcards (NEW)

Represents a developer's DevCard profile with customization options.

**File**: `src/db/schema/devcard.ts`

```typescript
import { pgTable, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
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

  // Metadata
  view_count: integer('view_count').default(0).notNull(),
  last_github_sync: timestamp('last_github_sync', { mode: 'date' }),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Indexes
export const devcardsIndexes = {
  urlSlug: 'idx_devcards_url_slug',
  githubUsername: 'idx_devcards_github_username',
  userId: 'idx_devcards_user_id',
};
```

**Validation Rules**:
- `custom_bio`: Max 500 characters
- `url_slug`: Lowercase alphanumeric + hyphens only, unique
- `featured_repos`: Max 6 repositories
- `tech_stack`: Max 20 technologies
- `theme`: Only available to premium users

**State Transitions**:
- `is_public`: Can toggle between true/false
- `availability_status`: User can change at any time
- `last_github_sync`: Updated on manual refresh or auto-sync job

### 2. github_cache (NEW)

Caches GitHub API responses to reduce API calls and handle rate limits.

**File**: `src/db/schema/github-cache.ts`

```typescript
import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
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
});

// Indexes
export const githubCacheIndexes = {
  devcardId: 'idx_github_cache_devcard_id',
  expiresAt: 'idx_github_cache_expires_at',
};
```

**Cache Strategy**:
- **TTL**: 24 hours for profile data
- **Expiration**: Automatic cleanup via scheduled job
- **Fallback**: Used when GitHub API fails or rate limited
- **Refresh**: Manual user-initiated or scheduled background job

### 3. connections (NEW)

Manages connection requests and accepted connections between DevCard users.

**File**: `src/db/schema/connections.ts`

```typescript
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
```

**Business Rules**:
- Cannot send connection request to already connected user
- Cannot send request to blocked user
- Rate limit: 20 requests per hour (enforced in application layer)
- Connection is bidirectional once accepted
- Declining request allows future requests
- Blocking prevents all future requests

**State Transitions**:
```text
pending → accepted
pending → declined
pending → blocked
accepted → blocked (disconnect + block)
```

### 4. analytics_events (NEW)

Tracks privacy-compliant analytics events for DevCard interactions.

**File**: `src/db/schema/analytics.ts`

```typescript
import { pgTable, text, timestamp, index, uuid } from 'drizzle-orm/pg-core';
import { devcards } from './devcard';

export const analytics_events = pgTable('analytics_events', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Event Details
  event_type: text('event_type').$type<
    'card_view' | 'qr_scan' | 'share' | 'connection_request' | 'profile_edit'
  >().notNull(),

  // Target DevCard
  devcard_id: text('devcard_id').references(() => devcards.id, { onDelete: 'cascade' }),
  username: text('username').notNull(), // Denormalized for fast queries

  // Visitor (Hashed, No PII)
  visitor_id: text('visitor_id'), // SHA-256 hash of IP + User Agent

  // Context
  referrer: text('referrer'),
  country: text('country'), // From Vercel geo headers
  share_method: text('share_method'), // twitter, linkedin, qr, email, etc.

  // Timestamp
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('idx_analytics_username_timestamp').on(table.username, table.timestamp),
  index('idx_analytics_devcard_type').on(table.devcard_id, table.event_type),
  index('idx_analytics_timestamp').on(table.timestamp), // For cleanup jobs
]);

// Aggregated Analytics (for fast dashboard queries)
export const analytics_daily = pgTable('analytics_daily', {
  // Composite Key
  username: text('username').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),

  // Metrics
  total_views: integer('total_views').default(0).notNull(),
  unique_visitors: integer('unique_visitors').default(0).notNull(),
  qr_scans: integer('qr_scans').default(0).notNull(),
  shares: integer('shares').default(0).notNull(),
  connection_requests: integer('connection_requests').default(0).notNull(),

  // Geographic breakdown (JSON for flexibility)
  countries: jsonb('countries').$type<Record<string, number>>(), // { "US": 120, "CA": 45 }
  referrers: jsonb('referrers').$type<Record<string, number>>(), // { "twitter.com": 50 }

  // Timestamp
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.username, table.date] }),
  index('idx_analytics_daily_date').on(table.date),
]);
```

**Privacy Compliance**:
- **No PII**: Visitor IDs are one-way hashed (SHA-256 + salt)
- **Country-level only**: No city/region tracking
- **No cookies**: Server-side tracking only
- **GDPR compliant**: Users can export/delete their analytics
- **Retention**: 90 days for raw events, indefinite for aggregated

**Aggregation Schedule**:
- Daily aggregation via Inngest job at 2 AM UTC
- Cleanup of raw events older than 90 days
- Aggregated data retained indefinitely

### 5. notifications (NEW)

Stores in-app notifications for connection requests and system updates.

**File**: `src/db/schema/notifications.ts`

```typescript
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
```

**Cleanup Strategy**:
- Dismissed notifications deleted after 30 days
- Read notifications deleted after 90 days
- Unread notifications retained indefinitely

## Schema Extensions to Existing Tables

### users (EXTEND)

Add GitHub-specific fields to existing user table.

**File**: `src/db/schema/user.ts` (extend existing)

```typescript
export const users = pgTable("app_user", {
  // ... existing fields ...

  // NEW: GitHub Integration
  github_id: integer('github_id').unique(),
  github_username: text('github_username').unique(),

  // NEW: DevCard Premium
  is_premium: boolean('is_premium').default(false).notNull(),
  premium_expires_at: timestamp('premium_expires_at', { mode: 'date' }),

  // ... existing fields ...
});
```

### plans (EXTEND)

Add DevCard-specific plan features.

**File**: `src/db/schema/plans.ts` (extend existing)

```typescript
export const plans = pgTable("plans", {
  // ... existing fields ...

  // NEW: DevCard Features
  features: jsonb('features').$type<{
    custom_themes?: boolean;
    custom_domain?: boolean;
    advanced_analytics?: boolean;
    priority_support?: boolean;
    organization_profiles?: boolean;
  }>(),

  // ... existing fields ...
});
```

## Relationships Summary

```typescript
// One-to-One
users.id → devcards.user_id (unique)
devcards.id → github_cache.devcard_id (unique)

// One-to-Many
users.id → connections.requester_id (many)
users.id → connections.recipient_id (many)
users.id → notifications.user_id (many)
devcards.id → analytics_events.devcard_id (many)

// Many-to-Many
users ↔ users (via connections table)
```

## Migration Plan

### Phase 1: Core Tables

1. Create `devcards` table
2. Create `github_cache` table
3. Extend `users` table with GitHub fields
4. Add indexes

### Phase 2: Networking

1. Create `connections` table
2. Create `blocked_users` table
3. Create `notifications` table
4. Add indexes

### Phase 3: Analytics

1. Create `analytics_events` table
2. Create `analytics_daily` table
3. Add indexes
4. Set up aggregation job

### Phase 4: Premium

1. Extend `plans` table
2. Add premium-related fields to `devcards`
3. Create billing webhook handlers

## Database Indexes Strategy

### Priority 1 (Critical Performance)

```sql
CREATE INDEX idx_devcards_url_slug ON devcards(url_slug);
CREATE INDEX idx_devcards_user_id ON devcards(user_id);
CREATE INDEX idx_analytics_username_timestamp ON analytics_events(username, timestamp);
CREATE INDEX idx_connections_recipient_status ON connections(recipient_id, status);
```

### Priority 2 (Optimization)

```sql
CREATE INDEX idx_github_cache_expires_at ON github_cache(expires_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);
```

### Priority 3 (Analytics/Reports)

```sql
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_connections_requester_status ON connections(requester_id, status);
```

## Data Integrity Constraints

### Check Constraints

```sql
-- DevCard URL slug validation
ALTER TABLE devcards ADD CONSTRAINT url_slug_format
  CHECK (url_slug ~ '^[a-z0-9-]+$');

-- Connection cannot be to self
ALTER TABLE connections ADD CONSTRAINT no_self_connection
  CHECK (requester_id != recipient_id);

-- Featured repos limit
ALTER TABLE devcards ADD CONSTRAINT featured_repos_limit
  CHECK (jsonb_array_length(featured_repos) <= 6);

-- Tech stack limit
ALTER TABLE devcards ADD CONSTRAINT tech_stack_limit
  CHECK (jsonb_array_length(tech_stack) <= 20);
```

### Foreign Key Cascades

- `devcards.user_id`: CASCADE on delete (remove DevCard when user deleted)
- `github_cache.devcard_id`: CASCADE on delete
- `connections`: CASCADE on delete (remove connections when user deleted)
- `notifications.user_id`: CASCADE on delete
- `analytics_events.devcard_id`: CASCADE on delete

## Backup & Retention Policy

- **Production DB**: Daily automated backups (Neon built-in)
- **Analytics raw events**: 90-day retention, then delete
- **Analytics aggregated**: Indefinite retention
- **Notifications**: Auto-cleanup dismissed (30 days) and read (90 days)
- **GitHub cache**: Auto-cleanup expired entries via scheduled job
- **Soft deletes**: Not used - hard deletes with CASCADE

## Next Steps

1. ✅ Data model complete
2. ⏭️ Generate API contracts (OpenAPI spec)
3. ⏭️ Generate quickstart.md
4. ⏭️ Update agent context files
5. ⏭️ Generate tasks.md for implementation
