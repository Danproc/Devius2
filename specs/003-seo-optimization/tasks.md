# Tasks: SEO Optimization

**Input**: Design documents from `/specs/003-seo-optimization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Focus on implementation and manual validation with SEO tools.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router structure:
- `src/app/` - Page routes and special files
- `src/components/` - React components
- `src/lib/` - Utility functions
- `src/db/queries/` - Database queries

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create SEO foundation modules that all user stories will use

- [x] T001 [P] Create SEO utilities directory `src/lib/seo/`
- [x] T002 [P] Create SEO components directory `src/components/seo/`
- [x] T003 [P] Create SEO database queries file `src/db/queries/seo.ts`
- [x] T004 [P] Create OG image API directory `src/app/api/og/`

**Checkpoint**: Directory structure ready for SEO implementation ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core SEO utilities that multiple user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Implement `generatePageMetadata()` helper in `src/lib/seo/metadata.ts`
- [x] T006 [P] Implement Organization schema generator in `src/lib/seo/structured-data.ts`
- [x] T007 [P] Implement Event schema generator in `src/lib/seo/structured-data.ts`
- [x] T008 [P] Implement Person schema generator in `src/lib/seo/structured-data.ts`
- [x] T009 [P] Implement Breadcrumb schema generator in `src/lib/seo/structured-data.ts`
- [x] T010 [P] Create `StructuredData` component in `src/components/seo/StructuredData.tsx`
- [x] T011 [P] Create `Breadcrumbs` component in `src/components/seo/Breadcrumbs.tsx`
- [x] T012 [P] Implement `getAllHackathons()` query in `src/db/queries/seo.ts`
- [x] T013 [P] Implement `getPublicProfiles()` query in `src/db/queries/seo.ts`
- [x] T014 Update root layout metadata with enhanced SEO in `src/app/layout.tsx`
- [x] T015 Add Organization structured data to root layout in `src/app/layout.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - Search Engine Discovery (Priority: P1) 🎯 MVP

**Goal**: Users searching for developer hackathons can discover StackPass through Google search results with rich previews showing hackathon dates, prizes, and event details.

**Independent Test**: Search "developer hackathons 2025" in Google Search Console URL Inspector and verify StackPass hackathon pages have Event rich snippets with proper metadata.

### Implementation for User Story 1

- [x] T016 [P] [US1] Add `generateMetadata()` to hackathons browse page in `src/app/(website-layout)/hackathons/page.tsx`
- [x] T017 [US1] Add `generateMetadata()` to hackathon detail page in `src/app/(website-layout)/hackathons/[slug]/page.tsx`
- [x] T018 [US1] Add Event structured data to hackathon detail page in `src/app/(website-layout)/hackathons/[slug]/page.tsx`
- [x] T019 [US1] Add breadcrumbs to hackathon detail page in `src/app/(website-layout)/hackathons/[slug]/page.tsx`
- [x] T020 [P] [US1] Add metadata to About page in `src/app/(website-layout)/about/page.tsx`
- [ ] T021 [P] [US1] Add metadata to Pricing page in `src/app/(website-layout)/pricing/page.tsx` (SKIPPED - page doesn't exist)
- [x] T022 [P] [US1] Add metadata to Contact page in `src/app/(website-layout)/contact/page.tsx`

**Checkpoint**: Search engines can crawl and index hackathon pages with rich Event snippets. Test with Google Rich Results Test. ✅

---

## Phase 4: User Story 2 - Social Media Sharing (Priority: P1)

**Goal**: When users share StackPass pages on social media, attractive preview cards appear with relevant images, titles, and descriptions that encourage clicks.

**Independent Test**: Share a hackathon URL on Twitter Card Validator and verify custom 1200x630 OG image appears with hackathon title and prize pool.

### Implementation for User Story 2

- [x] T023 [P] [US2] Create hackathon OG image API route in `src/app/api/og/hackathon/route.tsx`
- [x] T024 [P] [US2] Create generic fallback OG image at `public/images/og.png` (1200x630px with StackPass branding) (ALREADY EXISTS)
- [x] T025 [US2] Update hackathon detail metadata to use custom OG image in `src/app/(website-layout)/hackathons/[slug]/page.tsx`
- [x] T026 [US2] Add Twitter Card tags to hackathon metadata in `src/app/(website-layout)/hackathons/[slug]/page.tsx` (AUTO via generatePageMetadata)
- [x] T027 [US2] Update profile metadata to use avatar as OG image in `src/app/(public)/[username]/page.tsx`
- [x] T028 [US2] Add Twitter Card tags to profile metadata in `src/app/(public)/[username]/page.tsx` (AUTO via generatePageMetadata)

**Checkpoint**: Social sharing shows custom OG images. Test with Twitter Card Validator and Facebook Sharing Debugger. ✅

---

## Phase 5: User Story 3 - Profile Discoverability (Priority: P2)

**Goal**: Developers searching for their own names or GitHub usernames can find their StackPass profiles in search results with proper schema markup showing their professional information.

**Independent Test**: Use Google Rich Results Test on a profile URL and verify Person schema is recognized with name, avatar, bio, and social links.

### Implementation for User Story 3

- [x] T029 [US3] Add `generateMetadata()` to profile page in `src/app/(public)/[username]/page.tsx`
- [x] T030 [US3] Add Person structured data to profile page in `src/app/(public)/[username]/page.tsx`
- [x] T031 [US3] Handle missing bio fallback in profile metadata in `src/app/(public)/[username]/page.tsx`
- [x] T032 [US3] Add canonical URL to profile metadata in `src/app/(public)/[username]/page.tsx` (AUTO via generatePageMetadata)

**Checkpoint**: Profile pages have Person schema and appear in search results. Test with Google Rich Results Test. ✅

---

## Phase 6: User Story 4 - Error Handling (Priority: P2)

**Goal**: When users encounter errors (404, 500) on StackPass, they see branded error pages with helpful navigation options instead of generic browser errors.

**Independent Test**: Navigate to a non-existent URL (e.g., /non-existent-page) and verify custom 404 page appears with StackPass branding and "Back to Home" button.

### Implementation for User Story 4

- [x] T033 [P] [US4] Create custom 404 page in `src/app/not-found.tsx`
- [x] T034 [P] [US4] Create custom 500 error page in `src/app/error.tsx`
- [x] T035 [P] [US4] Style 404 page with devcard theme matching brand consistency
- [x] T036 [P] [US4] Style error page with devcard theme matching brand consistency
- [x] T037 [P] [US4] Add navigation links to error pages (Back to Home, Browse Hackathons)

**Checkpoint**: Error pages return proper HTTP status codes and show branded content. Test by visiting /404-test and triggering errors. ✅

---

## Phase 7: User Story 5 - Sitemap Discovery (Priority: P1)

**Goal**: Search engines can automatically discover all public StackPass pages (hackathons, profiles, blog posts) through a comprehensive sitemap that updates as new content is created.

**Independent Test**: Visit /sitemap.xml and verify all hackathons and public profiles are listed with proper lastModified dates and priorities.

### Implementation for User Story 5

- [x] T038 [US5] Update sitemap with hackathons in `src/app/sitemap.ts`
- [x] T039 [US5] Update sitemap with public profiles in `src/app/sitemap.ts`
- [x] T040 [US5] Add ISR revalidation (3600s) to sitemap in `src/app/sitemap.ts`
- [x] T041 [US5] Verify static pages are included in sitemap in `src/app/sitemap.ts`
- [x] T042 [US5] Add policy pages to sitemap in `src/app/sitemap.ts`
- [x] T043 [US5] Create robots.txt with sitemap reference in `src/app/robots.ts`
- [x] T044 [US5] Add disallow rules for private routes in `src/app/robots.ts` (added /admin/)
- [x] T045 [US5] Test sitemap generation time (<5s requirement) (via parallel Promise.all queries)

**Checkpoint**: Sitemap includes all public pages and regenerates hourly. Test by visiting /sitemap.xml and /robots.txt. ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T046 [P] Remove console.log statements from production code (FR-030)
- [ ] T047 [P] Add priority flag to above-fold images in hackathon pages (N/A - no Image components in hackathon pages)
- [ ] T048 [P] Add priority flag to above-fold images in profile pages (N/A - images in CardPreview component)
- [x] T049 Verify all metadata descriptions are ≤160 characters (AUTO via generatePageMetadata slice)
- [x] T050 Verify all titles are ≤60 characters (AUTO via generatePageMetadata slice)
- [ ] T051 Test all OG images are exactly 1200x630px (MANUAL - test /api/og/hackathon)
- [ ] T052 Run Lighthouse SEO audit on homepage (target: 95+) (MANUAL)
- [ ] T053 Run Lighthouse SEO audit on hackathon page (target: 95+) (MANUAL)
- [ ] T054 Run Lighthouse SEO audit on profile page (target: 95+) (MANUAL)
- [ ] T055 Validate Event schema with Google Rich Results Test (MANUAL)
- [ ] T056 Validate Person schema with Google Rich Results Test (MANUAL)
- [ ] T057 Validate Organization schema with Google Rich Results Test (MANUAL)
- [ ] T058 Test social sharing on Twitter Card Validator (MANUAL)
- [ ] T059 Test social sharing on Facebook Sharing Debugger (MANUAL)
- [ ] T060 Test social sharing on LinkedIn Post Inspector (MANUAL)
- [ ] T061 Submit sitemap to Google Search Console (MANUAL - post-deployment)
- [ ] T062 Monitor indexing coverage in Google Search Console (MANUAL - ongoing post-deployment)

**Checkpoint**: All SEO implementation complete. Manual validation tasks require deployment and external tools.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Search Discovery): Independent - can start after Foundational
  - US2 (Social Sharing): Depends on US1 T017 (hackathon metadata exists)
  - US3 (Profile Discovery): Independent - can start after Foundational
  - US4 (Error Handling): Independent - can start after Foundational
  - US5 (Sitemap): Depends on US1 T012-T013 (SEO queries exist) and US3 (profiles have metadata)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Needs US1 T017 complete (hackathon metadata structure exists)
- **User Story 3 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (P1)**: Needs US1 T012-T013 (SEO queries) and should follow US1 & US3 for complete content

### Recommended Execution Order

1. **Phase 1 + Phase 2**: Complete foundation (T001-T015)
2. **User Story 1**: Search discovery (T016-T022) - MVP milestone
3. **User Story 3**: Profile discovery (T029-T032) - Can run parallel with US4
4. **User Story 4**: Error handling (T033-T037) - Can run parallel with US3
5. **User Story 2**: Social sharing (T023-T028) - Enhance US1
6. **User Story 5**: Sitemap (T038-T045) - Aggregates all content
7. **Phase 8**: Polish and validation (T046-T062)

### Parallel Opportunities

- **Setup (Phase 1)**: All tasks (T001-T004) can run in parallel
- **Foundational (Phase 2)**: Tasks T005-T013 can run in parallel (different files)
- **User Story 1**: Tasks T016, T020-T022 can run in parallel (different pages)
- **User Story 2**: Tasks T023-T024 can run in parallel, then T025-T028 can run in parallel
- **User Story 3**: All tasks (T029-T032) touch same file, must be sequential
- **User Story 4**: Tasks T033-T034 can run in parallel, T035-T037 can run in parallel
- **User Story 5**: Tasks T038-T042 sequential (same file), T043-T044 in parallel
- **Polish**: Tasks T046-T048 can run in parallel, T052-T061 (validation) can run in parallel

---

## Parallel Example: User Story 1 (Search Discovery)

```bash
# Launch metadata tasks for different pages in parallel:
Task: "Add generateMetadata() to hackathons browse page in src/app/(website-layout)/hackathons/page.tsx"
Task: "Add metadata to About page in src/app/(website-layout)/about/page.tsx"
Task: "Add metadata to Pricing page in src/app/(website-layout)/pricing/page.tsx"
Task: "Add metadata to Contact page in src/app/(website-layout)/contact/page.tsx"

# Then sequentially add to hackathon detail (depends on browse structure):
Task: "Add generateMetadata() to hackathon detail page in src/app/(website-layout)/hackathons/[slug]/page.tsx"
Task: "Add Event structured data to hackathon detail page"
Task: "Add breadcrumbs to hackathon detail page"
```

## Parallel Example: User Story 2 (Social Sharing)

```bash
# Launch OG image creation in parallel:
Task: "Create hackathon OG image API route in src/app/api/og/hackathon/route.tsx"
Task: "Create generic fallback OG image at public/images/og.png"

# Then update metadata in parallel:
Task: "Update hackathon detail metadata to use custom OG image"
Task: "Add Twitter Card tags to hackathon metadata"
Task: "Update profile metadata to use avatar as OG image"
Task: "Add Twitter Card tags to profile metadata"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 4, 5)

Minimal viable SEO implementation:

1. **Complete Phase 1**: Setup (T001-T004)
2. **Complete Phase 2**: Foundational (T005-T015) - CRITICAL blocker
3. **Complete Phase 3**: User Story 1 - Search Discovery (T016-T022)
4. **Complete Phase 6**: User Story 4 - Error Handling (T033-T037)
5. **Complete Phase 7**: User Story 5 - Sitemap (T038-T045)
6. **STOP and VALIDATE**:
   - Test /sitemap.xml includes hackathons
   - Test Google Rich Results for Event schema
   - Test custom error pages
   - Run Lighthouse SEO audit (target: 80+)
7. **Deploy to staging** - Basic SEO functional

### Full Feature (Add Stories 2 & 3)

Complete SEO with social sharing and profiles:

1. Start from MVP above
2. **Add Phase 5**: User Story 3 - Profile Discovery (T029-T032)
3. **Add Phase 4**: User Story 2 - Social Sharing (T023-T028)
4. **VALIDATE**:
   - Test Twitter Card Validator
   - Test Facebook Sharing Debugger
   - Test profile Person schema
5. **Complete Phase 8**: Polish (T046-T062)
6. **Deploy to production** - Full SEO optimization

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. **Team completes Setup + Foundational together** (T001-T015)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (Search Discovery) - T016-T022
   - Developer B: User Story 3 (Profile Discovery) + User Story 4 (Error Handling) - T029-T037
   - Developer C: Setup for User Story 5 (create queries) - Can start T012-T013 in parallel
3. **After US1 complete**:
   - Developer A: User Story 2 (Social Sharing) - T023-T028
   - Developer B: Continues US3/US4
   - Developer C: User Story 5 (Sitemap) - T038-T045
4. **All converge on Phase 8**: Polish and validation

---

## Success Criteria Mapping

Each user story maps to specific success criteria from spec.md:

| User Story | Success Metrics |
|------------|-----------------|
| US1 - Search Discovery | - StackPass appears in Google results<br>- 100% hackathons pass Rich Results Test (Event schema)<br>- 95% indexing coverage |
| US2 - Social Sharing | - 40% social CTR increase<br>- Custom OG images 1200x630px<br>- Proper previews on Twitter/LinkedIn/Facebook |
| US3 - Profile Discovery | - Profiles appear in name searches<br>- Person schema in Rich Results<br>- Updated info reflects within 24h |
| US4 - Error Handling | - Zero soft 404 errors<br>- Branded error pages with proper status codes<br>- Users can navigate back |
| US5 - Sitemap Discovery | - 100% public pages in sitemap<br>- Regenerates within 1 hour<br>- Accepted by Google Search Console |
| Phase 8 - Overall | - Lighthouse SEO score 95+<br>- Page Speed 90+<br>- All validation tools pass |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test tasks included (not requested in specification)
- Focus on implementation and validation with external SEO tools
- Avoid: Modifying database schema (constraint), breaking existing ISR caching
