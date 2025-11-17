# Implementation Tasks: StackPass Hackathons

**Feature**: StackPass Hackathons
**Branch**: 002-hackathons-system
**Generated**: 2025-11-17
**Updated**: 2025-11-17 (Added Registration Phase)

## Task Summary

**Total Tasks**: 116
**User Stories**: 5 (P1: US1, US2 | P2: US3, US4, US5)
**Phases**: 11 (Setup → 5 User Stories → Polish)
**Estimated Duration**: 5-6 weeks full implementation, 3-4 weeks MVP

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize database schema and shared infrastructure

- [ ] T001 [P] Create hackathons schema in src/db/schema/hackathons.ts
- [ ] T002 [P] Create hackathon-registrations schema in src/db/schema/hackathon-registrations.ts
- [ ] T003 [P] Create hackathon-teams schema in src/db/schema/hackathon-teams.ts
- [ ] T004 [P] Create hackathon-team-invites schema in src/db/schema/hackathon-team-invites.ts
- [ ] T005 [P] Create hackathon-submissions schema in src/db/schema/hackathon-submissions.ts
- [ ] T006 [P] Create hackathon-votes schema in src/db/schema/hackathon-votes.ts
- [ ] T007 [P] Create hackathon-badges schema in src/db/schema/hackathon-badges.ts
- [ ] T008 Export all hackathon schemas from src/db/schema/index.ts
- [ ] T009 Generate Drizzle migrations with drizzle-kit generate
- [ ] T010 Push migrations to Supabase with drizzle-kit push
- [ ] T011 [P] Create TypeScript types in src/types/hackathons.ts
- [ ] T012 [P] Create validation helpers in src/lib/hackathons/validations.ts
- [ ] T013 [P] Create query helpers in src/lib/hackathons/queries.ts

**Deliverables**: 7 schema files (including registrations), migrations applied, types defined, helper functions ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Set up RLS policies and admin authorization middleware

- [ ] T014 Create RLS policy for hackathons table (admin CUD, public read) in Supabase dashboard
- [ ] T015 Create RLS policy for hackathon_registrations table (Pro create/delete, public read count) in Supabase
- [ ] T016 Create RLS policy for hackathon_teams table (Pro create/update, public read) in Supabase
- [ ] T017 Create RLS policy for hackathon_submissions table (Pro create, team update, public read) in Supabase
- [ ] T018 Create RLS policy for hackathon_votes table (Pro create/delete, public read) in Supabase
- [ ] T019 Create RLS policy for hackathon_badges table (system create, public read) in Supabase
- [ ] T020 Create admin auth middleware in src/middleware/admin-auth.ts
- [ ] T021 Create Pro member check helper in src/lib/auth/check-pro-status.ts

**Deliverables**: RLS policies applied (including registrations), admin middleware ready, Pro check available

---

## Phase 3: User Story 1 - Admin Creates and Manages Hackathon (P1)

**Story Goal**: Admin can create hackathons with registration phase, publish them, review submissions, and declare winners

**Independent Test**: Admin creates hackathon with registration dates → publishes → monitors registrations → reviews test submissions → declares 3 winners → badges created

### Database & Backend (US1)

- [ ] T022 [US1] Create POST /api/hackathons route for hackathon creation in src/app/api/hackathons/route.ts
- [ ] T023 [US1] Create PATCH /api/hackathons/[id] route for updates in src/app/api/hackathons/[id]/route.ts
- [ ] T024 [US1] Create POST /api/hackathons/[id]/publish route in src/app/api/hackathons/[id]/publish/route.ts
- [ ] T025 [US1] Create GET /api/hackathons/[id]/registrations route (admin view) in src/app/api/hackathons/[id]/registrations/route.ts
- [ ] T026 [US1] Create GET /api/hackathons/[id]/judging route in src/app/api/hackathons/[id]/judging/route.ts
- [ ] T027 [US1] Create POST /api/hackathons/[id]/declare-winners route in src/app/api/hackathons/[id]/declare-winners/route.ts
- [ ] T028 [US1] Implement createHackathon function with registration validation in src/lib/hackathons/mutations.ts
- [ ] T029 [US1] Implement declareWinners function (creates badges) in src/lib/hackathons/mutations.ts

### Admin UI (US1)

- [ ] T030 [US1] Create admin hackathons list page in src/app/admin/hackathons/page.tsx
- [ ] T031 [US1] Create hackathon form component with registration fields in src/components/hackathons/HackathonForm.tsx
- [ ] T032 [US1] Create admin new hackathon page in src/app/admin/hackathons/new/page.tsx
- [ ] T033 [US1] Create admin edit hackathon page in src/app/admin/hackathons/[id]/edit/page.tsx
- [ ] T034 [US1] Create registrations dashboard page in src/app/admin/hackathons/[id]/registrations/page.tsx
- [ ] T035 [US1] Create RegistrationStats component showing capacity/counts in src/components/hackathons/RegistrationStats.tsx
- [ ] T036 [US1] Create judging interface page in src/app/admin/hackathons/[id]/judging/page.tsx
- [ ] T037 [US1] Create JudgingTable component in src/components/hackathons/JudgingTable.tsx
- [ ] T038 [US1] Create WinnerSelector component in src/components/hackathons/WinnerSelector.tsx
- [ ] T039 [US1] Add admin hackathons nav link in src/components/layout/app-sidebar.tsx

**US1 Deliverables**: Admin can CRUD hackathons with registration phase, monitor registrations, publish events, judge submissions, declare winners with badge creation

---

## Phase 4: User Story 2 - Pro Member Registers, Enters, and Submits Project (P1)

**Story Goal**: Pro member browses hackathons, registers during registration period, forms team (optional), submits project after registration closes

**Independent Test**: Pro user registers for hackathon → waits for submission phase → creates team (optional) → submits project → edits before deadline → submission locked after deadline

### Hackathon Browsing (US2)

- [ ] T040 [P] [US2] Create GET /api/hackathons route (list active/upcoming/registration) in src/app/api/hackathons/route.ts
- [ ] T041 [P] [US2] Create GET /api/hackathons/[slug] route (detail by slug) in src/app/api/hackathons/[slug]/route.ts
- [ ] T042 [US2] Create hackathons browse page in src/app/hackathons/page.tsx
- [ ] T043 [US2] Create HackathonCard component with registration status in src/components/hackathons/HackathonCard.tsx
- [ ] T044 [US2] Create hackathon detail page in src/app/hackathons/[id]/page.tsx
- [ ] T045 [US2] Create CountdownTimer component in src/components/hackathons/CountdownTimer.tsx

### Registration System (US2)

- [ ] T046 [US2] Create POST /api/hackathons/[id]/registrations route with capacity check in src/app/api/hackathons/[id]/registrations/route.ts
- [ ] T047 [US2] Create DELETE /api/hackathons/[id]/registrations route (unregister) in src/app/api/hackathons/[id]/registrations/route.ts
- [ ] T048 [US2] Create GET /api/hackathons/[id]/registrations/me route (user status) in src/app/api/hackathons/[id]/registrations/me/route.ts
- [ ] T049 [US2] Implement atomic registration with capacity check in src/lib/hackathons/mutations.ts
- [ ] T050 [US2] Implement unregistration with deadline validation in src/lib/hackathons/mutations.ts
- [ ] T051 [US2] Create RegistrationButton component with capacity display in src/components/hackathons/RegistrationButton.tsx
- [ ] T052 [US2] Create RegistrationStatus component (registered/unregistered/full) in src/components/hackathons/RegistrationStatus.tsx
- [ ] T053 [US2] Add Pro membership validation at registration time in registration API routes
- [ ] T054 [US2] Add registration status display to hackathon detail page in src/app/hackathons/[id]/page.tsx

### Team Formation (US2)

- [ ] T055 [US2] Create POST /api/hackathons/[id]/teams route in src/app/api/hackathons/[id]/teams/route.ts
- [ ] T056 [US2] Create POST /api/hackathons/[id]/teams/[teamId]/invites route in src/app/api/hackathons/[id]/teams/[teamId]/invites/route.ts
- [ ] T057 [US2] Create POST /api/hackathons/teams/invites/[id]/accept route in src/app/api/hackathons/teams/invites/[id]/accept/route.ts
- [ ] T058 [US2] Create DELETE /api/hackathons/teams/invites/[id] route (decline) in src/app/api/hackathons/teams/invites/[id]/route.ts
- [ ] T059 [US2] Create team builder page in src/app/hackathons/[id]/team/page.tsx
- [ ] T060 [US2] Create TeamBuilder component in src/components/hackathons/TeamBuilder.tsx
- [ ] T061 [US2] Create MemberSearch component (search registered users only) in src/components/hackathons/MemberSearch.tsx
- [ ] T062 [US2] Create TeamInviteCard component in src/components/hackathons/TeamInviteCard.tsx

### Project Submission (US2)

- [ ] T063 [US2] Create POST /api/hackathons/[id]/submissions route with registration check in src/app/api/hackathons/[id]/submissions/route.ts
- [ ] T064 [US2] Create PATCH /api/hackathons/submissions/[id] route in src/app/api/hackathons/submissions/[id]/route.ts
- [ ] T065 [US2] Create GET /api/hackathons/[id]/submissions/me route in src/app/api/hackathons/[id]/submissions/me/route.ts
- [ ] T066 [US2] Implement submission creation with registration validation in src/lib/hackathons/mutations.ts
- [ ] T067 [US2] Create submission entry page in src/app/hackathons/[id]/enter/page.tsx
- [ ] T068 [US2] Create SubmissionForm component in src/components/hackathons/SubmissionForm.tsx
- [ ] T069 [US2] Create submission edit page in src/app/hackathons/submissions/[id]/edit/page.tsx
- [ ] T070 [US2] Add GitHub URL validation in src/lib/hackathons/validations.ts
- [ ] T071 [US2] Add deadline enforcement logic in submission API routes
- [ ] T072 [US2] Add "must register first" error handling in submission routes
- [ ] T073 [US2] Create SubmissionGate component (shows registration required message) in src/components/hackathons/SubmissionGate.tsx

**US2 Deliverables**: Pro members browse events, register during registration window, can unregister before deadline, form teams from registered users, submit projects only if registered, edit until submission deadline

---

## Phase 5: User Story 3 - Community Voting (P2)

**Story Goal**: Pro members vote on submissions during voting period

**Independent Test**: Voting period opens → Pro user votes on 5 submissions → vote counts update → cannot vote twice or on own team

### Voting System (US3)

- [ ] T074 [P] [US3] Create POST /api/hackathons/submissions/[id]/vote route in src/app/api/hackathons/submissions/[id]/vote/route.ts
- [ ] T075 [P] [US3] Create DELETE /api/hackathons/submissions/[id]/vote route in src/app/api/hackathons/submissions/[id]/vote/route.ts
- [ ] T076 [P] [US3] Create GET /api/hackathons/[id]/submissions route (voting view) in src/app/api/hackathons/[id]/submissions/route.ts
- [ ] T077 [US3] Create voting page in src/app/hackathons/[id]/vote/page.tsx
- [ ] T078 [US3] Create SubmissionGrid component in src/components/hackathons/SubmissionGrid.tsx
- [ ] T079 [US3] Create VoteButton component with optimistic UI in src/components/hackathons/VoteButton.tsx
- [ ] T080 [US3] Add vote validation (Pro check, not own team, within period) in vote API routes
- [ ] T081 [US3] Implement vote count increment/decrement logic in src/lib/hackathons/mutations.ts

**US3 Deliverables**: Community voting functional with vote tracking and anti-gaming

---

## Phase 6: User Story 4 - Public Gallery (P2)

**Story Goal**: All users browse past winners, filter projects, view details

**Independent Test**: Visit /gallery → see winners → filter by tech stack → click project → view team profiles

### Gallery Pages (US4)

- [ ] T082 [P] [US4] Create GET /api/gallery/winners route (paginated) in src/app/api/gallery/winners/route.ts
- [ ] T083 [P] [US4] Create GET /api/gallery/hackathons/[slug]/winners route in src/app/api/gallery/hackathons/[slug]/winners/route.ts
- [ ] T084 [US4] Create main gallery page in src/app/gallery/page.tsx
- [ ] T085 [US4] Create hackathon winners page in src/app/gallery/hackathons/[slug]/page.tsx
- [ ] T086 [US4] Create project detail page in src/app/gallery/projects/[id]/page.tsx

### Gallery Components (US4)

- [ ] T087 [P] [US4] Create WinnerGrid component in src/components/hackathons/WinnerGrid.tsx
- [ ] T088 [P] [US4] Create ProjectCard component in src/components/hackathons/ProjectCard.tsx
- [ ] T089 [P] [US4] Create ProjectDetail component in src/components/hackathons/ProjectDetail.tsx
- [ ] T090 [P] [US4] Create GalleryFilters component in src/components/hackathons/GalleryFilters.tsx
- [ ] T091 [US4] Add SEO meta tags to gallery pages
- [ ] T092 [US4] Configure ISR with 1-hour revalidation for gallery

**US4 Deliverables**: Public gallery with filtering, project details, team profile links

---

## Phase 7: User Story 5 - Badges on Profile & Wallet Pass (P2)

**Story Goal**: Winners' badges appear on StackPass profile and in wallet pass

**Independent Test**: User wins hackathon → badge appears on profile → download wallet pass → badge summary included

### Profile Badge Display (US5)

- [ ] T093 [P] [US5] Create GET /api/users/[userId]/badges route in src/app/api/users/[userId]/badges/route.ts
- [ ] T094 [US5] Add AchievementsSection to profile page in src/app/[username]/page.tsx
- [ ] T095 [US5] Create BadgeCard component in src/components/hackathons/BadgeCard.tsx
- [ ] T096 [US5] Create BadgeSummary component in src/components/hackathons/BadgeSummary.tsx

### Wallet Pass Integration (US5)

- [ ] T097 [US5] Add badge query to wallet pass generation in src/lib/sharing/wallet-pass.ts
- [ ] T098 [US5] Format badge summary for auxiliary field in src/lib/hackathons/helpers.ts
- [ ] T099 [US5] Update WalletPassDevCardData interface to include badges in src/lib/sharing/wallet-pass.ts
- [ ] T100 [US5] Test wallet pass with 5+ badges (verify under 200KB limit)

**US5 Deliverables**: Badges visible on profiles and in wallet passes

---

## Phase 8: Email Notifications

**Goal**: Send emails for team invites, deadlines, voting, and winner announcements

- [ ] T101 [P] Create TeamInvite email template in src/emails/TeamInvite.tsx
- [ ] T102 [P] Create RegistrationConfirmation email template in src/emails/RegistrationConfirmation.tsx
- [ ] T103 [P] Create DeadlineReminder email template in src/emails/DeadlineReminder.tsx
- [ ] T104 [P] Create VotingOpen email template in src/emails/VotingOpen.tsx
- [ ] T105 [P] Create WinnerAnnouncement email template in src/emails/WinnerAnnouncement.tsx
- [ ] T106 Add email trigger to registration API route
- [ ] T107 Add email triggers to team invite API route
- [ ] T108 Add email trigger to declareWinners function
- [ ] T109 Create Vercel cron job for deadline reminders in vercel.json

---

## Phase 9: Navigation & Access Control

**Goal**: Add hackathons to navigation, enforce Pro-only access, add upgrade CTAs

- [ ] T110 Add Hackathons link to Pro member navigation in src/components/layout/app-sidebar.tsx
- [ ] T111 Add Gallery link to public footer in src/components/layout/footer.tsx
- [ ] T112 Create Pro membership check middleware for hackathon routes in src/middleware/pro-check.ts
- [ ] T113 Add "Upgrade to Pro" CTA on hackathon entry for Free users in src/app/hackathons/[id]/page.tsx

---

## Phase 10: UX Polish

**Goal**: Loading states, empty states, error handling, analytics

- [ ] T114 [P] Create HackathonSkeleton loading component in src/components/hackathons/HackathonSkeleton.tsx
- [ ] T115 [P] Create SubmissionSkeleton component in src/components/hackathons/SubmissionSkeleton.tsx
- [ ] T116 [P] Create EmptyState component for no hackathons in src/components/hackathons/EmptyState.tsx
- [ ] T117 Add error boundaries to hackathon pages
- [ ] T118 Add PostHog events: hackathon_registered, submission_created, vote_cast, badge_earned in relevant API routes
- [ ] T119 Add toast notifications for all user actions (register, submit, vote, team invite)

---

## Phase 11: Testing & Documentation

**Goal**: Manual testing scenarios and documentation updates

- [ ] T120 Test end-to-end flow: Create hackathon with registration → register → submit → vote → declare winner → verify badge
- [ ] T121 Test registration capacity limits (fill to max, verify rejection)
- [ ] T122 Test unregistration before and after deadline (verify enforcement)
- [ ] T123 Test submission gate (unregistered user cannot submit)
- [ ] T124 Test team formation with 3 members (invites, accepts, submission)
- [ ] T125 Test voting restrictions (own team, non-Pro, outside voting period)
- [ ] T126 Test gallery filtering and pagination
- [ ] T127 Test wallet pass with badges (verify format and size)
- [ ] T128 Update README.md with hackathons feature description
- [ ] T129 Update API documentation with new endpoints

---

## Task Dependencies & Execution Order

### Critical Path (Must Complete in Order)

```
Phase 1 (Setup + Registrations Schema) → Phase 2 (Foundational + Registration RLS) → Phase 3 (US1: Admin) → Phase 4 (US2: Registration → Submissions)
```

### Independent Parallel Execution

**After Phase 2**, these can run in parallel:
- **US1 (Admin)** + **US2 (Registration/Submissions)** → Can build simultaneously (different routes/components)
- **US3 (Voting)** → Depends on US2 (needs submissions to exist)
- **US4 (Gallery)** → Depends on US1 (needs winners declared)
- **US5 (Badges)** → Depends on US1 (needs badges created)

### Parallel Opportunities Within Stories

**US1 (Admin)**: T022-T027 API routes can be built in parallel
**US2 (Registration)**: T046-T054 registration + T055-T062 teams + T063-T073 submissions (3 parallel streams)
**US4 (Gallery)**: T087-T090 components all parallelizable

---

## Implementation Strategy

### MVP Scope (Week 1-2)

**Minimum for First Hackathon**:
- Phase 1: Setup (including registrations schema) ✓
- Phase 2: Foundational (including registration RLS) ✓
- Phase 3: US1 (Admin with registration monitoring) ✓
- Phase 4: US2 (Registration + Solo Submissions) - Skip team formation initially ✓
- Simplified voting: Admin manually picks winners without votes

**Deliverable**: Can run first hackathon with registration phase, capacity limits, solo submissions, and manual winner selection

### v1.0 Scope (Week 3-4)

**Complete Feature**:
- Add Phase 4 team formation (T055-T062)
- Add Phase 5: US3 (Voting)
- Add Phase 6: US4 (Gallery)
- Add Phase 7: US5 (Badges)

**Deliverable**: Full self-service hackathon system with registration, community voting, and badges

### v1.1 Scope (Week 5+)

- Phase 8: Email notifications (including registration confirmations)
- Phase 9: Navigation & CTAs
- Phase 10: UX polish
- Phase 11: Comprehensive testing

**Deliverable**: Production-ready with registration phase, notifications, and polished UX

---

## Registration Phase Implementation Notes

### Critical Registration Requirements

1. **Schema Changes**: hackathon_registrations table with (hackathon_id, user_id) unique constraint
2. **Hackathons Table**: Add registration_start_at, registration_end_at, max_participants fields
3. **API Endpoints**: POST/DELETE /api/hackathons/[id]/registrations, GET /me for status
4. **Capacity Enforcement**: Atomic check-and-insert with transaction in registration mutation
5. **Submission Gate**: Verify user has active registration before allowing submission creation
6. **Timeline Validation**: Enforce registration_start_at < registration_end_at < start_at < submission_deadline_at
7. **Unregistration Rules**: Allow DELETE only when NOW() < registration_end_at
8. **Pro Validation**: Check is_premium && premium_expires_at > NOW() at registration time

### Registration UI Components

- **RegistrationButton**: Shows "Register" (available), "Registered" (confirmed), "Unregister" (option), "Full" (capacity reached)
- **RegistrationStatus**: Displays "X/Y spots filled" or "Unlimited spots", countdown to registration close
- **SubmissionGate**: Shows "Must register during registration period" error if user tries to submit without registration

### Registration Flow Sequence

1. User visits /app/hackathons → sees hackathons in "registration" status
2. User clicks hackathon → sees registration deadline, capacity, participation preference options
3. User clicks "Register" → selects solo/team preference → registration created (if Pro + capacity available)
4. User sees "Registered - Submissions open in X days" message
5. Registration window closes → submission phase begins
6. User can now create submission (only if registered)
7. If user tries to submit without registration → error message with explanation

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] Admin can create hackathon with registration phase (dates, capacity)
- [ ] Admin can monitor registrations (count, capacity, participant list)
- [ ] Pro member can register during registration window
- [ ] Registration respects capacity limits (enforced atomically)
- [ ] User can unregister before registration_end_at
- [ ] User cannot unregister after registration_end_at
- [ ] Pro member can submit project only if registered
- [ ] Unregistered user sees clear error when trying to submit
- [ ] Pro member can submit solo or form team (regardless of preference)
- [ ] Voting works with proper restrictions
- [ ] Winners appear in public gallery
- [ ] Badges show on profile
- [ ] Badges included in wallet pass
- [ ] Free users see upgrade CTAs
- [ ] All RLS policies enforced
- [ ] No performance degradation with 100+ registrations/submissions

---

## Next Steps

1. ✅ Spec generated (with registration phase)
2. ✅ Plan created
3. ✅ Tasks defined (129 tasks, including registration)
4. ⏳ Begin Phase 1: Setup (T001-T013, including registrations schema)
5. ⏳ Run `/speckit.implement` to execute tasks automatically

**Ready to start implementation with registration phase!**
