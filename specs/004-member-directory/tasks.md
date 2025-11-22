# Tasks: Member Directory

**Input**: Design documents from `/specs/004-member-directory/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/members-api.yaml

**Tests**: Tests are NOT requested in the feature specification. Focus on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: Next.js App Router at `src/app/`, components at `src/components/`, API at `src/app/api/`
- Paths follow existing StackPass/Devius codebase structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions

- [x] T001 Create TypeScript types in src/lib/members/types.ts (MemberSummary, HackathonBadgeSummary, DirectoryFilters, MembersSearchResponse, SearchMembersParams)
- [x] T002 [P] Create filter utilities scaffold in src/lib/members/filters.ts (filter state helpers, URL param utilities)
- [x] T003 [P] Create directory structure: src/components/members/, src/app/(in-app)/app/members/, src/app/api/members/

**Checkpoint**: Type definitions and folder structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database queries and API infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement searchMembers query in src/db/queries/members.ts (handles pagination, text search, location filter, tech stack filter, achievement filter, winners filter)
- [x] T005 [P] Implement getFilterOptions query in src/db/queries/members.ts (get unique locations, technologies, achievement types)
- [x] T006 [P] Implement getMembersWithAchievements helper in src/db/queries/members.ts (achievement count aggregation)
- [x] T007 [P] Implement getHackathonBadges helper in src/db/queries/members.ts (fetch badges for members)
- [x] T008 Create GET /api/members route handler in src/app/api/members/route.ts (search endpoint with withAuthRequired middleware, query parameter validation, call searchMembers query, return MembersSearchResponse)
- [x] T009 [P] Create GET /api/members/filters route handler in src/app/api/members/filters/route.ts (filter options endpoint, call getFilterOptions query)

**Checkpoint**: Foundation ready - database queries working, API endpoints returning data, authentication protection active

---

## Phase 3: User Story 1 - Browse Community Members (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can browse member directory and view profiles

**Independent Test**: Log in, navigate to /app/members, see list of member cards, click a card, navigate to profile page

### Implementation for User Story 1

- [x] T010 [P] [US1] Create MemberCard component in src/components/members/MemberCard.tsx (display avatar, name, username, location, bio snippet max 150 chars, tech stack badges max 5 with +N more, hackathon badges with icons, member number, clickable Link to profile)
- [x] T011 [P] [US1] Create MemberDirectoryGrid component in src/components/members/MemberDirectoryGrid.tsx (responsive grid layout, map members to MemberCard components, empty state when no members, loading skeleton states)
- [x] T012 [US1] Create main directory page in src/app/(in-app)/app/members/page.tsx (client component, useState for page, useSWR to fetch /api/members with page param, render MemberDirectoryGrid, show member count, basic loading state, error handling, Pagination component integration)
- [x] T013 [US1] Add "Members" navigation link to authenticated app navigation menu (find existing nav component in src/components/, add Members link with appropriate icon, position in nav menu)

**Checkpoint**: MVP functional - authenticated users can browse member directory, see member cards in grid, click to visit profiles, paginate through results

---

## Phase 4: User Story 2 - Search and Filter Members (Priority: P2)

**Goal**: Users can find specific members using search and filters

**Independent Test**: Type in search box, see results update; select location filter, see filtered results; combine multiple filters, see members matching ALL filters; clear filters, see full directory

### Implementation for User Story 2

- [x] T014 [P] [US2] Create MemberDirectoryFilters component in src/components/members/MemberDirectoryFilters.tsx (search input with onChange handler, location select dropdown, tech stack multi-select, achievement type multi-select, winners only checkbox, clear all filters button, use filter options from API response)
- [x] T015 [US2] Implement filter state management in src/lib/members/filters.ts (buildQueryParams function to construct API query string from filter state, parseQueryParams to read filters from URL, filterStateToParams and paramsToFilterState utilities)
- [x] T016 [US2] Update directory page in src/app/(in-app)/app/members/page.tsx (add useState for search, locationFilter, techStackFilter, achievementTypesFilter, winnersOnly; use useDebounce hook for search with 500ms delay; update SWR query to include all filter params; integrate MemberDirectoryFilters component with state handlers; reset page to 1 when filters change)
- [ ] T017 [US2] Add URL parameter sync in src/app/(in-app)/app/members/page.tsx (optional: use useSearchParams and useRouter to sync filter state to URL query params for shareable links, or add "Copy Search Link" button that generates shareable URL)

**Checkpoint**: Search and filters working - users can filter by name, location, tech stack, achievements; multiple filters combine with AND logic; results update within 2 seconds

---

## Phase 5: User Story 3 - Toggle Display Mode (Priority: P3)

**Goal**: Users can switch between grid and list views with preference persistence

**Independent Test**: Click view toggle button, see layout change from grid to list; refresh page, see preference remembered; toggle back to grid, see preference persist

### Implementation for User Story 3

- [x] T018 [P] [US3] Create MemberListItem component in src/components/members/MemberListItem.tsx (compact horizontal layout with smaller avatar, name and username inline, location icon, mini tech stack badges, achievement count indicator, clickable Link to profile)
- [x] T019 [P] [US3] Create MemberDirectoryList component in src/components/members/MemberDirectoryList.tsx (vertical list layout, map members to MemberListItem components, alternate row colors or borders, empty state, loading skeleton)
- [x] T020 [P] [US3] Create ViewToggle component in src/components/members/ViewToggle.tsx (button group with Grid and List icons from lucide-react, toggle between grid/list modes, visual active state indicator, accessible labels)
- [x] T021 [US3] Add view mode state with localStorage in src/app/(in-app)/app/members/page.tsx (useState for viewMode with initializer reading from localStorage defaulting to grid, handleViewChange function that updates state and localStorage, conditionally render MemberDirectoryGrid or MemberDirectoryList based on viewMode)
- [x] T022 [US3] Integrate ViewToggle component in src/app/(in-app)/app/members/page.tsx (add ViewToggle to header area next to member count, pass viewMode and handleViewChange as props, position with flex layout)

**Checkpoint**: View toggle working - users can switch between grid and list layouts; preference persists across sessions using localStorage

---

## Phase 6: User Story 4 - Control Directory Visibility (Priority: P2)

**Goal**: Users can opt in or out of directory visibility via privacy settings

**Independent Test**: Visit /app/settings, toggle "Show in Directory" switch off, verify profile disappears from directory; toggle back on, verify profile reappears within 60 seconds

### Implementation for User Story 4

- [x] T023 [US4] Implement updateDirectoryVisibility query in src/db/queries/members.ts (update devcards.is_public for given userId, update updated_at timestamp, return updated is_public value)
- [x] T024 [US4] Create or update PATCH /api/user/privacy route in src/app/api/user/privacy/route.ts (or update existing settings endpoint; use withAuthRequired middleware, parse is_public from request body, validate boolean type, call updateDirectoryVisibility with session.user.id, return success response with updated is_public value, handle errors)
- [x] T025 [US4] Add directory visibility toggle to settings page in src/app/(in-app)/app/settings/page.tsx (add new section for Privacy settings if not exists, add Switch component for "Show in Member Directory" with label and description text, fetch current is_public status from user's devcard, onChange handler to PATCH /api/user/privacy, optimistic UI update, success/error toast notifications, loading state during save)

**Checkpoint**: Privacy control working - users can toggle directory visibility from settings; changes persist to database; directory results respect is_public flag; changes take effect within 60 seconds (cache invalidation)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, edge cases, and documentation

- [x] T026 [P] Add empty state messages in src/components/members/MemberDirectoryGrid.tsx and MemberDirectoryList.tsx ("No members found" when search returns zero results, suggestion to try different filters, friendly illustration or icon)
- [x] T027 [P] Add loading skeletons in src/components/members/MemberDirectoryGrid.tsx and MemberDirectoryList.tsx (use Skeleton component from shadcn/ui, show 20 skeleton cards while data loads, match card/list item dimensions)
- [x] T028 [P] Add error handling in src/app/(in-app)/app/members/page.tsx (display error message when SWR returns error, retry button, fallback UI for failed requests, log errors to console for debugging)
- [x] T029 Implement graceful handling of missing profile data in src/components/members/MemberCard.tsx and MemberListItem.tsx (hide location field when null, hide tech stack when null or empty array, show "No bio" or hide bio when null, handle missing avatar with fallback image or initials)
- [x] T030 [P] Add accessibility improvements (ARIA labels for search input, filters, view toggle buttons; keyboard navigation support for cards and list items; focus states for interactive elements; semantic HTML tags)
- [x] T031 [P] Add responsive design refinements (test grid layout on mobile, tablet, desktop; adjust number of columns per breakpoint; ensure filter sidebar is collapsible or drawer on mobile; test pagination controls on small screens)
- [x] T032 [P] Performance optimization (add React.memo to MemberCard and MemberListItem to prevent unnecessary re-renders; verify SWR deduping interval set to 10s; verify database query uses indexed lookups; consider adding database indexes if query performance > 500ms)
- [x] T033 [P] Update CLAUDE.md documentation (add member directory to Recent Changes section, document new API endpoints, link to feature spec and tasks)
- [x] T034 Validate implementation against quickstart.md checklist (run through manual testing checklist, verify all authentication checks, verify all search/filter scenarios, verify pagination, verify privacy controls, verify performance criteria met)

**Checkpoint**: Feature complete - all user stories implemented, edge cases handled, documentation updated, ready for code review and deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (P1): Can start after Foundational - MVP, no dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - integrates with US1 but independently testable
  - User Story 3 (P3): Can start after Foundational - extends US1 with new view mode
  - User Story 4 (P2): Can start after Foundational - independent feature, no dependency on other stories
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Browse)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2 - Search/Filter)**: Can start after Phase 2 - Extends US1 but testable independently
- **User Story 3 (P3 - Toggle Views)**: Can start after Phase 2 - Extends US1 display but testable independently
- **User Story 4 (P2 - Privacy)**: Can start after Phase 2 - Completely independent feature

**Key Insight**: US2, US3, US4 all integrate with or extend US1, but each can be tested independently. US4 (privacy) is completely standalone.

### Within Each Phase

**Phase 1 (Setup)**:
- All tasks can run in parallel ([P] marked)

**Phase 2 (Foundational)**:
- T004 (searchMembers) must complete first - it's the core query
- T005, T006, T007 can run in parallel ([P]) after T004
- T008 depends on T004, T005, T006, T007 (needs all queries)
- T009 can run in parallel with T008 ([P])

**Phase 3 (US1 - Browse)**:
- T010 (MemberCard) and T011 (Grid) can run in parallel ([P])
- T012 (page.tsx) depends on T010, T011 (needs components)
- T013 (nav link) can run in parallel with others ([P])

**Phase 4 (US2 - Filters)**:
- T014 (Filters component) and T015 (filter utilities) can run in parallel ([P])
- T016 (update page) depends on T014, T015
- T017 (URL sync) depends on T016 (optional enhancement)

**Phase 5 (US3 - Views)**:
- T018 (ListItem), T019 (List), T020 (ViewToggle) can all run in parallel ([P])
- T021 (localStorage logic) can run in parallel
- T022 (integrate) depends on T018, T019, T020, T021

**Phase 6 (US4 - Privacy)**:
- T023 (query) can start first
- T024 (API endpoint) depends on T023
- T025 (settings UI) depends on T024

**Phase 7 (Polish)**:
- Most tasks can run in parallel ([P])
- T034 (validation) should be last

### Parallel Opportunities

**Within Setup (Phase 1)**:
- All 3 tasks can run concurrently

**Within Foundational (Phase 2)**:
- After T004: T005, T006, T007 in parallel
- After queries complete: T008 and T009 in parallel

**Across User Stories** (if team capacity allows):
- Once Phase 2 is done, US1, US2, US3, US4 can all start in parallel by different developers
- US1 is simplest and should complete first (MVP)
- US2, US3, US4 can proceed independently

**Within User Stories**:
- US1: T010, T011, T013 in parallel; then T012
- US2: T014, T015 in parallel; then T016, T017
- US3: T018, T019, T020, T021 in parallel; then T022
- US4: Sequential (T023 → T024 → T025)

**Within Polish (Phase 7)**:
- T026-T033 can all run in parallel ([P])
- T034 (final validation) runs last

---

## Parallel Example: User Story 1 (Browse Members)

```bash
# After Foundational Phase completes, launch in parallel:

# Parallel Batch 1:
Task T010: "Create MemberCard component in src/components/members/MemberCard.tsx"
Task T011: "Create MemberDirectoryGrid component in src/components/members/MemberDirectoryGrid.tsx"
Task T013: "Add Members navigation link to authenticated app menu"

# Sequential after Batch 1:
Task T012: "Create main directory page in src/app/(in-app)/app/members/page.tsx"
```

---

## Parallel Example: User Story 3 (Toggle Views)

```bash
# After Foundational Phase completes, launch in parallel:

# Parallel Batch 1:
Task T018: "Create MemberListItem component in src/components/members/MemberListItem.tsx"
Task T019: "Create MemberDirectoryList component in src/components/members/MemberDirectoryList.tsx"
Task T020: "Create ViewToggle component in src/components/members/ViewToggle.tsx"
Task T021: "Add view mode state with localStorage in src/app/(in-app)/app/members/page.tsx"

# Sequential after Batch 1:
Task T022: "Integrate ViewToggle component in src/app/(in-app)/app/members/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Fastest path to working directory**:

1. Complete Phase 1: Setup (T001-T003) - ~30 minutes
2. Complete Phase 2: Foundational (T004-T009) - **CRITICAL** - ~2-3 hours
3. Complete Phase 3: User Story 1 (T010-T013) - ~2-3 hours
4. **STOP and VALIDATE**: Test browsing members independently
5. Deploy/demo basic directory if ready

**MVP Deliverable**: Authenticated users can browse member directory in grid view, see profiles, navigate to profiles, paginate through results.

**Time Estimate**: ~5-7 hours total for MVP

---

### Incremental Delivery (Recommended)

**Build and ship incrementally**:

1. **Foundation** (Phase 1 + 2) → Test database queries, API endpoints work
2. **MVP** (Phase 3 - US1) → Test browsing independently → Ship basic directory! ✅
3. **Search & Filters** (Phase 4 - US2) → Test filtering independently → Ship enhanced directory! ✅
4. **View Modes** (Phase 5 - US3) → Test toggle independently → Ship with better UX! ✅
5. **Privacy Control** (Phase 6 - US4) → Test privacy toggle independently → Ship with privacy! ✅
6. **Polish** (Phase 7) → Final refinements → Ship production-ready! ✅

Each phase adds value without breaking previous functionality.

**Total Time Estimate**: ~15-20 hours across all phases

---

### Parallel Team Strategy

**With multiple developers:**

1. **Together**: Complete Setup + Foundational (Phase 1 + 2) - ~3-4 hours
2. **Once Foundational is done, split up**:
   - **Developer A**: User Story 1 (Browse) - T010-T013
   - **Developer B**: User Story 2 (Filters) - T014-T017
   - **Developer C**: User Story 3 (Views) - T018-T022
   - **Developer D**: User Story 4 (Privacy) - T023-T025
3. **Integration**: Merge stories independently, test each in isolation first
4. **Together**: Polish phase (Phase 7) - T026-T034

**Time Savings**: Complete all user stories in ~5-7 hours instead of ~15-20 hours

---

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 6 tasks ⚠️ CRITICAL PATH
- **Phase 3 (US1 - Browse)**: 4 tasks 🎯 MVP
- **Phase 4 (US2 - Filters)**: 4 tasks
- **Phase 5 (US3 - Views)**: 5 tasks
- **Phase 6 (US4 - Privacy)**: 3 tasks
- **Phase 7 (Polish)**: 9 tasks

**Total**: 34 tasks

**Parallel tasks**: 20 marked with [P] (58% parallelizable)

**MVP tasks only**: 13 tasks (Setup + Foundational + US1)

---

## Format Validation ✅

All tasks follow the required checklist format:
- ✅ Checkbox prefix `- [ ]`
- ✅ Sequential Task IDs (T001-T034)
- ✅ [P] markers for parallelizable tasks
- ✅ [US1], [US2], [US3], [US4] labels for user story tasks
- ✅ Clear descriptions with exact file paths
- ✅ No story labels for Setup, Foundational, and Polish phases

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story is independently testable**: Can validate US1 without implementing US2
- **MVP scope**: Phase 1 + 2 + 3 = 13 tasks for basic working directory
- **No tests included**: Feature spec does not request TDD approach
- **Database**: No migrations needed - uses existing tables (devcards, users, user_achievements, hackathon_badges)
- **Authentication**: All endpoints use existing withAuthRequired middleware
- **Performance**: Database queries use existing indexes, optional GIN index for JSONB tech_stack searches
- **Commit strategy**: Commit after each task or logical group of parallel tasks
- **Checkpoints**: Stop at any phase checkpoint to validate independently before proceeding

---

## Success Criteria Verification

This task breakdown addresses all 12 success criteria from spec.md:

- **SC-001** (Navigate to directory < 30s): T013 (nav link), T012 (page)
- **SC-002** (Search results < 2s): T004 (optimized queries), T016 (debounced search)
- **SC-003** (Filter results < 2s): T004 (indexed queries), T016 (filter integration)
- **SC-004** (10,000+ members support): T004 (pagination), T032 (performance optimization)
- **SC-005** (80% filter interaction): T014 (rich filter UI), T016 (integration)
- **SC-006** (Privacy changes < 60s): T023-T025 (privacy system)
- **SC-007** (Combined filters < 3s): T004 (AND logic in queries)
- **SC-008** (View preference persists): T021 (localStorage)
- **SC-009** (95% profile access success): T010, T018 (clickable cards/items)
- **SC-010** (Zero auth failures): T008, T009, T024 (withAuthRequired middleware)
- **SC-011** (Load time < 3s): T004 (optimized queries), T012 (efficient rendering)
- **SC-012** (URL state accuracy): T017 (URL param sync)

All success criteria are covered by the task breakdown.

---

**Ready for Implementation**: Use `/speckit.implement` to execute tasks sequentially, or manually implement following this task list.
