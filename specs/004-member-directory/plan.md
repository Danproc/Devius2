# Implementation Plan: Member Directory

**Branch**: `004-member-directory` | **Date**: 2025-11-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-member-directory/spec.md`

## Summary

Build an authenticated-only member directory that allows StackPass members to discover and connect with each other. The feature enables browsing, searching, and filtering members by name, location, tech stack, and achievements. Members can toggle between grid and list views, and control their visibility through privacy settings that leverage the existing is_public flag.

## Technical Context

**Language/Version**: TypeScript 5.8 / Next.js 16.0.1 (App Router with Turbopack)
**Primary Dependencies**: React, NextAuth v5, Drizzle ORM, PostgreSQL, shadcn/ui (assumed)
**Storage**: PostgreSQL (existing database with users, devcards, achievements tables)
**Testing**: Not specified - will use existing project testing framework
**Target Platform**: Web (desktop and mobile responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**:
- Initial page load < 3 seconds for 95% of requests
- Search/filter results < 2 seconds
- Support 10,000+ members without degradation
**Constraints**:
- Authentication required (redirect to login if not authenticated)
- Privacy-first (only show opted-in members)
- URL-based filter state for shareability
**Scale/Scope**:
- Target: 10,000+ members
- 4 prioritized user stories
- 24 functional requirements
- Multiple filter types (text, location, tech stack, achievements)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Project constitution file is currently a template. Proceeding with standard Next.js best practices:
- Follow existing codebase patterns (App Router structure, authentication flow, database queries)
- Maintain consistency with existing features (001-devcard-platform, 002-hackathons-system)
- Adhere to guidelines in CLAUDE.md (TypeScript 5.8, Next.js 16.0.1, SEO best practices)
- No violations anticipated - feature integrates cleanly with existing architecture

✅ **Constitution Check**: PASSED (using existing codebase conventions)

## Project Structure

### Documentation (this feature)

```text
specs/004-member-directory/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (database queries, data structures)
├── quickstart.md        # Phase 1 output (developer setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── members-search-api.yaml
├── checklists/
│   └── requirements.md  # Already created
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (in-app)/
│   │   └── app/
│   │       ├── members/              # NEW: Member directory page
│   │       │   └── page.tsx          # Main directory page component
│   │       └── settings/             # EXISTING: Update with privacy toggle
│   │           └── page.tsx          # Add directory visibility control
│   └── api/
│       └── members/                  # NEW: Member directory API
│           └── search/
│               └── route.ts          # Search/filter endpoint
│
├── components/
│   └── members/                      # NEW: Directory components
│       ├── MemberCard.tsx            # Card view component
│       ├── MemberListItem.tsx        # List view component
│       ├── MemberDirectoryFilters.tsx # Filter sidebar
│       ├── MemberDirectoryGrid.tsx   # Grid layout container
│       ├── MemberDirectoryList.tsx   # List layout container
│       └── ViewToggle.tsx            # Grid/List toggle button
│
├── db/
│   └── queries/
│       └── members.ts                # NEW: Member directory queries
│
├── lib/
│   └── members/                      # NEW: Directory utilities
│       ├── filters.ts                # Filter logic and URL param handling
│       └── types.ts                  # TypeScript types for directory
│
└── types/
    └── members.ts                    # NEW: Shared types

tests/                                # Testing structure (if implemented)
├── api/
│   └── members-search.test.ts
└── components/
    └── members/
        ├── MemberCard.test.tsx
        └── MemberDirectoryFilters.test.tsx
```

**Structure Decision**: This is a web application using Next.js App Router. The feature follows the existing structure:
- `/app/(in-app)/app/members/*` for authenticated pages
- `/app/api/members/*` for API endpoints
- `/components/members/*` for React components
- `/db/queries/members.ts` for database operations
- `/lib/members/*` for utilities and business logic

This aligns with the existing 001-devcard-platform and 002-hackathons-system feature patterns observed in the codebase.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This feature integrates cleanly with existing architecture and follows established patterns.

---

## Phase 0: Research & Decisions

### Research Areas

1. **Pagination Strategy**
   - Decision needed: Infinite scroll vs "Load More" button vs traditional pagination
   - Investigate: Performance with 10,000+ members, UX best practices, existing patterns in codebase

2. **Filter State Management**
   - Decision needed: URL search params vs React state vs server component props
   - Investigate: Shareability requirements, browser history, performance implications

3. **View Preference Persistence**
   - Decision needed: localStorage vs cookies vs user preferences table
   - Investigate: Session management, existing preference storage patterns

4. **Database Query Optimization**
   - Decision needed: Query structure for combining multiple filters (text, location, tech stack, achievements)
   - Investigate: PostgreSQL full-text search, indexing strategy, join optimization

5. **Real-time Search Implementation**
   - Decision needed: Debouncing strategy, client-side vs server-side filtering
   - Investigate: Input debounce timing, API rate limiting, caching strategy

### Dependencies to Research

- Existing UI component library (likely shadcn/ui based on patterns)
- Current authentication middleware patterns in Next.js App Router
- Existing database query patterns with Drizzle ORM
- Current URL parameter handling utilities
- Existing filter UI patterns (if any)

---

## Phase 1: Design & Contracts

### Data Models (to be detailed in data-model.md)

**Primary Entities**:
1. Member Profile (from devcards + users tables - existing)
2. Achievement (from user_achievements table - existing)
3. Hackathon Badge (from hackathon_badges table - existing)
4. Directory Filter State (new - ephemeral, URL-based)

**Database Queries Needed**:
- Search members with pagination and filters
- Get unique locations for filter dropdown
- Get unique technologies for filter dropdown
- Get achievement types for filter options
- Update is_public flag for privacy control

### API Contracts (to be detailed in contracts/members-search-api.yaml)

**Endpoint**: `GET /api/members/search`

**Query Parameters**:
- `search`: string (name/username search)
- `location`: string (filter by location)
- `tech_stack`: string[] (filter by technologies)
- `achievements`: string[] (filter by achievement types)
- `winners_only`: boolean (hackathon winners filter)
- `limit`: number (pagination limit, default 20)
- `offset`: number (pagination offset, default 0)
- `sort`: string (sort order, default "newest")

**Response**:
```typescript
{
  members: Array<{
    id: string
    username: string
    display_name: string
    avatar_url: string
    location: string | null
    bio: string | null
    member_number: number
    tech_stack: string[]
    achievement_count: number
    hackathon_badges: Array<{type: string, hackathon_name: string}>
  }>
  total: number
  hasMore: boolean
}
```

**Endpoint**: `PATCH /api/user/privacy` (or update existing settings endpoint)

**Body**:
```typescript
{
  is_public: boolean
}
```

**Response**:
```typescript
{
  success: boolean
  is_public: boolean
}
```

### Component Architecture

**Page-Level**:
- `MemberDirectoryPage` - Main page component, handles auth, layout, state coordination

**Container Components**:
- `MemberDirectoryGrid` - Grid layout with responsive columns
- `MemberDirectoryList` - List layout with compact rows
- `MemberDirectoryFilters` - Sidebar with all filter controls

**Display Components**:
- `MemberCard` - Individual member card for grid view
- `MemberListItem` - Individual member row for list view
- `ViewToggle` - Grid/List view toggle button

**State Management**:
- URL search params for filter state (Next.js useSearchParams)
- localStorage for view preference persistence
- Server components where possible for initial data fetch

### Integration Points

1. **Authentication**: Integrate with existing NextAuth `auth()` function
2. **Navigation**: Add "Members" link to authenticated app navigation
3. **Settings Page**: Add privacy toggle to existing settings page
4. **Profile Links**: Link to existing `/{username}` profile pages
5. **Achievement System**: Query existing `user_achievements` and `hackathon_badges` tables

---

## Phase 2: Task Breakdown

*To be generated by `/speckit.tasks` command - NOT included in this plan*

The tasks will be generated based on this implementation plan and will include:
- API endpoint development
- Database query implementation
- UI component development
- Filter logic implementation
- Privacy control integration
- Testing and validation
- Documentation updates

---

## Next Steps

1. **Complete Phase 0**: Execute research tasks and document decisions in `research.md`
2. **Complete Phase 1**: Create detailed data models (`data-model.md`), API contracts (`contracts/`), and quickstart guide (`quickstart.md`)
3. **Run `/speckit.tasks`**: Generate ordered task breakdown for implementation
4. **Run `/speckit.implement`**: Execute task-by-task implementation

## Success Criteria Mapping

This implementation plan addresses all 12 success criteria defined in the spec:

- **SC-001-003** (Performance): Pagination, caching, and optimized queries
- **SC-004** (Scale): Database indexing and efficient query design
- **SC-005** (Engagement): Rich filter UI with clear affordances
- **SC-006** (Privacy): Real-time is_public flag updates
- **SC-007** (Filter Combination): AND logic in database queries
- **SC-008** (View Preference): localStorage persistence
- **SC-009** (Profile Access): Direct links to existing profile pages
- **SC-010** (Auth): NextAuth middleware protection
- **SC-011** (Load Time): Server components, ISR where appropriate
- **SC-012** (URL Sharing): URL search params for filter state
