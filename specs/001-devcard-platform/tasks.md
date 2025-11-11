# Tasks: DevCard V2 - Developer Social Business Card Platform

**Input**: Design documents from `/specs/001-devcard-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly required in the specification, so test tasks are excluded to accelerate delivery.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses Next.js App Router structure:
- Source: `src/` (app/, components/, lib/, db/)
- Database: `src/db/schema/`
- API Routes: `src/app/api/`
- Pages: `src/app/(auth)/`, `src/app/(in-app)/`, `src/app/(public)/`

---

## Phase 1: Setup (Shared Infrastructure) ✓ COMPLETED

**Purpose**: Project initialization and dependency installation

- [x] T001 [P] Install testing dependencies (Vitest, React Testing Library, Playwright) via pnpm
- [x] T002 [P] Configure Vitest test environment in vitest.config.ts
- [x] T003 [P] Configure Playwright E2E testing in playwright.config.ts
- [x] T004 [P] Create test directories (tests/unit/, tests/integration/, tests/e2e/)
- [x] T005 [P] Add Upstash Rate Limit package (@upstash/ratelimit) for connection rate limiting
- [x] T006 [P] Verify existing dependencies (qrcode, passkit-generator, @octokit/rest, inngest, stripe)

---

## Phase 2: Foundational (Blocking Prerequisites) ✓ COMPLETED

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**✅ COMPLETE**: Foundation ready - user story implementation can now begin!

### Database Schema Foundation ✓ COMPLETE

- [x] T007 Extend src/db/schema/user.ts with GitHub fields (github_id, github_username, is_premium, premium_expires_at)
- [x] T008 [P] Create src/db/schema/devcard.ts with devcards table definition per data-model.md
- [x] T009 [P] Create src/db/schema/github-cache.ts with github_cache table definition per data-model.md
- [x] T010 [P] Create src/db/schema/connections.ts with connections and blocked_users tables per data-model.md
- [x] T011 [P] Create src/db/schema/notifications.ts with notifications table per data-model.md
- [x] T012 [P] Create src/db/schema/analytics.ts with analytics_events and analytics_daily tables per data-model.md
- [x] T013 Extend src/db/schema/plans.ts with DevCard features field (custom_themes, custom_domain, etc.)
- [x] T014 Generate Drizzle migration with pnpm drizzle-kit generate
- [x] T015 Apply database migration with pnpm drizzle-kit push

### TypeScript Types ✓ COMPLETE

- [x] T016 [P] Create src/types/devcard.ts with DevCard, DevCardUpdate, and Theme types
- [x] T017 [P] Create src/types/github.ts with GitHubProfile, GitHubRepo, GitHubStats types
- [x] T018 [P] Create src/types/analytics.ts with AnalyticsEvent and AnalyticsSummary types

### Core Authentication Setup ✓ COMPLETE

- [x] T019 Update src/auth.ts to add GitHub OAuth provider configuration with required scopes (read:user, user:email, public_repo)
- [x] T020 Add GitHub OAuth callback handlers in src/auth.ts for DevCard creation on sign-in
- [x] T021 Create .env.local template with required environment variables (GITHUB_ID, GITHUB_SECRET, etc.)

**Checkpoint**: ✅ Foundation complete - ALL 21 foundational tasks done! Ready for Phase 3 (User Story 1 - MVP Core)

---

## Phase 3: User Story 1 - GitHub OAuth and Instant Card Creation (Priority: P1) 🎯 MVP

**Goal**: Enable developers to connect GitHub account via OAuth and automatically generate a DevCard with profile data, stats, and shareable URL

**Independent Test**: Sign up with GitHub account and verify DevCard is automatically created with username, avatar, bio, top repositories, contribution stats, and unique URL (e.g., devius.io/username)

### GitHub Integration Library ✓ COMPLETE

- [x] T022 [P] [US1] Create src/lib/github/client.ts with Octokit client setup and token retrieval from database
- [x] T023 [P] [US1] Create src/lib/github/fetch-profile.ts to fetch GitHub user profile data
- [x] T024 [P] [US1] Create src/lib/github/fetch-repos.ts to fetch user repositories sorted by stars
- [x] T025 [P] [US1] Create src/lib/github/calculate-stats.ts to calculate total stars and contribution stats
- [x] T026 [US1] Create src/lib/github/cache.ts with Redis (Vercel KV) caching functions (getCachedProfile, setCachedProfile, invalidateCache)

### DevCard Business Logic ✓ COMPLETE

- [x] T027 [P] [US1] Create src/lib/devcard/generate.ts with createDevCard function that auto-generates card from GitHub data
- [x] T028 [P] [US1] Create src/lib/devcard/url-utils.ts with generateCardUrl function (handles username conflicts with nanoid)
- [x] T029 [US1] Update src/lib/users/onUserCreate.ts to trigger DevCard creation and GitHub sync on user signup

### Background Jobs (Inngest)

- [ ] T030 [P] [US1] Create src/lib/inngest/functions/sync-github-data.ts with syncGitHubData function triggered by github/sync.requested event
- [ ] T031 [P] [US1] Create src/lib/inngest/functions/daily-github-sync.ts with dailyGitHubSync cron job (2 AM UTC)
- [ ] T032 [US1] Update src/lib/inngest/functions/index.ts to export new Inngest functions

### API Endpoints

- [ ] T033 [P] [US1] Create src/app/api/github/sync/route.ts for POST /api/github/sync (manual GitHub data refresh)
- [ ] T034 [P] [US1] Create src/app/api/github/repos/route.ts for GET /api/github/repos (fetch user repositories)
- [ ] T035 [P] [US1] Create src/app/api/cards/[username]/route.ts for GET /api/cards/{username} (public DevCard retrieval)
- [ ] T036 [P] [US1] Create src/app/api/cards/me/route.ts for GET and PATCH /api/cards/me (authenticated user DevCard operations)

### Public DevCard Page

- [ ] T037 [US1] Create src/app/(public)/[username]/page.tsx with public DevCard display page (ISR with 1-hour revalidation)
- [ ] T038 [P] [US1] Create src/components/devcard/card-preview.tsx component with card layout and GitHub data display
- [ ] T039 [P] [US1] Create src/components/devcard/profile-section.tsx component for avatar, name, bio section
- [ ] T040 [P] [US1] Create src/components/devcard/repo-showcase.tsx component to display featured repositories
- [ ] T041 [P] [US1] Create src/components/devcard/stats-display.tsx component for GitHub statistics display
- [ ] T042 [US1] Implement edge runtime and caching headers in [username]/page.tsx (Cache-Control: public, s-maxage=3600)

### Dashboard & OAuth Flow

- [ ] T043 [US1] Create src/app/(in-app)/app/dashboard/page.tsx with user dashboard showing DevCard preview and shareable URL
- [ ] T044 [US1] Update existing sign-in page to add "Connect with GitHub" button with NextAuth.js GitHub provider

**Checkpoint**: At this point, User Story 1 should be fully functional - users can sign up with GitHub, auto-generate DevCard, and view it via public URL

---

## Phase 4: User Story 2 - Card Sharing and Networking (Priority: P1) 🎯 MVP

**Goal**: Enable users to share DevCard through multiple channels (QR code, wallet pass, link copy, social media)

**Independent Test**: Create card and verify all sharing methods work - QR code displays, wallet pass downloads, link copies, social media share buttons function

### Sharing Utilities

- [ ] T045 [P] [US2] Create src/lib/sharing/qr-generator.ts with generateCardQR function using qrcode library (server-side, 400px, base64 data URL)
- [ ] T046 [P] [US2] Create src/lib/sharing/wallet-pass.ts with generateApplePass and generateGooglePass functions using passkit-generator
- [ ] T047 [P] [US2] Create src/lib/sharing/share-links.ts with functions to generate Twitter, LinkedIn, email share URLs

### API Endpoints

- [ ] T048 [P] [US2] Create src/app/api/share/qr/[username]/route.ts for GET /api/share/qr/{username} (QR code generation with caching)
- [ ] T049 [P] [US2] Create src/app/api/share/wallet-pass/[username]/route.ts for GET /api/share/wallet-pass/{username}?platform=apple|google
- [ ] T050 [US2] Add QR code caching to Vercel KV with 7-day TTL in qr-generator.ts

### Sharing UI Components

- [ ] T051 [P] [US2] Create src/components/sharing/qr-code.tsx component to display generated QR code
- [ ] T052 [P] [US2] Create src/components/sharing/wallet-pass-button.tsx component with Apple Wallet and Google Pay download buttons
- [ ] T053 [P] [US2] Create src/components/sharing/share-modal.tsx modal component with all sharing options (QR, wallet, copy link, social)
- [ ] T054 [US2] Add "Share" button to DevCard public page ([username]/page.tsx) that opens share modal
- [ ] T055 [US2] Add "Share" button to user dashboard (dashboard/page.tsx) for authenticated users

### Wallet Pass Setup

- [ ] T056 [US2] Create wallet pass certificates directory structure (.specify/certificates/pass-model/)
- [ ] T057 [US2] Add environment variables for Apple Wallet certificates (APPLE_WWDR_CERT, APPLE_SIGNER_CERT, APPLE_SIGNER_KEY, APPLE_KEY_PASSPHRASE)
- [ ] T058 [US2] Add environment variables for Google Wallet (GOOGLE_ISSUER_ID, GOOGLE_SERVICE_KEY)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - MVP complete with card creation and full sharing capabilities

---

## Phase 5: User Story 3 - Profile Customization (Priority: P2)

**Goal**: Enable users to customize DevCard beyond GitHub data - custom bio, social links, featured repos, tech stack, availability status

**Independent Test**: Access card editor, modify all customization fields, save changes, verify public card displays custom data correctly

### DevCard Customization Logic

- [ ] T059 [P] [US3] Create src/lib/devcard/customize.ts with validation functions for custom bio (500 char max), featured repos (6 max), tech stack (20 max)
- [ ] T060 [P] [US3] Create server action for updating DevCard in src/app/api/cards/me/route.ts (PATCH handler already created in T036, extend with validation)

### Card Editor UI

- [ ] T061 [US3] Create src/app/(in-app)/app/card/edit/page.tsx with DevCard editor page
- [ ] T062 [P] [US3] Create src/components/devcard/card-editor.tsx component with form for all customizable fields
- [ ] T063 [P] [US3] Add custom bio text area with 500-character counter in card-editor.tsx
- [ ] T064 [P] [US3] Add social links input fields (Twitter, LinkedIn, website, portfolio) in card-editor.tsx
- [ ] T065 [P] [US3] Add featured repositories selector (max 6) from user's GitHub repos in card-editor.tsx
- [ ] T066 [P] [US3] Add tech stack multi-select with predefined technology list in card-editor.tsx
- [ ] T067 [P] [US3] Add availability status toggle (Open to opportunities, Available for collaboration, Not available, Custom message) in card-editor.tsx
- [ ] T068 [US3] Implement form validation and error handling with React Hook Form and Zod in card-editor.tsx
- [ ] T069 [US3] Add real-time preview pane in card editor showing changes before saving

### Premium Features (Custom Domain & Themes)

- [ ] T070 [P] [US3] Add custom domain configuration UI in src/app/(in-app)/app/settings/domain/page.tsx (premium only)
- [ ] T071 [P] [US3] Add theme customization UI in src/app/(in-app)/app/settings/theme/page.tsx (premium only)
- [ ] T072 [US3] Implement DNS verification logic for custom domains in src/lib/devcard/domain-verification.ts
- [ ] T073 [US3] Update public card page to support custom domain routing and theme application

**Checkpoint**: Profile customization complete - users can fully personalize their DevCards beyond GitHub data

---

## Phase 6: User Story 4 - Connection Management (Priority: P2)

**Goal**: Enable users to send connection requests, accept/decline requests, view network, and manage connections

**Independent Test**: Create two test accounts, send connection request, accept/decline it, verify both users appear in "My Network", test rate limiting (20 requests/hour)

### Connection Business Logic

- [ ] T074 [P] [US4] Create src/lib/connections/requests.ts with sendConnectionRequest, acceptRequest, declineRequest, blockUser functions
- [ ] T075 [P] [US4] Create src/lib/connections/rate-limit.ts with checkConnectionRateLimit function using Upstash Rate Limit (20/hour sliding window)
- [ ] T076 [P] [US4] Create src/lib/connections/notifications.ts with createConnectionNotification and sendConnectionEmail functions

### API Endpoints

- [ ] T077 [P] [US4] Create src/app/api/connections/requests/route.ts for POST /api/connections/requests (send request) and GET (list requests)
- [ ] T078 [P] [US4] Create src/app/api/connections/requests/[requesterId]/route.ts for PATCH (accept/decline/block)
- [ ] T079 [P] [US4] Create src/app/api/connections/route.ts for GET /api/connections (list accepted connections)
- [ ] T080 [P] [US4] Create src/app/api/connections/[userId]/route.ts for DELETE (remove connection)

### Networking UI Components

- [ ] T081 [US4] Create src/app/(in-app)/app/network/page.tsx with network dashboard showing connections list
- [ ] T082 [US4] Create src/app/(in-app)/app/network/requests/page.tsx for pending connection requests
- [ ] T083 [P] [US4] Create src/components/network/connection-request.tsx component for displaying/responding to requests
- [ ] T084 [P] [US4] Create src/components/network/connections-list.tsx component for displaying accepted connections
- [ ] T085 [P] [US4] Create src/components/network/user-card-mini.tsx mini card component for network list display
- [ ] T086 [US4] Add "Connect" button to public DevCard page ([username]/page.tsx) for authenticated users
- [ ] T087 [US4] Implement rate limit UI feedback (show remaining requests, cooldown timer)

### Email Templates

- [ ] T088 [P] [US4] Create src/emails/connection-request.tsx React Email template for connection request notifications
- [ ] T089 [P] [US4] Create src/emails/connection-accepted.tsx React Email template for accepted connection notifications
- [ ] T090 [US4] Integrate email sending in src/lib/connections/notifications.ts using AWS SES

**Checkpoint**: Connection management complete - users can build their developer network through DevCard

---

## Phase 7: User Story 5 - Analytics Dashboard (Priority: P3)

**Goal**: Show users DevCard performance metrics - views, shares, QR scans, connection requests with visualizations

**Independent Test**: Generate card activity (views, shares, scans), access analytics dashboard, verify metrics display accurately with charts and geographic breakdown

### Analytics Tracking

- [ ] T091 [P] [US5] Create src/lib/analytics/track.ts with trackCardView, trackQRScan, trackShare, trackConnectionRequest functions (privacy-first, hashed visitor IDs)
- [ ] T092 [P] [US5] Create src/lib/analytics/privacy.ts with hashVisitorId function (SHA-256 + salt)
- [ ] T093 [P] [US5] Create src/lib/analytics/aggregate.ts with aggregateDailyMetrics function for analytics_daily table

### Background Jobs

- [ ] T094 [P] [US5] Create src/lib/inngest/functions/aggregate-analytics.ts with daily aggregation job (cron: 0 2 * * *)
- [ ] T095 [P] [US5] Create src/lib/inngest/functions/cleanup-analytics.ts with cleanup job for events older than 90 days
- [ ] T096 [US5] Update src/lib/inngest/functions/index.ts to export analytics functions

### API Endpoints

- [ ] T097 [P] [US5] Create src/app/api/analytics/me/route.ts for GET /api/analytics/me (user's analytics with date range and granularity params)
- [ ] T098 [P] [US5] Create src/app/api/analytics/track/route.ts for POST /api/analytics/track (internal event tracking endpoint)
- [ ] T099 [US5] Integrate analytics tracking into public card page views, QR code generation, and share actions

### Analytics Dashboard UI

- [ ] T100 [US5] Create src/app/(in-app)/app/analytics/page.tsx with analytics dashboard page
- [ ] T101 [P] [US5] Create src/components/analytics/dashboard.tsx component with metrics overview (total views, unique visitors, scans, shares)
- [ ] T102 [P] [US5] Create src/components/analytics/metrics-chart.tsx component with time-series chart using Recharts
- [ ] T103 [P] [US5] Add geographic breakdown visualization (countries) in dashboard.tsx
- [ ] T104 [P] [US5] Add referrer sources breakdown in dashboard.tsx
- [ ] T105 [P] [US5] Add date range selector (last 7/30/90 days, custom range) in analytics page
- [ ] T106 [US5] Implement premium-only detailed analytics (city-level geo, full referrer breakdown) with feature flag

**Checkpoint**: Analytics complete - users can track DevCard performance and engagement

---

## Phase 8: User Story 6 - Premium Features and Monetization (Priority: P3)

**Goal**: Enable premium subscriptions with Stripe, unlock custom themes, advanced analytics, organization profiles, custom domains

**Independent Test**: Subscribe to premium via Stripe, verify premium features unlock (themes, domains, advanced analytics), confirm billing processes correctly, test subscription expiration and downgrade

### Stripe Integration

- [ ] T107 [P] [US6] Create src/lib/stripe/client.ts with Stripe client initialization
- [ ] T108 [P] [US6] Create src/lib/stripe/subscriptions.ts with createSubscription, cancelSubscription, updateSubscription functions
- [ ] T109 [P] [US6] Create src/lib/stripe/webhooks.ts with webhook handler functions for subscription events

### API Endpoints

- [ ] T110 [P] [US6] Create src/app/api/billing/checkout/route.ts for POST /api/billing/checkout (create Stripe checkout session)
- [ ] T111 [P] [US6] Create src/app/api/billing/portal/route.ts for POST /api/billing/portal (customer portal redirect)
- [ ] T112 [P] [US6] Update src/app/api/webhooks/stripe/route.ts to handle DevCard subscription webhooks (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted)

### Premium Features UI

- [ ] T113 [US6] Create src/app/(in-app)/app/billing/page.tsx with subscription management page
- [ ] T114 [US6] Create src/app/(in-app)/app/billing/plans/page.tsx with pricing page showing monthly/annual options
- [ ] T115 [P] [US6] Add premium badge to DevCard for premium users in src/components/devcard/card-preview.tsx
- [ ] T116 [P] [US6] Implement feature gating middleware in src/lib/premium/check-premium.ts
- [ ] T117 [US6] Add "Upgrade to Premium" prompts in theme settings, domain settings, and analytics pages

### Organization Profiles (Premium)

- [ ] T118 [P] [US6] Extend src/db/schema/devcard.ts with organization_profile jsonb field (team members, company info)
- [ ] T119 [P] [US6] Create src/app/(in-app)/app/organization/page.tsx for organization profile management (premium only)
- [ ] T120 [US6] Generate and apply database migration for organization profile field

### Subscription Management Jobs

- [ ] T121 [P] [US6] Create src/lib/inngest/functions/check-subscription-expiry.ts with daily job to check expiring subscriptions
- [ ] T122 [P] [US6] Create src/emails/premium-reminder.tsx React Email template for renewal reminders (7 days before)
- [ ] T123 [US6] Update src/lib/inngest/functions/index.ts to export subscription functions

**Checkpoint**: Premium features complete - full monetization flow with Stripe, premium features unlocked for subscribers

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

### Error Handling & Edge Cases

- [ ] T124 [P] Implement fallback UI for GitHub API failures in all components (display cached data with "Last updated" notice)
- [ ] T125 [P] Add error boundary components in src/components/error-boundary.tsx for graceful error handling
- [ ] T126 [P] Implement minimal GitHub activity handling (adapt card layout when user has <5 repos)
- [ ] T127 [P] Add wallet pass generation fallback (QR code download if pass fails)

### Performance Optimization

- [ ] T128 [P] Add database indexes per data-model.md Priority 1 (idx_devcards_url_slug, idx_devcards_user_id, etc.)
- [ ] T129 [P] Implement static generation for top 1000 cards at build time using generateStaticParams
- [ ] T130 [P] Add Next.js Image optimization for all avatar and repository images
- [ ] T131 [P] Implement edge runtime for public card pages where possible

### Security & Compliance

- [ ] T132 [P] Implement GDPR data export endpoint in src/app/api/user/export/route.ts
- [ ] T133 [P] Implement account deletion endpoint in src/app/api/user/delete/route.ts with CASCADE cleanup
- [ ] T134 [P] Add CSRF protection for all mutation endpoints
- [ ] T135 [P] Implement webhook signature verification for GitHub webhooks (HMAC SHA-256)

### Documentation & Developer Experience

- [ ] T136 [P] Create API documentation page in src/app/(website-layout)/docs/api/page.tsx using OpenAPI spec
- [ ] T137 [P] Add inline code comments and JSDoc annotations to all lib/ utilities
- [ ] T138 [P] Create example .env.local file with all required variables
- [ ] T139 Validate quickstart.md setup instructions work end-to-end

### Monitoring & Observability

- [ ] T140 [P] Add structured logging to all API routes and background jobs
- [ ] T141 [P] Set up error tracking integration (Sentry or similar)
- [ ] T142 [P] Add performance monitoring for slow API routes
- [ ] T143 [P] Create health check endpoint in src/app/api/health/route.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - Independent
  - User Story 2 (P1): Can start after Foundational - Independent (integrates with US1 but independently testable)
  - User Story 3 (P2): Can start after Foundational - Independent
  - User Story 4 (P2): Can start after Foundational - Independent
  - User Story 5 (P3): Can start after Foundational - Independent (tracks US1 & US2 events)
  - User Story 6 (P3): Can start after Foundational - Independent
- **Polish (Phase 9)**: Depends on completion of desired user stories

### User Story Completion Order (Recommended)

For solo developer or sequential delivery:
1. Setup + Foundational → Foundation ready
2. User Story 1 (P1) → Test independently → **MVP v0.1!**
3. User Story 2 (P1) → Test independently → **MVP v1.0!** (Full core features)
4. User Story 3 (P2) → Test independently → v1.1 (Enhanced personalization)
5. User Story 4 (P2) → Test independently → v1.2 (Networking)
6. User Story 5 (P3) → Test independently → v1.3 (Analytics)
7. User Story 6 (P3) → Test independently → v2.0 (Premium/Monetization)
8. Polish → Production ready

### Parallel Opportunities

**Within Setup (Phase 1)**: All tasks marked [P] (T001-T006) can run in parallel

**Within Foundational (Phase 2)**:
- Database schema files (T008-T012) can run in parallel
- TypeScript types (T016-T018) can run in parallel after schema
- T007, T013 must complete before T014 migration generation

**Across User Stories (Phases 3-8)**: If team has multiple developers:
- Once Foundational completes, ALL user stories can be worked on in parallel
- Different stories touch different files, minimal conflicts
- Example: Dev A on US1, Dev B on US2, Dev C on US3 simultaneously

**Within Each User Story**: Tasks marked [P] can run in parallel:
- US1: GitHub lib files (T022-T025), API routes (T033-T036), UI components (T038-T041) can parallelize
- US2: Sharing utils (T045-T047), API routes (T048-T049), UI components (T051-T053) can parallelize
- Similar pattern for all user stories

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these US1 tasks in parallel:

# GitHub library (all parallel):
Task T022: "Create src/lib/github/client.ts"
Task T023: "Create src/lib/github/fetch-profile.ts"
Task T024: "Create src/lib/github/fetch-repos.ts"
Task T025: "Create src/lib/github/calculate-stats.ts"

# DevCard library (all parallel):
Task T027: "Create src/lib/devcard/generate.ts"
Task T028: "Create src/lib/devcard/url-utils.ts"

# Inngest jobs (all parallel):
Task T030: "Create sync-github-data.ts"
Task T031: "Create daily-github-sync.ts"

# API routes (all parallel):
Task T033: "Create api/github/sync/route.ts"
Task T034: "Create api/github/repos/route.ts"
Task T035: "Create api/cards/[username]/route.ts"
Task T036: "Create api/cards/me/route.ts"

# UI components (all parallel):
Task T038: "Create card-preview.tsx"
Task T039: "Create profile-section.tsx"
Task T040: "Create repo-showcase.tsx"
Task T041: "Create stats-display.tsx"

# Sequential dependencies:
Task T026: Depends on T022-T025 (needs client first)
Task T029: Depends on T027 (needs generate function)
Task T032: Depends on T030-T031 (export jobs)
Task T037: Depends on T038-T041 (needs components)
Task T042: Depends on T037 (optimize page)
Task T043: Depends on T037 (needs card preview)
Task T044: Can run anytime in US1
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only) - Recommended Start

**Goal**: Ship working product with core value ASAP

1. ✅ Complete Phase 1: Setup (6 tasks)
2. ✅ Complete Phase 2: Foundational (15 tasks) - **CRITICAL BLOCKER**
3. ✅ Complete Phase 3: User Story 1 (23 tasks) - **MVP v0.1**
4. ✅ Complete Phase 4: User Story 2 (14 tasks) - **MVP v1.0**
5. **STOP and VALIDATE**:
   - Test end-to-end user journey
   - GitHub OAuth → Card creation → View card → Share via QR/wallet/link
   - Deploy to staging/production
   - Gather user feedback

**Total MVP tasks**: 58 tasks (Setup + Foundational + US1 + US2)

### Incremental Delivery (Recommended Full Roadmap)

1. Foundation: Setup + Foundational → 21 tasks → **Foundation ready**
2. Add US1 → 23 tasks → Test independently → **MVP v0.1** (Auth + Card)
3. Add US2 → 14 tasks → Test independently → **MVP v1.0** (Full core product)
4. Add US3 → 15 tasks → Test independently → **v1.1** (Customization)
5. Add US4 → 17 tasks → Test independently → **v1.2** (Networking)
6. Add US5 → 16 tasks → Test independently → **v1.3** (Analytics)
7. Add US6 → 17 tasks → Test independently → **v2.0** (Premium)
8. Polish → 20 tasks → **Production ready**

**Total tasks**: 143 tasks

### Parallel Team Strategy (3-4 Developers)

**Week 1-2**: Team completes Setup + Foundational together (21 tasks)

**Week 3-4**: After Foundational complete, split:
- **Dev A**: User Story 1 (23 tasks) - Core card generation
- **Dev B**: User Story 2 (14 tasks) - Sharing features
- **Dev C**: User Story 3 (15 tasks) - Customization
- **Dev D**: User Story 4 (17 tasks) - Connections

**Week 5**: Integration testing, MVP v1.0 deployment

**Week 6-7**: Continue with US5, US6, and Polish in parallel

---

## Task Count Summary

| Phase | User Story | Priority | Task Count | Parallel Tasks |
|-------|------------|----------|------------|----------------|
| Phase 1 | Setup | - | 6 | 6 (100%) |
| Phase 2 | Foundational | - | 15 | 9 (60%) |
| Phase 3 | US1: GitHub OAuth & Card Creation | P1 | 23 | 15 (65%) |
| Phase 4 | US2: Card Sharing | P1 | 14 | 10 (71%) |
| Phase 5 | US3: Profile Customization | P2 | 15 | 10 (67%) |
| Phase 6 | US4: Connection Management | P2 | 17 | 9 (53%) |
| Phase 7 | US5: Analytics Dashboard | P3 | 16 | 10 (63%) |
| Phase 8 | US6: Premium Features | P3 | 17 | 10 (59%) |
| Phase 9 | Polish | - | 20 | 18 (90%) |
| **TOTAL** | - | - | **143** | **97 (68%)** |

**MVP (US1 + US2)**: 58 tasks (40% of total)
**V1 Feature Complete (US1-4)**: 95 tasks (66% of total)
**V2 Premium Ready (US1-6)**: 123 tasks (86% of total)

---

## Notes

- **[P] marker**: Tasks that can run in parallel (different files, no blocking dependencies)
- **[Story] label**: Maps task to specific user story for traceability and independent testing
- **Checkpoint strategy**: Stop after each user story phase to validate independently before continuing
- **Recommended start**: MVP (US1 + US2) = 58 tasks = complete core product with full value
- **Tests excluded**: Specification doesn't explicitly request TDD, so test tasks omitted for faster delivery
- **68% parallelizable**: With 2-4 developers, significant speedup possible
- **Commit strategy**: Commit after completing each task or logical group of related tasks
- **Migration strategy**: Generate migration after all schema files created (T014), apply before any API/lib work

---

## Environment Setup Checklist

Before starting implementation, ensure:

- [ ] PostgreSQL database created (Neon recommended)
- [ ] GitHub OAuth app created with callback URL configured
- [ ] Stripe account set up with test API keys
- [ ] Vercel KV (Redis) configured
- [ ] AWS S3 bucket created for assets
- [ ] AWS SES configured for email sending
- [ ] Inngest project created
- [ ] All environment variables in .env.local (21 required variables per quickstart.md)
- [ ] Apple Developer account for wallet pass certificates (optional, for US2)
- [ ] Google Cloud project for Google Pay (optional, for US2)

See `specs/001-devcard-platform/quickstart.md` for detailed setup instructions.
