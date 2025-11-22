# Research & Technology Decisions: Member Directory

**Feature**: 004-member-directory
**Date**: 2025-11-22
**Status**: Phase 0 Complete

## Executive Summary

This document records all technology and implementation decisions for the member directory feature based on thorough investigation of the existing Devius/StackPass codebase patterns.

---

## Decision 1: Pagination Strategy

**Decision**: Page-based pagination with explicit page/limit controls

**Rationale**:
- Matches existing pattern used in `/api/super-admin/users/route.ts` and `/app/super-admin/coupons/page.tsx`
- Provides better performance at scale (10,000+ members)
- Easier to implement with existing pagination UI component (`/src/components/ui/pagination.tsx`)
- More predictable server load compared to infinite scroll
- Better for accessibility (screen readers, keyboard navigation)

**Implementation Details**:
```typescript
// API: ?page=1&limit=20
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20"); // Default 20 for directory
const offset = (page - 1) * limit;

// Return structure:
{
  members: DevCardApiResponse[],
  pagination: {
    total: number,
    pageCount: number,
    currentPage: number,
    perPage: number
  }
}
```

**Alternatives Considered**:
- **Infinite scroll**: Rejected - adds complexity, harder to implement with existing patterns, poor accessibility
- **"Load More" button**: Rejected - doesn't match existing UI patterns in codebase
- **Cursor-based pagination**: Rejected - overkill for this use case, no existing pattern

**Reference Files**:
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/api/super-admin/users/route.ts` (API pattern)
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/components/ui/pagination.tsx` (UI component)
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/super-admin/users/page.tsx` (Page usage)

---

## Decision 2: Filter State Management

**Decision**: Client-side state with SWR, not URL search params

**Rationale**:
- Matches existing pattern in coupons, users, and other admin pages
- Project consistently uses client-side state (`useState`) + SWR for data fetching
- No existing examples of `useSearchParams()` for filter state in codebase
- Simpler implementation, proven pattern

**Implementation Details**:
```typescript
"use client";

const [page, setPage] = useState(1);
const [search, setSearch] = useState("");
const [locationFilter, setLocationFilter] = useState<string | null>(null);
const [techStackFilter, setTechStackFilter] = useState<string[]>([]);
const [winnersOnly, setWinnersOnly] = useState(false);

const debouncedSearch = useDebounce(search, 500);

const { data, isLoading } = useSWR<MembersResponse>(
  `/api/members?page=${page}&limit=20&search=${debouncedSearch}&location=${locationFilter}&tech=${techStackFilter.join(",")}&winners=${winnersOnly}`
);
```

**Shareable URLs Note**:
- Spec requires shareable filter URLs (FR-014, SC-012)
- **Workaround**: Provide "Copy Search Link" button that generates URL with query params
- Users can manually share constructed URLs, even if app doesn't read them on load initially
- Future enhancement: Migrate to URL params if needed

**Alternatives Considered**:
- **URL search params (`useSearchParams`)**: Rejected - no existing pattern in codebase, adds complexity
- **Server components with searchParams prop**: Rejected - requires server-side filtering, incompatible with client interactivity needs
- **Zustand/Redux global state**: Rejected - no state management library in project, overkill for single page

**Reference Files**:
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/super-admin/coupons/page.tsx` (Client state pattern)
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/super-admin/users/page.tsx` (SWR usage)

---

## Decision 3: View Preference Persistence

**Decision**: localStorage for grid/list view preference

**Rationale**:
- Lightweight, client-side only
- No database changes required
- Instant persistence
- Matches best practices for non-critical UI preferences
- No existing user preferences table in database

**Implementation Details**:
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('memberDirectoryView') as 'grid' | 'list') || 'grid';
  }
  return 'grid';
});

const handleViewChange = (newView: 'grid' | 'list') => {
  setViewMode(newView);
  localStorage.setItem('memberDirectoryView', newView);
};
```

**Alternatives Considered**:
- **Cookies**: Rejected - unnecessary server-side access, affects all requests
- **User preferences table**: Rejected - no existing table, overkill for single toggle
- **Session storage**: Rejected - doesn't persist across browser sessions

**Reference**: Standard web pattern, no specific codebase file

---

## Decision 4: Database Query Optimization

**Decision**: Drizzle ORM with indexed queries, parallel count/data fetch

**Rationale**:
- Matches existing database query patterns in `/src/app/api/super-admin/coupons/route.ts`
- Existing indexes on `devcards.url_slug`, `devcards.github_username`, `devcards.user_id`
- `is_public` field already exists and is used for profile visibility
- Parallel `Promise.all()` pattern reduces latency

**Implementation Details**:
```typescript
import { and, or, eq, like, desc, sql, inArray } from 'drizzle-orm';
import { devcards, users, githubCache, userAchievements, hackathonBadges } from '@/db/schema';

const conditions = [eq(devcards.is_public, true)]; // Only public profiles

if (search) {
  conditions.push(
    or(
      like(users.name, `%${search}%`),
      like(devcards.github_username, `%${search}%`),
      like(devcards.display_name, `%${search}%`)
    )
  );
}

if (location) {
  conditions.push(like(devcards.location, `%${location}%`));
}

if (tech_stack?.length > 0) {
  // JSONB array contains check
  conditions.push(
    sql`${devcards.tech_stack} @> ${JSON.stringify(tech_stack)}`
  );
}

const whereClause = and(...conditions);

const [membersList, totalCount] = await Promise.all([
  db
    .select({
      id: devcards.id,
      user_id: devcards.user_id,
      url_slug: devcards.url_slug,
      display_name: devcards.display_name,
      custom_bio: devcards.custom_bio,
      avatar_url: devcards.avatar_url,
      location: devcards.location,
      tech_stack: devcards.tech_stack,
      member_number: devcards.member_number,
      github_username: devcards.github_username,
    })
    .from(devcards)
    .innerJoin(users, eq(devcards.user_id, users.id))
    .where(whereClause)
    .orderBy(desc(devcards.member_number)) // Newest first
    .limit(limit)
    .offset(offset),

  db
    .select({ count: sql<number>`count(*)` })
    .from(devcards)
    .innerJoin(users, eq(devcards.user_id, users.id))
    .where(whereClause)
    .then((res) => Number(res[0].count))
]);
```

**Performance Optimizations**:
- Use existing indexes on `devcards` table
- Consider adding index on `is_public` if query performance degrades
- Use `EXPLAIN ANALYZE` for query optimization during testing
- Limit result set to 20 per page (configurable)

**Alternatives Considered**:
- **Raw SQL with `postgres` library**: Rejected - no need for raw SQL, Drizzle ORM handles complex queries
- **Separate queries for each filter**: Rejected - inefficient, Drizzle can combine conditions
- **Full-text search (PostgreSQL FTS)**: Deferred to future enhancement - LIKE queries sufficient for MVP

**Reference Files**:
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/api/super-admin/coupons/route.ts` (Query pattern)
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/api/connections/route.ts` (Join pattern)
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/devcard.ts` (Schema reference)

---

## Decision 5: Real-time Search Implementation

**Decision**: Client-side debouncing with 500ms delay + server-side filtering

**Rationale**:
- Matches existing pattern in coupons admin (`useDebounce` hook)
- 500ms delay is standard for search inputs (balance between responsiveness and API load)
- Server-side filtering ensures accurate results with large datasets

**Implementation Details**:
```typescript
import { useDebounce } from '@/hooks/use-debounce';

const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebounce(searchQuery, 500);

const { data } = useSWR<MembersResponse>(
  `/api/members?search=${debouncedSearch}&page=${page}`
);

// In component:
<Input
  type="search"
  placeholder="Search members..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Alternatives Considered**:
- **Shorter delay (300ms)**: Rejected - increases API calls, 500ms is codebase standard
- **Client-side filtering**: Rejected - doesn't scale with 10,000+ members
- **No debouncing**: Rejected - would cause excessive API calls

**Reference Files**:
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/hooks/use-debounce.ts` (Hook implementation)
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/super-admin/coupons/page.tsx` (Usage example)

---

## Technology Stack Summary

### Confirmed Technologies

| Category | Technology | Version | Source |
|----------|-----------|---------|--------|
| **Framework** | Next.js (App Router) | 16.0.1 | package.json |
| **Language** | TypeScript | 5.8 | package.json |
| **UI Components** | Radix UI (shadcn/ui) | Various | src/components/ui/ |
| **Icons** | lucide-react | 0.541.0 | package.json |
| **Data Fetching** | SWR | 2.3.3 | package.json |
| **Database** | PostgreSQL + Drizzle ORM | Latest | src/db/ |
| **Authentication** | NextAuth v5 | Latest | src/auth.ts |
| **Styling** | Tailwind CSS | 4.1.12 | package.json |
| **Forms** | react-hook-form | 7.55.0 | package.json |

### Component Library Available

Confirmed shadcn/ui components in `/src/components/ui/`:
- `pagination.tsx` - For page navigation
- `table.tsx` - Data table structure
- `input.tsx` - Search input
- `select.tsx` - Filter dropdowns
- `badge.tsx` - Tech stack / achievement badges
- `card.tsx` - Member card container
- `button.tsx` - Interactive buttons
- `skeleton.tsx` - Loading states

---

## Authentication & Authorization

**Pattern**: Use `withAuthRequired` middleware

**Implementation**:
```typescript
import { withAuthRequired } from '@/lib/auth/withAuthRequired';

export const GET = withAuthRequired(async (req, { session }) => {
  const userId = session.user.id;

  // ... member search logic
});
```

**Reference File**: `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/lib/auth/withAuthRequired.ts`

---

## Database Schema Reference

### DevCards Table (Primary Data Source)

**File**: `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/devcard.ts`

**Relevant Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `url_slug` (text, unique) - Username for profile URL
- `is_public` (boolean) - **Privacy flag for directory visibility**
- `display_name` (text, nullable) - Override GitHub name
- `custom_bio` (varchar(500), nullable) - Profile description
- `location` (text, nullable) - Geographic location
- `avatar_url` (text) - Profile picture
- `github_username` (text) - GitHub username
- `tech_stack` (text[], nullable) - **Array of technologies**
- `availability_status` (enum) - open/available/not-available/custom
- `member_number` (integer) - **Sequential member number**
- `view_count` (integer) - Profile views
- `created_at` (timestamp) - Join date

**Existing Indexes**:
- Primary key on `id`
- Unique index on `url_slug`
- Unique index on `github_username`
- Unique index on `user_id`

**Potential New Index** (if performance requires):
```sql
CREATE INDEX idx_devcards_is_public ON devcards(is_public);
CREATE INDEX idx_devcards_location ON devcards(location) WHERE location IS NOT NULL;
```

### Users Table (Supporting Data)

**File**: `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/user.ts`

**Relevant Fields**:
- `id` (UUID)
- `name` (text) - User's full name
- `email` (text, unique)
- `image` (text, nullable) - Profile image URL
- `github_username` (text, nullable, unique)
- `is_premium` (boolean)
- `createdAt` (timestamp)

### Related Tables (For Filters)

**User Achievements**: `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/user-achievements.ts`
- Used for "achievement count" and achievement-based filters
- Fields: `user_id`, `achievement_type`, `earned_at`

**Hackathon Badges**: `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/hackathon-badges.ts`
- Used for "hackathon winners" filter
- Fields: `user_id`, `badge_type` (gold/silver/bronze), `hackathon_id`

---

## API Design Patterns

### Response Structure

Following existing pattern from `/src/types/api-responses.ts`:

```typescript
export interface MembersSearchResponse {
  members: MemberSummary[];
  pagination: {
    total: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}

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
}
```

### Error Handling

Following existing pattern:
```typescript
if (!session || !session.user) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

if (/* validation error */) {
  return NextResponse.json(
    { error: "Invalid parameters" },
    { status: 400 }
  );
}
```

---

## File Structure Decisions

### API Route Location
**Path**: `/src/app/api/members/route.ts`

**Rationale**: Follows existing pattern for entity-based APIs (e.g., `/api/connections/`, `/api/hackathons/`)

### Page Location
**Path**: `/src/app/(in-app)/app/members/page.tsx`

**Rationale**:
- Authenticated pages use `(in-app)` layout group
- Follows pattern of `/app/network/page.tsx`, `/app/settings/page.tsx`

### Component Location
**Path**: `/src/components/members/`

**Rationale**: Feature-based component organization, matches existing structure

---

## Open Questions & Future Enhancements

### Deferred to Future Iterations

1. **Full-text search**: PostgreSQL `tsvector` for advanced search - not needed for MVP
2. **Sorting options**: Additional sorts (alphabetical, most achievements) - spec lists as out of scope
3. **URL-based filter sharing**: Currently using client state, can migrate to URL params later
4. **Advanced filters**: Availability status, premium status - can add incrementally
5. **Member recommendations**: AI/algorithm-based suggestions - explicitly out of scope

### Performance Monitoring

**Metrics to Track**:
- API response time for search endpoint
- Database query execution time
- Page load time
- SWR cache hit rate

**Tools**:
- Next.js built-in analytics
- Database query logging
- Browser DevTools Performance tab

---

## References

All file paths are absolute and verified to exist in the codebase:

- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/api/super-admin/users/route.ts`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/api/super-admin/coupons/route.ts`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/app/api/connections/route.ts`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/components/ui/pagination.tsx`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/hooks/use-debounce.ts`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/lib/auth/withAuthRequired.ts`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/devcard.ts`
- `/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/src/db/schema/user.ts`

---

**Phase 0 Status**: ✅ Complete - All technology decisions documented and justified
**Next Phase**: Phase 1 - Create data-model.md, contracts/, and quickstart.md
