# Implementation Tasks: StackPass Hackathons

**Feature**: StackPass Hackathons
**Branch**: 002-hackathons-system
**Generated**: 2025-11-17

## Task Summary

**Total Tasks**: 89
**User Stories**: 5 (P1: US1, US2 | P2: US3, US4, US5)
**Phases**: 11 (Setup → 5 User Stories → Polish)
**Estimated Duration**: 4-5 weeks full implementation, 2-3 weeks MVP

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize database schema and shared infrastructure

- [ ] T001 [P] Create hackathons schema in src/db/schema/hackathons.ts
- [ ] T002 [P] Create hackathon-teams schema in src/db/schema/hackathon-teams.ts
- [ ] T003 [P] Create hackathon-team-invites schema in src/db/schema/hackathon-team-invites.ts
- [ ] T004 [P] Create hackathon-submissions schema in src/db/schema/hackathon-submissions.ts
- [ ] T005 [P] Create hackathon-votes schema in src/db/schema/hackathon-votes.ts
- [ ] T006 [P] Create hackathon-badges schema in src/db/schema/hackathon-badges.ts
- [ ] T007 Export all hackathon schemas from src/db/schema/index.ts
- [ ] T008 Generate Drizzle migrations with drizzle-kit generate
- [ ] T009 Push migrations to Supabase with drizzle-kit push
- [ ] T010 [P] Create TypeScript types in src/types/hackathons.ts
- [ ] T011 [P] Create validation helpers in src/lib/hackathons/validations.ts
- [ ] T012 [P] Create query helpers in src/lib/hackathons/queries.ts

**Deliverables**: 6 schema files, migrations applied, types defined, helper functions ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Set up RLS policies and admin authorization middleware

- [ ] T013 Create RLS policy for hackathons table (admin CUD, public read) in Supabase dashboard
- [ ] T014 Create RLS policy for hackathon_teams table (Pro create/update, public read) in Supabase
- [ ] T015 Create RLS policy for hackathon_submissions table (Pro create, team update, public read) in Supabase
- [ ] T016 Create RLS policy for hackathon_votes table (Pro create/delete, public read) in Supabase
- [ ] T017 Create RLS policy for hackathon_badges table (system create, public read) in Supabase
- [ ] T018 Create admin auth middleware in src/middleware/admin-auth.ts
- [ ] T019 Create Pro member check helper in src/lib/auth/check-pro-status.ts

**Deliverables**: RLS policies applied, admin middleware ready, Pro check available

---

## Phase 3: User Story 1 - Admin Creates and Manages Hackathon (P1)

**Story Goal**: Admin can create hackathons, publish them, review submissions, and declare winners

**Independent Test**: Admin creates hackathon → publishes → reviews test submissions → declares 3 winners → badges created

### Database & Backend (US1)

- [ ] T020 [US1] Create POST /api/hackathons route for hackathon creation in src/app/api/hackathons/route.ts
- [ ] T021 [US1] Create PATCH /api/hackathons/[id] route for updates in src/app/api/hackathons/[id]/route.ts
- [ ] T022 [US1] Create POST /api/hackathons/[id]/publish route in src/app/api/hackathons/[id]/publish/route.ts
- [ ] T023 [US1] Create GET /api/hackathons/[id]/judging route in src/app/api/hackathons/[id]/judging/route.ts
- [ ] T024 [US1] Create POST /api/hackathons/[id]/declare-winners route in src/app/api/hackathons/[id]/declare-winners/route.ts
- [ ] T025 [US1] Implement createHackathon function in src/lib/hackathons/mutations.ts
- [ ] T026 [US1] Implement declareWinners function (creates badges) in src/lib/hackathons/mutations.ts

### Admin UI (US1)

- [ ] T027 [US1] Create admin hackathons list page in src/app/admin/hackathons/page.tsx
- [ ] T028 [US1] Create hackathon form component in src/components/hackathons/HackathonForm.tsx
- [ ] T029 [US1] Create admin new hackathon page in src/app/admin/hackathons/new/page.tsx
- [ ] T030 [US1] Create admin edit hackathon page in src/app/admin/hackathons/[id]/edit/page.tsx
- [ ] T031 [US1] Create judging interface page in src/app/admin/hackathons/[id]/judging/page.tsx
- [ ] T032 [US1] Create JudgingTable component in src/components/hackathons/JudgingTable.tsx
- [ ] T033 [US1] Create WinnerSelector component in src/components/hackathons/WinnerSelector.tsx
- [ ] T034 [US1] Add admin hackathons nav link in src/components/layout/app-sidebar.tsx

**US1 Deliverables**: Admin can CRUD hackathons, publish events, judge submissions, declare winners with badge creation

---

## Phase 4: User Story 2 - Pro Member Enters and Submits Project (P1)

**Story Goal**: Pro member browses hackathons, enters event, submits project (solo or team)

**Independent Test**: Pro user enters hackathon → creates submission → edits before deadline → submission locked after deadline

### Hackathon Browsing (US2)

- [ ] T035 [P] [US2] Create GET /api/hackathons route (list active/upcoming) in src/app/api/hackathons/route.ts
- [ ] T036 [P] [US2] Create GET /api/hackathons/[slug] route (detail by slug) in src/app/api/hackathons/[slug]/route.ts
- [ ] T037 [US2] Create hackathons browse page in src/app/hackathons/page.tsx
- [ ] T038 [US2] Create HackathonCard component in src/components/hackathons/HackathonCard.tsx
- [ ] T039 [US2] Create hackathon detail page in src/app/hackathons/[id]/page.tsx
- [ ] T040 [US2] Create CountdownTimer component in src/components/hackathons/CountdownTimer.tsx

### Team Formation (US2)

- [ ] T041 [US2] Create POST /api/hackathons/[id]/teams route in src/app/api/hackathons/[id]/teams/route.ts
- [ ] T042 [US2] Create POST /api/hackathons/[id]/teams/[teamId]/invites route in src/app/api/hackathons/[id]/teams/[teamId]/invites/route.ts
- [ ] T043 [US2] Create POST /api/hackathons/teams/invites/[id]/accept route in src/app/api/hackathons/teams/invites/[id]/accept/route.ts
- [ ] T044 [US2] Create DELETE /api/hackathons/teams/invites/[id] route (decline) in src/app/api/hackathons/teams/invites/[id]/route.ts
- [ ] T045 [US2] Create team builder page in src/app/hackathons/[id]/team/page.tsx
- [ ] T046 [US2] Create TeamBuilder component in src/components/hackathons/TeamBuilder.tsx
- [ ] T047 [US2] Create MemberSearch component in src/components/hackathons/MemberSearch.tsx
- [ ] T048 [US2] Create TeamInviteCard component in src/components/hackathons/TeamInviteCard.tsx

### Project Submission (US2)

- [ ] T049 [US2] Create POST /api/hackathons/[id]/submissions route in src/app/api/hackathons/[id]/submissions/route.ts
- [ ] T050 [US2] Create PATCH /api/hackathons/submissions/[id] route in src/app/api/hackathons/submissions/[id]/route.ts
- [ ] T051 [US2] Create GET /api/hackathons/[id]/submissions/me route in src/app/api/hackathons/[id]/submissions/me/route.ts
- [ ] T052 [US2] Create submission entry page in src/app/hackathons/[id]/enter/page.tsx
- [ ] T053 [US2] Create SubmissionForm component in src/components/hackathons/SubmissionForm.tsx
- [ ] T054 [US2] Create submission edit page in src/app/hackathons/submissions/[id]/edit/page.tsx
- [ ] T055 [US2] Add GitHub URL validation in src/lib/hackathons/validations.ts
- [ ] T056 [US2] Add deadline enforcement logic in submission API routes

**US2 Deliverables**: Pro members browse events, form teams, submit projects, edit until deadline

---

## Phase 5: User Story 3 - Community Voting (P2)

**Story Goal**: Pro members vote on submissions during voting period

**Independent Test**: Voting period opens → Pro user votes on 5 submissions → vote counts update → cannot vote twice or on own team

### Voting System (US3)

- [ ] T057 [P] [US3] Create POST /api/hackathons/submissions/[id]/vote route in src/app/api/hackathons/submissions/[id]/vote/route.ts
- [ ] T058 [P] [US3] Create DELETE /api/hackathons/submissions/[id]/vote route in src/app/api/hackathons/submissions/[id]/vote/route.ts
- [ ] T059 [P] [US3] Create GET /api/hackathons/[id]/submissions route (voting view) in src/app/api/hackathons/[id]/submissions/route.ts
- [ ] T060 [US3] Create voting page in src/app/hackathons/[id]/vote/page.tsx
- [ ] T061 [US3] Create SubmissionGrid component in src/components/hackathons/SubmissionGrid.tsx
- [ ] T062 [US3] Create VoteButton component with optimistic UI in src/components/hackathons/VoteButton.tsx
- [ ] T063 [US3] Add vote validation (Pro check, not own team, within period) in vote API routes
- [ ] T064 [US3] Implement vote count increment/decrement logic in src/lib/hackathons/mutations.ts

**US3 Deliverables**: Community voting functional with vote tracking and anti-gaming

---

## Phase 6: User Story 4 - Public Gallery (P2)

**Story Goal**: All users browse past winners, filter projects, view details

**Independent Test**: Visit /gallery → see winners → filter by tech stack → click project → view team profiles

### Gallery Pages (US4)

- [ ] T065 [P] [US4] Create GET /api/gallery/winners route (paginated) in src/app/api/gallery/winners/route.ts
- [ ] T066 [P] [US4] Create GET /api/gallery/hackathons/[slug]/winners route in src/app/api/gallery/hackathons/[slug]/winners/route.ts
- [ ] T067 [US4] Create main gallery page in src/app/gallery/page.tsx
- [ ] T068 [US4] Create hackathon winners page in src/app/gallery/hackathons/[slug]/page.tsx
- [ ] T069 [US4] Create project detail page in src/app/gallery/projects/[id]/page.tsx

### Gallery Components (US4)

- [ ] T070 [P] [US4] Create WinnerGrid component in src/components/hackathons/WinnerGrid.tsx
- [ ] T071 [P] [US4] Create ProjectCard component in src/components/hackathons/ProjectCard.tsx
- [ ] T072 [P] [US4] Create ProjectDetail component in src/components/hackathons/ProjectDetail.tsx
- [ ] T073 [P] [US4] Create GalleryFilters component in src/components/hackathons/GalleryFilters.tsx
- [ ] T074 [US4] Add SEO meta tags to gallery pages
- [ ] T075 [US4] Configure ISR with 1-hour revalidation for gallery

**US4 Deliverables**: Public gallery with filtering, project details, team profile links

---

## Phase 7: User Story 5 - Badges on Profile & Wallet Pass (P2)

**Story Goal**: Winners' badges appear on StackPass profile and in wallet pass

**Independent Test**: User wins hackathon → badge appears on profile → download wallet pass → badge summary included

### Profile Badge Display (US5)

- [ ] T076 [P] [US5] Create GET /api/users/[userId]/badges route in src/app/api/users/[userId]/badges/route.ts
- [ ] T077 [US5] Add AchievementsSection to profile page in src/app/[username]/page.tsx
- [ ] T078 [US5] Create BadgeCard component in src/components/hackathons/BadgeCard.tsx
- [ ] T079 [US5] Create BadgeSummary component in src/components/hackathons/BadgeSummary.tsx

### Wallet Pass Integration (US5)

- [ ] T080 [US5] Add badge query to wallet pass generation in src/lib/sharing/wallet-pass.ts
- [ ] T081 [US5] Format badge summary for auxiliary field in src/lib/hackathons/helpers.ts
- [ ] T082 [US5] Update WalletPassDevCardData interface to include badges in src/lib/sharing/wallet-pass.ts
- [ ] T083 [US5] Test wallet pass with 5+ badges (verify under 200KB limit)

**US5 Deliverables**: Badges visible on profiles and in wallet passes

---

## Phase 8: Email Notifications

**Goal**: Send emails for team invites, deadlines, voting, and winner announcements

- [ ] T084 [P] Create TeamInvite email template in src/emails/TeamInvite.tsx
- [ ] T085 [P] Create DeadlineReminder email template in src/emails/DeadlineReminder.tsx
- [ ] T086 [P] Create VotingOpen email template in src/emails/VotingOpen.tsx
- [ ] T087 [P] Create WinnerAnnouncement email template in src/emails/WinnerAnnouncement.tsx
- [ ] T088 Add email triggers to team invite API route
- [ ] T089 Add email trigger to declareWinners function
- [ ] T090 Create Vercel cron job for deadline reminders in vercel.json

---

## Phase 9: Navigation & Access Control

**Goal**: Add hackathons to navigation, enforce Pro-only access, add upgrade CTAs

- [ ] T091 Add Hackathons link to Pro member navigation in src/components/layout/app-sidebar.tsx
- [ ] T092 Add Gallery link to public footer in src/components/layout/footer.tsx
- [ ] T093 Create Pro membership check middleware for hackathon routes in src/middleware/pro-check.ts
- [ ] T094 Add "Upgrade to Pro" CTA on hackathon entry for Free users in src/app/hackathons/[id]/page.tsx

---

## Phase 10: UX Polish

**Goal**: Loading states, empty states, error handling, analytics

- [ ] T095 [P] Create HackathonSkeleton loading component in src/components/hackathons/HackathonSkeleton.tsx
- [ ] T096 [P] Create SubmissionSkeleton component in src/components/hackathons/SubmissionSkeleton.tsx
- [ ] T097 [P] Create EmptyState component for no hackathons in src/components/hackathons/EmptyState.tsx
- [ ] T098 Add error boundaries to hackathon pages
- [ ] T099 Add PostHog events: hackathon_entered, submission_created, vote_cast, badge_earned in relevant API routes
- [ ] T100 Add toast notifications for all user actions (submit, vote, team invite)

---

## Phase 11: Testing & Documentation

**Goal**: Manual testing scenarios and documentation updates

- [ ] T101 Test end-to-end flow: Create hackathon → submit → vote → declare winner → verify badge
- [ ] T102 Test team formation with 3 members (invites, accepts, submission)
- [ ] T103 Test voting restrictions (own team, non-Pro, outside voting period)
- [ ] T104 Test gallery filtering and pagination
- [ ] T105 Test wallet pass with badges (verify format and size)
- [ ] T106 Update README.md with hackathons feature description
- [ ] T107 Update API documentation with new endpoints

---

## Task Dependencies & Execution Order

### Critical Path (Must Complete in Order)

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1: Admin) → Phase 4 (US2: Submissions)
```

### Independent Parallel Execution

**After Phase 2**, these can run in parallel:
- **US1 (Admin)** + **US2 (Submissions)** → Can build simultaneously (different routes/components)
- **US3 (Voting)** → Depends on US2 (needs submissions to exist)
- **US4 (Gallery)** → Depends on US1 (needs winners declared)
- **US5 (Badges)** → Depends on US1 (needs badges created)

### Parallel Opportunities Within Stories

**US1 (Admin)**: T020-T024 API routes can be built in parallel
**US2 (Submissions)**: T035-T040 browsing + T041-T048 teams + T049-T056 submissions (3 parallel streams)
**US4 (Gallery)**: T070-T073 components all parallelizable

---

## Implementation Strategy

### MVP Scope (Week 1-2)

**Minimum for First Hackathon**:
- Phase 1: Setup ✓
- Phase 2: Foundational ✓
- Phase 3: US1 (Admin) ✓
- Phase 4: US2 (Submissions) - Solo only, skip team formation initially ✓
- Simplified voting: Admin manually picks winners without votes

**Deliverable**: Can run first hackathon with solo submissions and manual winner selection

### v1.0 Scope (Week 3-4)

**Complete Feature**:
- Add Phase 4 team formation (T041-T048)
- Add Phase 5: US3 (Voting)
- Add Phase 6: US4 (Gallery)
- Add Phase 7: US5 (Badges)

**Deliverable**: Full self-service hackathon system with community voting and badges

### v1.1 Scope (Week 5+)

- Phase 8: Email notifications
- Phase 9: Navigation & CTAs
- Phase 10: UX polish
- Phase 11: Comprehensive testing

**Deliverable**: Production-ready with notifications and polished UX

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] Admin can create and publish hackathon
- [ ] Pro member can submit project (solo and team)
- [ ] Voting works with proper restrictions
- [ ] Winners appear in public gallery
- [ ] Badges show on profile
- [ ] Badges included in wallet pass
- [ ] Free users see upgrade CTAs
- [ ] All RLS policies enforced
- [ ] No performance degradation with 100+ submissions

---

## Next Steps

1. ✅ Spec generated
2. ✅ Plan created
3. ✅ Tasks defined (107 tasks)
4. ⏳ Begin Phase 1: Setup (T001-T012)
5. ⏳ Run `/speckit.implement` to execute tasks automatically

**Ready to start implementation!**
