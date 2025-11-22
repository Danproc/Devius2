# Developer Quickstart: Member Directory

**Feature**: 004-member-directory
**Branch**: `004-member-directory`
**Last Updated**: 2025-11-22

## Overview

This guide helps developers quickly understand, build, test, and deploy the member directory feature. Follow these steps to get started with implementation.

---

## Prerequisites

Before starting development:

- [x] Read `/specs/004-member-directory/spec.md` (feature requirements)
- [x] Read `/specs/004-member-directory/plan.md` (implementation plan)
- [x] Read `/specs/004-member-directory/research.md` (technology decisions)
- [x] Read `/specs/004-member-directory/data-model.md` (database queries and types)
- [x] Review `/specs/004-member-directory/contracts/members-api.yaml` (API specification)

**Development Environment**:
- Node.js 18+ installed
- PostgreSQL database running locally (or access to dev database)
- Project dependencies installed (`pnpm install`)
- `.env.local` file configured with DATABASE_URL and NEXTAUTH_SECRET

---

## Quick Start (5 Minutes)

### 1. Checkout Feature Branch

```bash
git checkout 004-member-directory
```

### 2. Install Dependencies (if needed)

```bash
pnpm install
```

### 3. Run Database Migrations (if any)

```bash
# Check for pending migrations
pnpm drizzle-kit push
```

**Note**: This feature requires NO database migrations - all tables already exist.

### 4. Start Development Server

```bash
pnpm dev
```

Server starts at `http://localhost:3000`

### 5. Verify Authentication

- Navigate to `http://localhost:3000/signin`
- Sign in with a test account
- Once authenticated, you're ready to test the directory

---

## File Structure

### Files to Create

```
src/
├── app/
│   ├── (in-app)/
│   │   └── app/
│   │       ├── members/               # NEW
│   │       │   └── page.tsx           # Main directory page
│   │       └── settings/              # EXISTING
│   │           └── page.tsx           # Add privacy toggle here
│   └── api/
│       └── members/                   # NEW
│           ├── route.ts               # GET /api/members (search)
│           └── filters/
│               └── route.ts           # GET /api/members/filters
│
├── components/
│   └── members/                       # NEW
│       ├── MemberCard.tsx             # Grid view card
│       ├── MemberListItem.tsx         # List view row
│       ├── MemberDirectoryFilters.tsx # Filter sidebar
│       ├── MemberDirectoryGrid.tsx    # Grid container
│       ├── MemberDirectoryList.tsx    # List container
│       └── ViewToggle.tsx             # Grid/List toggle button
│
├── db/
│   └── queries/
│       └── members.ts                 # NEW: Database queries
│
├── lib/
│   └── members/                       # NEW
│       ├── filters.ts                 # Filter logic
│       └── types.ts                   # TypeScript types
│
└── hooks/
    └── use-debounce.ts                # EXISTING: Already in codebase
```

### Files to Modify

```
src/
├── app/
│   ├── (in-app)/
│   │   └── app/
│   │       └── settings/
│   │           └── page.tsx           # Add directory visibility toggle
│   └── api/
│       └── user/
│           └── privacy/
│               └── route.ts           # NEW or modify existing settings endpoint
│
└── components/
    └── navigation/                    # Add "Members" link to nav
        └── [nav-component].tsx
```

---

## Development Workflow

### Step 1: Set Up Types

Create TypeScript types first (type-driven development):

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
  created_at: Date;
}

export interface HackathonBadgeSummary {
  badge_type: 'gold' | 'silver' | 'bronze';
  hackathon_name: string;
  earned_at: Date;
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
```

### Step 2: Implement Database Queries

**File**: `/src/db/queries/members.ts`

See `/specs/004-member-directory/data-model.md` for full query implementations.

Key functions:
- `searchMembers(params)` - Main search with filters
- `getFilterOptions()` - Get dropdown options
- `updateDirectoryVisibility(userId, isPublic)` - Privacy toggle

### Step 3: Build API Endpoints

**File**: `/src/app/api/members/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuthRequired } from '@/lib/auth/withAuthRequired';
import { searchMembers, getFilterOptions } from '@/db/queries/members';

export const GET = withAuthRequired(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  // Parse and validate parameters
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search')?.trim() || '';
  const location = searchParams.get('location')?.trim() || null;
  const tech_stack = searchParams.getAll('tech');
  const winners_only = searchParams.get('winners') === 'true';
  const sort = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest';

  try {
    // Execute search
    const { membersList, totalCount } = await searchMembers({
      search,
      location,
      tech_stack,
      winners_only,
      page,
      limit,
      sort,
    });

    // Get filter options
    const filters = await getFilterOptions();

    // Return response
    return NextResponse.json({
      members: membersList,
      pagination: {
        total: totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
        perPage: limit,
      },
      filters,
    });
  } catch (error) {
    console.error('Member search error:', error);
    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    );
  }
});
```

### Step 4: Build UI Components

**Priority Order** (implement in this sequence):

1. **MemberCard.tsx** - Basic member display (grid view)
2. **MemberDirectoryGrid.tsx** - Grid container
3. **MemberDirectoryFilters.tsx** - Filter sidebar
4. **page.tsx** - Main directory page (connects everything)
5. **MemberListItem.tsx** - List view variant
6. **ViewToggle.tsx** - Grid/List toggle
7. **Privacy toggle** - Settings page integration

**Example: MemberCard.tsx**

```typescript
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberSummary } from '@/lib/members/types';
import Link from 'next/link';

export function MemberCard({ member }: { member: MemberSummary }) {
  const displayName = member.display_name || member.github_username;
  const bioSnippet = member.custom_bio?.slice(0, 150) + (member.custom_bio?.length > 150 ? '...' : '');

  return (
    <Link href={`/${member.url_slug}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <img
            src={member.avatar_url}
            alt={displayName}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{displayName}</h3>
            <p className="text-sm text-muted-foreground">@{member.github_username}</p>
            {member.location && (
              <p className="text-xs text-muted-foreground mt-1">{member.location}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">#{member.member_number}</span>
        </div>

        {bioSnippet && (
          <p className="text-sm mt-3 line-clamp-2">{bioSnippet}</p>
        )}

        {member.tech_stack && member.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {member.tech_stack.slice(0, 5).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {member.tech_stack.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{member.tech_stack.length - 5}
              </Badge>
            )}
          </div>
        )}

        {member.hackathon_badges.length > 0 && (
          <div className="flex gap-1 mt-2">
            {member.hackathon_badges.map((badge, idx) => (
              <span key={idx} className="text-lg" title={`${badge.badge_type} - ${badge.hackathon_name}`}>
                {badge.badge_type === 'gold' && '🥇'}
                {badge.badge_type === 'silver' && '🥈'}
                {badge.badge_type === 'bronze' && '🥉'}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
```

### Step 5: Build Main Page

**File**: `/src/app/(in-app)/app/members/page.tsx`

```typescript
"use client";

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import useSWR from 'swr';
import { MembersSearchResponse } from '@/lib/members/types';
import { MemberDirectoryGrid } from '@/components/members/MemberDirectoryGrid';
import { MemberDirectoryFilters } from '@/components/members/MemberDirectoryFilters';
import { Pagination } from '@/components/ui/pagination';

export default function MembersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [techStackFilter, setTechStackFilter] = useState<string[]>([]);
  const [winnersOnly, setWinnersOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebounce(search, 500);

  // Build query params
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '20',
  });
  if (debouncedSearch) queryParams.set('search', debouncedSearch);
  if (locationFilter) queryParams.set('location', locationFilter);
  if (winnersOnly) queryParams.set('winners', 'true');
  techStackFilter.forEach(tech => queryParams.append('tech', tech));

  // Fetch data
  const { data, isLoading, error } = useSWR<MembersSearchResponse>(
    `/api/members?${queryParams.toString()}`
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Member Directory</h1>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <MemberDirectoryFilters
            search={search}
            onSearchChange={setSearch}
            location={locationFilter}
            onLocationChange={setLocationFilter}
            techStack={techStackFilter}
            onTechStackChange={setTechStackFilter}
            winnersOnly={winnersOnly}
            onWinnersOnlyChange={setWinnersOnly}
            filterOptions={data?.filters}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {isLoading && <p>Loading members...</p>}
          {error && <p>Error loading members</p>}

          {data && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {data.members.length} of {data.pagination.total} members
                </p>
                {/* View Toggle - implement later */}
              </div>

              <MemberDirectoryGrid members={data.members} />

              {data.pagination.pageCount > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={data.pagination.currentPage}
                    totalPages={data.pagination.pageCount}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## Testing

### Manual Testing Checklist

**Authentication**:
- [ ] Unauthenticated users are redirected to login
- [ ] Authenticated users can access `/app/members`

**Search & Filters**:
- [ ] Text search returns matching members
- [ ] Search is debounced (doesn't fire on every keystroke)
- [ ] Location filter works
- [ ] Tech stack filter works
- [ ] Multiple filters combine with AND logic
- [ ] "Winners only" filter shows only members with hackathon badges
- [ ] Clearing filters shows all members

**Pagination**:
- [ ] Pagination controls appear when > 20 members
- [ ] Page numbers work correctly
- [ ] Next/Previous buttons work
- [ ] Pagination resets to page 1 when filters change

**Privacy**:
- [ ] Only members with `is_public = true` appear in directory
- [ ] Toggling privacy setting in `/app/settings` updates visibility
- [ ] Privacy changes take effect within 60 seconds

**Display**:
- [ ] Member cards show correct information
- [ ] Avatars load correctly
- [ ] Tech stack badges display (max 5, then "+N more")
- [ ] Hackathon badges display with correct icons
- [ ] Bio text is truncated to 150 characters
- [ ] Clicking a member card navigates to their profile

**Performance**:
- [ ] Initial page load < 3 seconds
- [ ] Search results appear < 2 seconds after typing stops
- [ ] No visible lag when applying filters
- [ ] Page handles 10,000+ members without degradation

### API Testing with curl

**Search members**:
```bash
curl http://localhost:3000/api/members?page=1&limit=20 \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN"
```

**Search with filters**:
```bash
curl "http://localhost:3000/api/members?search=john&location=San%20Francisco&tech=TypeScript&winners=true" \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN"
```

**Get filter options**:
```bash
curl http://localhost:3000/api/members/filters \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN"
```

**Update privacy**:
```bash
curl -X PATCH http://localhost:3000/api/user/privacy \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_public": false}'
```

---

## Debugging Tips

### Common Issues

**Issue**: "Unauthorized" error when accessing directory
- **Fix**: Ensure you're signed in. Check that NextAuth session cookie is present.

**Issue**: No members showing in directory
- **Fix**: Check that database has members with `is_public = true`. Run: `SELECT COUNT(*) FROM devcards WHERE is_public = true;`

**Issue**: Search returns no results
- **Fix**: Check SQL query in browser Network tab. Verify LIKE clause is working. Check for trailing/leading spaces in search input.

**Issue**: Pagination not working
- **Fix**: Check that `total` count is being calculated correctly. Verify `pageCount` math: `Math.ceil(total / limit)`

**Issue**: Tech stack filter not working
- **Fix**: JSONB containment requires proper formatting. Check that `tech_stack` column is JSONB type. Verify query uses `@>` operator.

### Database Query Debugging

```sql
-- Check public members count
SELECT COUNT(*) FROM devcards WHERE is_public = true;

-- Sample query with filters
SELECT * FROM devcards
INNER JOIN app_user ON devcards.user_id = app_user.id
WHERE devcards.is_public = true
  AND (app_user.name ILIKE '%john%' OR devcards.github_username ILIKE '%john%')
LIMIT 20;

-- Check tech stack data
SELECT tech_stack FROM devcards WHERE tech_stack IS NOT NULL LIMIT 10;
```

### Enable Drizzle Logging

In `/src/db/index.ts`:
```typescript
export const db = drizzle(client, {
  schema,
  logger: true  // Enable query logging
});
```

---

## Performance Optimization

### Database Indexes

If queries are slow (> 500ms), add these indexes:

```sql
-- Composite index for public members
CREATE INDEX idx_devcards_public_member_number
ON devcards(is_public, member_number DESC)
WHERE is_public = true;

-- GIN index for JSONB tech_stack searches
CREATE INDEX idx_devcards_tech_stack_gin
ON devcards USING GIN (tech_stack);
```

### Query Optimization

**Use EXPLAIN ANALYZE** to check query performance:
```sql
EXPLAIN ANALYZE
SELECT * FROM devcards
WHERE is_public = true
ORDER BY member_number DESC
LIMIT 20;
```

Look for:
- **Seq Scan**: Bad - means no index used
- **Index Scan**: Good - index is being used
- **Execution Time**: Should be < 100ms

---

## Deployment Checklist

Before merging to main:

- [ ] All TypeScript types defined
- [ ] All API endpoints implemented and tested
- [ ] All UI components implemented
- [ ] Privacy toggle added to settings
- [ ] Navigation link added to app menu
- [ ] Manual testing completed
- [ ] No console errors in browser
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Performance tested with large dataset
- [ ] Database indexes added (if needed)
- [ ] Documentation updated (CLAUDE.md)

---

## Useful Commands

```bash
# Development
pnpm dev                      # Start dev server
pnpm type-check               # Check TypeScript errors
pnpm lint                     # Run ESLint
pnpm build                    # Production build

# Database
pnpm drizzle-kit push         # Apply schema changes (none for this feature)
pnpm drizzle-kit studio       # Open Drizzle Studio (DB GUI)

# Git
git status                    # Check branch status
git add .                     # Stage changes
git commit -m "feat: ..."     # Commit changes
git push origin 004-member-directory  # Push to remote
```

---

## Next Steps

After completing implementation:

1. **Code Review**: Submit PR for team review
2. **QA Testing**: Have QA team test all scenarios
3. **Performance Testing**: Load test with 10,000+ members
4. **Documentation**: Update CLAUDE.md with new feature
5. **Deployment**: Merge to main and deploy to production
6. **Monitoring**: Track analytics for member directory usage

---

## Resources

**Documentation**:
- [Feature Spec](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Decisions](./research.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/members-api.yaml)

**Code References**:
- NextAuth: `/src/auth.ts`
- Existing pagination: `/src/app/super-admin/users/page.tsx`
- Drizzle queries: `/src/app/api/super-admin/coupons/route.ts`
- UI components: `/src/components/ui/`

**External**:
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [SWR Documentation](https://swr.vercel.app/)

---

**Questions?** Check `/specs/004-member-directory/plan.md` or ask the team!
