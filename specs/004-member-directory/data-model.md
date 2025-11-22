# Data Model: Member Directory

**Feature**: 004-member-directory
**Date**: 2025-11-22
**Status**: Phase 1 Design

## Overview

This document defines the data structures, database queries, and entity relationships for the member directory feature. All data models leverage existing database tables with no schema changes required.

---

## Primary Entities

### 1. MemberSummary (API Response Type)

**Purpose**: Represents a member's profile information as shown in the directory

**Structure**:
```typescript
interface MemberSummary {
  // Identity
  id: string;                          // DevCard ID (UUID)
  user_id: string;                     // User ID (UUID)
  url_slug: string;                    // Profile URL (e.g., "johndoe")

  // Profile Information
  display_name: string | null;         // Custom display name or null
  github_username: string;             // GitHub username (required)
  avatar_url: string;                  // Profile picture URL
  location: string | null;             // Geographic location
  custom_bio: string | null;           // Bio text (max 500 chars, truncated for display)

  // Technology & Skills
  tech_stack: string[] | null;         // Array of technology names

  // Community Status
  member_number: number;               // Sequential member number (#1, #2, etc.)
  achievement_count: number;           // Total achievements earned
  hackathon_badges: HackathonBadgeSummary[]; // Winner badges
  availability_status: AvailabilityStatus;   // open | available | not-available | custom

  // Metadata (not displayed in card, but available)
  is_public: boolean;                  // Directory visibility (always true in results)
  created_at: Date;                    // Join date
}
```

**Source Tables**:
- Primary: `devcards` table
- Join: `users` table (for user.name fallback)
- Aggregate: `user_achievements` table (for count)
- Aggregate: `hackathon_badges` table (for badges)

**Display Rules**:
- Show `display_name` if set, else `users.name`, else `github_username`
- Truncate `custom_bio` to 150 characters with "..." for card display
- Show up to 5 tech stack badges, "+ N more" if > 5
- Only show members where `is_public = true`

---

### 2. HackathonBadgeSummary

**Purpose**: Represents a hackathon winner badge

**Structure**:
```typescript
interface HackathonBadgeSummary {
  badge_type: 'gold' | 'silver' | 'bronze'; // 1st, 2nd, 3rd place
  hackathon_name: string;                   // Name of hackathon
  earned_at: Date;                          // Date awarded
}
```

**Source**: `hackathon_badges` table joined with `hackathons` table

---

### 3. DirectoryFilters (Client State)

**Purpose**: Represents active search/filter criteria

**Structure**:
```typescript
interface DirectoryFilters {
  search: string;                      // Name/username search query
  location: string | null;             // Selected location filter
  tech_stack: string[];                // Selected technologies
  achievement_types: string[];         // Selected achievement filters
  winners_only: boolean;               // Show only hackathon winners
  sort: 'newest' | 'oldest';           // Sort order (newest is default)
}
```

**Storage**: Client-side React state (not persisted)

---

### 4. MembersSearchResponse (API Response)

**Purpose**: Complete API response with pagination

**Structure**:
```typescript
interface MembersSearchResponse {
  members: MemberSummary[];
  pagination: {
    total: number;                     // Total members matching filters
    pageCount: number;                 // Total pages
    currentPage: number;               // Current page number
    perPage: number;                   // Results per page (20)
  };
  filters: {
    locations: string[];               // Available location options
    technologies: string[];            // Available tech stack options
    achievement_types: string[];       // Available achievement filters
  };
}
```

---

## Database Queries

### Query 1: Search Members with Filters

**Purpose**: Fetch paginated members matching all active filters

**Input Parameters**:
```typescript
{
  search?: string;           // Optional text search
  location?: string;         // Optional location filter
  tech_stack?: string[];     // Optional tech stack filter (array)
  achievement_types?: string[]; // Optional achievement filters
  winners_only?: boolean;    // Optional hackathon winners filter
  page: number;              // Required (default 1)
  limit: number;             // Required (default 20)
  sort?: 'newest' | 'oldest'; // Optional (default 'newest')
}
```

**Drizzle ORM Implementation**:
```typescript
import { and, or, eq, like, desc, asc, sql, exists } from 'drizzle-orm';
import { devcards, users, userAchievements, hackathonBadges } from '@/db/schema';

async function searchMembers(params: SearchParams) {
  const { search, location, tech_stack, winners_only, page, limit, sort } = params;
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions = [eq(devcards.is_public, true)]; // Only public profiles

  // Text search (name or username)
  if (search && search.trim()) {
    conditions.push(
      or(
        like(users.name, `%${search}%`),
        like(devcards.github_username, `%${search}%`),
        like(devcards.display_name, `%${search}%`)
      )
    );
  }

  // Location filter
  if (location) {
    conditions.push(like(devcards.location, `%${location}%`));
  }

  // Tech stack filter (JSONB array contains)
  if (tech_stack && tech_stack.length > 0) {
    conditions.push(
      sql`${devcards.tech_stack} @> ${JSON.stringify(tech_stack)}::jsonb`
    );
  }

  // Hackathon winners only filter
  if (winners_only) {
    conditions.push(
      exists(
        db.select({ id: hackathonBadges.id })
          .from(hackathonBadges)
          .where(eq(hackathonBadges.user_id, devcards.user_id))
      )
    );
  }

  // Achievement type filter (if specified)
  if (achievement_types && achievement_types.length > 0) {
    conditions.push(
      exists(
        db.select({ id: userAchievements.id })
          .from(userAchievements)
          .where(
            and(
              eq(userAchievements.user_id, devcards.user_id),
              inArray(userAchievements.achievement_type, achievement_types)
            )
          )
      )
    );
  }

  const whereClause = and(...conditions);

  // Determine sort order
  const orderBy = sort === 'oldest'
    ? asc(devcards.member_number)
    : desc(devcards.member_number);

  // Execute parallel queries
  const [membersList, totalCount] = await Promise.all([
    // Get members
    db
      .select({
        id: devcards.id,
        user_id: devcards.user_id,
        url_slug: devcards.url_slug,
        display_name: devcards.display_name,
        github_username: devcards.github_username,
        avatar_url: devcards.avatar_url,
        location: devcards.location,
        custom_bio: devcards.custom_bio,
        tech_stack: devcards.tech_stack,
        member_number: devcards.member_number,
        availability_status: devcards.availability_status,
        is_public: devcards.is_public,
        created_at: devcards.created_at,
        user_name: users.name, // Fallback name
      })
      .from(devcards)
      .innerJoin(users, eq(devcards.user_id, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    // Get total count
    db
      .select({ count: sql<number>`count(*)` })
      .from(devcards)
      .innerJoin(users, eq(devcards.user_id, users.id))
      .where(whereClause)
      .then((res) => Number(res[0].count))
  ]);

  return { membersList, totalCount };
}
```

**Performance Notes**:
- Query uses existing indexes on `devcards.is_public`, `devcards.url_slug`, `devcards.member_number`
- Consider adding composite index if performance degrades: `(is_public, member_number DESC)`
- JSONB containment operator `@>` is optimized with GIN index on `tech_stack` column (add if needed)

---

### Query 2: Get Achievement Count per Member

**Purpose**: Fetch total achievements for each member (used in results)

**Implementation**:
```typescript
// Subquery approach (embedded in main query)
async function getMembersWithAchievements(memberIds: string[]) {
  const achievements = await db
    .select({
      user_id: userAchievements.user_id,
      count: sql<number>`count(*)`,
    })
    .from(userAchievements)
    .where(inArray(userAchievements.user_id, memberIds))
    .groupBy(userAchievements.user_id);

  // Map to member IDs
  const achievementMap = new Map(
    achievements.map(a => [a.user_id, Number(a.count)])
  );

  return achievementMap;
}
```

**Alternative**: Add as subquery in main SELECT for single-query approach

---

### Query 3: Get Hackathon Badges per Member

**Purpose**: Fetch hackathon winner badges for directory display

**Implementation**:
```typescript
async function getHackathonBadges(userIds: string[]) {
  const badges = await db
    .select({
      user_id: hackathonBadges.user_id,
      badge_type: hackathonBadges.badge_type,
      hackathon_name: hackathons.name,
      earned_at: hackathonBadges.created_at,
    })
    .from(hackathonBadges)
    .innerJoin(hackathons, eq(hackathonBadges.hackathon_id, hackathons.id))
    .where(inArray(hackathonBadges.user_id, userIds))
    .orderBy(desc(hackathonBadges.created_at));

  // Group by user_id
  const badgesByUser = new Map<string, HackathonBadgeSummary[]>();
  for (const badge of badges) {
    const userBadges = badgesByUser.get(badge.user_id) || [];
    userBadges.push({
      badge_type: badge.badge_type,
      hackathon_name: badge.hackathon_name,
      earned_at: badge.earned_at,
    });
    badgesByUser.set(badge.user_id, userBadges);
  }

  return badgesByUser;
}
```

---

### Query 4: Get Filter Options

**Purpose**: Fetch available locations and technologies for filter dropdowns

**Implementation**:
```typescript
async function getFilterOptions() {
  // Get unique locations (where not null)
  const locations = await db
    .selectDistinct({ location: devcards.location })
    .from(devcards)
    .where(
      and(
        eq(devcards.is_public, true),
        isNotNull(devcards.location)
      )
    )
    .orderBy(asc(devcards.location));

  // Get unique technologies (flatten JSONB arrays)
  const techStacks = await db
    .select({ tech_stack: devcards.tech_stack })
    .from(devcards)
    .where(
      and(
        eq(devcards.is_public, true),
        isNotNull(devcards.tech_stack)
      )
    );

  // Flatten and deduplicate technologies
  const allTechs = techStacks.flatMap(row => row.tech_stack || []);
  const uniqueTechs = Array.from(new Set(allTechs)).sort();

  // Get achievement types
  const achievements = await db
    .selectDistinct({ type: userAchievements.achievement_type })
    .from(userAchievements)
    .orderBy(asc(userAchievements.achievement_type));

  return {
    locations: locations.map(l => l.location).filter(Boolean),
    technologies: uniqueTechs,
    achievement_types: achievements.map(a => a.type),
  };
}
```

**Optimization**: Cache filter options for 1 hour (update infrequently)

---

### Query 5: Update Privacy Setting

**Purpose**: Toggle directory visibility for a user

**Implementation**:
```typescript
async function updateDirectoryVisibility(userId: string, isPublic: boolean) {
  const result = await db
    .update(devcards)
    .set({
      is_public: isPublic,
      updated_at: new Date()
    })
    .where(eq(devcards.user_id, userId))
    .returning({ is_public: devcards.is_public });

  return result[0];
}
```

**Location**: Can be added to existing settings API endpoint or create new `/api/user/privacy` endpoint

---

## Data Flow

### 1. Directory Page Load

```
User visits /app/members
  ↓
Client component loads with default filters (page=1, no search)
  ↓
SWR fetches /api/members?page=1&limit=20
  ↓
API executes searchMembers() query
  ↓
Parallel queries: members list + total count + filter options
  ↓
Post-process: Fetch achievements & badges for returned members
  ↓
Return MembersSearchResponse
  ↓
Client renders grid/list view with pagination
```

### 2. Search/Filter Interaction

```
User types in search or selects filter
  ↓
useDebounce delays input (500ms)
  ↓
SWR refetches with new params: /api/members?search=query&location=SF&page=1
  ↓
API re-executes query with new WHERE conditions
  ↓
Return updated results
  ↓
Client re-renders with new data
```

### 3. Privacy Toggle

```
User visits /app/settings
  ↓
Toggles "Show in Directory" switch
  ↓
PATCH /api/user/privacy with { is_public: false }
  ↓
Update devcards.is_public for current user
  ↓
Return success response
  ↓
User profile removed from directory results within 60s (cache invalidation)
```

---

## Relationships

```
users (1) ←→ (1) devcards
  ↓
  ├─→ (many) user_achievements
  ├─→ (many) hackathon_badges
  └─→ (many) connections
```

**Join Strategy**:
- Always INNER JOIN `users` ↔ `devcards` (every DevCard has a user)
- LEFT JOIN for optional data (badges, achievements)
- Use EXISTS subqueries for filter conditions (more efficient than JOIN + DISTINCT)

---

## Indexes & Performance

### Existing Indexes (Already in Database)

```sql
-- devcards table
CREATE UNIQUE INDEX devcards_url_slug_idx ON devcards(url_slug);
CREATE UNIQUE INDEX devcards_github_username_idx ON devcards(github_username);
CREATE UNIQUE INDEX devcards_user_id_idx ON devcards(user_id);

-- users table
CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE UNIQUE INDEX users_github_username_idx ON users(github_username);
```

### Recommended New Indexes

**For directory queries**:
```sql
-- Composite index for public members sorted by join date
CREATE INDEX idx_devcards_public_member_number
ON devcards(is_public, member_number DESC)
WHERE is_public = true;

-- GIN index for tech_stack JSONB array searches (if performance requires)
CREATE INDEX idx_devcards_tech_stack_gin
ON devcards USING GIN (tech_stack);

-- Index for location filtering (if heavily used)
CREATE INDEX idx_devcards_location
ON devcards(location)
WHERE location IS NOT NULL AND is_public = true;
```

**Note**: Add these indexes incrementally based on actual performance metrics. Start with basic query, measure, optimize as needed.

---

## Caching Strategy

### API Response Caching

**SWR Client-Side Cache**:
```typescript
const { data, isLoading } = useSWR<MembersSearchResponse>(
  `/api/members?page=${page}&search=${search}&location=${location}`,
  {
    revalidateOnFocus: false,     // Don't refetch on window focus
    dedupingInterval: 10000,      // 10 seconds deduping
    refreshInterval: 60000,       // Refresh every 60 seconds
  }
);
```

**Filter Options Cache**:
- Cache `/api/members/filters` endpoint for 1 hour
- Invalidate on new member signup (webhook/background job)

### Database Query Cache

**PostgreSQL Query Plan Cache**:
- Prepared statements automatically cached by PostgreSQL
- Query planner optimizes based on statistics

**Application-Level Cache** (Future Enhancement):
- Redis cache for filter options (locations, technologies)
- Cache key: `directory:filters:v1`
- TTL: 3600 seconds (1 hour)

---

## Type Definitions

**File**: `/src/lib/members/types.ts`

```typescript
export type AvailabilityStatus = 'open' | 'available' | 'not-available' | 'custom';

export interface MemberSummary {
  id: string;
  user_id: string;
  url_slug: string;
  display_name: string | null;
  github_username: string;
  avatar_url: string;
  location: string | null;
  custom_bio: string | null;
  tech_stack: string[] | null;
  member_number: number;
  achievement_count: number;
  hackathon_badges: HackathonBadgeSummary[];
  availability_status: AvailabilityStatus;
  is_public: boolean;
  created_at: Date;
}

export interface HackathonBadgeSummary {
  badge_type: 'gold' | 'silver' | 'bronze';
  hackathon_name: string;
  earned_at: Date;
}

export interface DirectoryFilters {
  search: string;
  location: string | null;
  tech_stack: string[];
  achievement_types: string[];
  winners_only: boolean;
  sort: 'newest' | 'oldest';
}

export interface MembersSearchResponse {
  members: MemberSummary[];
  pagination: {
    total: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
  filters: {
    locations: string[];
    technologies: string[];
    achievement_types: string[];
  };
}

export interface SearchMembersParams {
  search?: string;
  location?: string;
  tech_stack?: string[];
  achievement_types?: string[];
  winners_only?: boolean;
  page: number;
  limit: number;
  sort?: 'newest' | 'oldest';
}
```

---

## Validation Rules

### API Input Validation

```typescript
// Page number
const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

// Limit (max 100, default 20)
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

// Search query (max 100 chars, trim whitespace)
const search = searchParams.get('search')?.trim().slice(0, 100) || '';

// Location (max 100 chars)
const location = searchParams.get('location')?.trim().slice(0, 100) || null;

// Tech stack (max 10 technologies)
const tech_stack = searchParams.getAll('tech').slice(0, 10);

// Winners only (boolean)
const winners_only = searchParams.get('winners') === 'true';
```

---

## Summary

**No Database Migrations Required** ✅
- All queries use existing tables and columns
- Indexes are optional performance optimizations

**Data Sources**:
- Primary: `devcards` table (profile data)
- Secondary: `users` table (user info)
- Aggregates: `user_achievements`, `hackathon_badges` tables

**Query Performance**:
- Parallel queries for list + count
- Indexed lookups on primary keys
- Optional GIN index for JSONB searches

**Type Safety**:
- Full TypeScript types for all entities
- Strict validation on API inputs
- Type-safe Drizzle ORM queries

---

**Next Steps**: Create API contracts (contracts/) and quickstart guide (quickstart.md)
