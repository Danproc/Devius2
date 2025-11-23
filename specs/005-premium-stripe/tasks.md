# Tasks: StackPass Premium Membership System

**Input**: Design documents from `/specs/005-premium-stripe/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are excluded to focus on implementation and leverage existing Vitest/Playwright infrastructure for manual testing.

**Organization**: Tasks are grouped by user story (P1 → P4) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Path Conventions

- **Root**: Next.js monolithic app at repository root
- **Source**: `src/` (app routes, lib, db, emails)
- **Database**: `src/db/schema/`
- **API Routes**: `src/app/api/`
- **UI Pages**: `src/app/(in-app)/app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration and Stripe product setup

- [x] T001 Update environment variables in `.env.local` with Stripe API keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
- [x] T002 Create premium products in Stripe Dashboard (Premium, Premium Pro) and document price IDs
- [x] T003 [P] Configure Stripe webhook endpoint in Stripe Dashboard for local development (use Stripe CLI)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema migration and core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add `premium_tier` field to users schema in `src/db/schema/user.ts` (nullable text, references plans.tier_code)
- [x] T005 [P] Add `tier_code` and `active` fields to plans schema in `src/db/schema/plans.ts`
- [x] T006 [P] Create subscription_events table schema in `src/db/schema/subscription-events.ts`
- [x] T007 Generate Drizzle migration script for schema changes (`pnpm drizzle-kit generate`)
- [x] T008 Apply database migration (`pnpm drizzle-kit push`)
- [x] T009 Create database indexes for premium queries (created script in drizzle/0007_add_premium_indexes.sql and scripts/create-premium-indexes.ts)
- [x] T010 [P] Seed premium tiers in database (Premium: $9/mo, Premium Pro: $29/mo) with placeholder Stripe price IDs
- [x] T011 [P] Create tier management utility in `src/lib/premium/tiers.ts` for fetching active premium tiers
- [x] T012 Consolidate premium access checking logic in `src/lib/premium/check-premium.ts` (checkPremium, hasFeatureAccess, requirePremium)

**Checkpoint**: Foundation ready - database schema updated, utilities created, user story implementation can begin in parallel

---

## Phase 3: User Story 1 - Subscribe to Premium (Priority: P1) 🎯 MVP

**Goal**: Enable free users to subscribe to premium tiers via Stripe checkout and immediately gain premium access

**Independent Test**: Create test account → Navigate to /app/billing/plans → Click "Subscribe" → Complete Stripe checkout with test card (4242 4242 4242 4242) → Verify premium status in database and dashboard

### Implementation for User Story 1

- [x] T013 [P] [US1] Create dynamic pricing page in `src/app/(in-app)/app/billing/plans/page.tsx` that fetches tiers from database
- [x] T014 [P] [US1] Create pricing API endpoint in `src/app/api/pricing/tiers/route.ts` to return active premium tiers with pricing
- [x] T015 [US1] Update billing checkout API in `src/app/api/billing/checkout/route.ts` to create Stripe sessions with tier-based pricing
- [x] T016 [US1] Simplify Stripe webhook handler in `src/app/api/webhooks/stripe/route.ts` (remove legacy plan management code)
- [x] T017 [US1] Implement handleCheckoutCompleted webhook handler in `src/lib/stripe/webhooks.ts` to upgrade user to premium
- [x] T018 [US1] Update subscription management functions in `src/lib/stripe/subscriptions.ts` for tier-based logic
- [x] T019 [P] [US1] Create PremiumWelcomeEmail template in `src/emails/PremiumWelcomeEmail.tsx`
- [x] T020 [US1] Add welcome email trigger in checkout webhook handler

**Checkpoint**: At this point, users can subscribe to premium and immediately access premium features (MVP complete!)

---

## Phase 4: User Story 4 - Dynamic Pricing Administration (Priority: P2)

**Goal**: Enable administrators to manage tier pricing in database without code deployments

**Independent Test**: Update a tier's monthly price in database → Reload pricing page → Verify new price displays → Create subscription with updated price

**Note**: Implementing US4 before US2 because pricing infrastructure benefits subscription management

### Implementation for User Story 4

- [ ] T021 [P] [US4] Add admin validation to ensure tier has both monthly and annual Stripe price IDs before marking active
- [ ] T022 [US4] Update pricing page from US1 to display database-driven tiers with real-time pricing (already done in T013, verify functionality)
- [ ] T023 [P] [US4] Document Stripe price ID update process in `specs/005-premium-stripe/quickstart.md` (admin workflow section)

**Checkpoint**: Administrators can update tier pricing in database and it reflects immediately on pricing page

---

## Phase 5: User Story 2 - Manage Existing Subscription (Priority: P2)

**Goal**: Enable premium subscribers to view subscription details, upgrade/downgrade tiers, and manage payment methods

**Independent Test**: Login as premium user → Navigate to /app/billing → View subscription details → Click "Manage Subscription" → Verify Stripe Customer Portal access → Test upgrade/downgrade/cancel flows

### Implementation for User Story 2

- [ ] T024 [US2] Update billing dashboard in `src/app/(in-app)/app/billing/page.tsx` to display current tier, billing date, and payment method
- [ ] T025 [P] [US2] Create subscription details API in `src/app/api/billing/subscription/route.ts` to fetch Stripe subscription data
- [ ] T026 [P] [US2] Create invoice history component in `src/components/billing/InvoiceHistory.tsx` that fetches from Stripe
- [ ] T027 [US2] Add expiry warning indicator to billing dashboard (shows when <7 days until expiration)
- [ ] T028 [US2] Implement tier upgrade function in `src/lib/stripe/subscriptions.ts` with proration logic
- [ ] T029 [US2] Implement tier downgrade scheduling in `src/lib/stripe/subscriptions.ts` (effective next billing cycle)
- [ ] T030 [US2] Add handleSubscriptionUpdated webhook handler in `src/lib/stripe/webhooks.ts` for tier changes
- [ ] T031 [US2] Add handleSubscriptionDeleted webhook handler in `src/lib/stripe/webhooks.ts` for cancellations
- [ ] T032 [P] [US2] Verify Stripe Customer Portal redirect in `src/app/api/billing/portal/route.ts` (already exists, test functionality)

**Checkpoint**: Premium users can view subscription details, upgrade/downgrade tiers, and manage billing through Stripe Customer Portal

---

## Phase 6: User Story 3 - Receive Subscription Notifications (Priority: P3)

**Goal**: Send automated email notifications for subscription lifecycle events (payment failures, expiry warnings, cancellations)

**Independent Test**: Trigger subscription events via Stripe CLI → Verify correct email template sent → Check email content accuracy

### Implementation for User Story 3

- [ ] T033 [P] [US3] Create PaymentFailedEmail template in `src/emails/PaymentFailedEmail.tsx`
- [ ] T034 [P] [US3] Create SubscriptionCancelledEmail template in `src/emails/SubscriptionCancelledEmail.tsx`
- [ ] T035 [P] [US3] Update PremiumReminderEmail template in `src/emails/PremiumReminderEmail.tsx` for tier structure
- [ ] T036 [US3] Add handleInvoicePaymentFailed webhook handler in `src/lib/stripe/webhooks.ts` to send payment failed email
- [ ] T037 [US3] Add cancellation email trigger in handleSubscriptionDeleted webhook handler (from T031)
- [ ] T038 [US3] Update Inngest expiry checker in `src/inngest/functions/check-subscription-expiry.ts` to query by premium_tier
- [ ] T039 [P] [US3] Verify expiry reminder emails send at 7, 3, and 1 day intervals (test via database manipulation)

**Checkpoint**: All subscription lifecycle emails are functional and sending correctly

---

## Phase 7: Code Cleanup & Migration

**Purpose**: Remove legacy payment providers and plan management code to reduce complexity

- [ ] T040 [P] Remove Dodo Payments integration: delete `src/lib/dodopayments/` directory
- [ ] T041 [P] Remove PayPal integration: delete `src/app/api/webhooks/paypal/route.ts`
- [ ] T042 [P] Remove LemonSqueezy integration: delete `src/lib/lemonsqueezy/` directory
- [ ] T043 [P] Delete legacy plan management functions in `src/lib/plans/` directory
- [ ] T044 [P] Remove unused payment provider fields from database schema (lemonSqueezyCustomerId, dodoCustomerId, paypalContext table)
- [ ] T045 Remove planId field from users schema in `src/db/schema/user.ts`
- [ ] T046 Generate and apply migration for planId removal
- [ ] T047 [P] Remove dodopayments, @aws-sdk/client-ses from package.json dependencies
- [ ] T048 Update CLAUDE.md to reflect simplified premium-only architecture

---

## Phase 8: Polish & Validation

**Purpose**: Final testing, documentation, and production readiness

- [ ] T049 [P] Test complete subscription flow with Stripe test mode (checkout → webhook → premium activation)
- [ ] T050 [P] Test all webhook events with Stripe CLI (checkout.session.completed, subscription.updated, subscription.deleted, invoice.payment_succeeded, invoice.payment_failed)
- [ ] T051 [P] Test email delivery for all templates via Resend test mode
- [ ] T052 [P] Validate premium feature gates prevent access for expired/free users
- [ ] T053 [P] Test tier upgrade with proration and immediate feature access
- [ ] T054 [P] Test tier downgrade scheduling for next billing cycle
- [ ] T055 [P] Verify invoice history displays in billing dashboard
- [ ] T056 [P] Test Stripe Customer Portal access and payment method updates
- [ ] T057 Run quickstart.md validation (follow setup guide step-by-step)
- [ ] T058 [P] Update `.env.example` with all required Stripe environment variables
- [ ] T059 [P] Document production deployment checklist in `specs/005-premium-stripe/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3 - P1)**: Depends on Foundational (Phase 2) - MVP priority
- **User Story 4 (Phase 4 - P2)**: Depends on Foundational (Phase 2) - Pricing admin
- **User Story 2 (Phase 5 - P2)**: Depends on Foundational (Phase 2) + User Story 1 (checkout flow needed to test)
- **User Story 3 (Phase 6 - P3)**: Depends on Foundational (Phase 2) + User Stories 1 & 2 (subscription events needed)
- **Code Cleanup (Phase 7)**: Can run after User Story 1 is complete, before or in parallel with US2/US3
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Subscribe to Premium)**: Independent - no dependencies on other stories
- **User Story 4 (P2 - Dynamic Pricing)**: Independent - extends pricing page from US1 but not blocking
- **User Story 2 (P2 - Manage Subscription)**: Requires US1 (users must be able to subscribe first)
- **User Story 3 (P3 - Notifications)**: Requires US1 & US2 (subscription events must exist)

### Within Each User Story

- Database schema tasks (T004-T012) must complete before any implementation tasks
- Webhook handlers depend on email templates being created first
- API endpoints can be built in parallel with UI pages
- Testing tasks can run in parallel after implementation complete

### Parallel Opportunities

**Setup Phase**:
- T001, T002, T003 can all run in parallel

**Foundational Phase**:
- T005, T006, T011, T012 can run in parallel (different files)
- T007 depends on T004-T006 completing
- T009, T010 can run in parallel after T008

**User Story 1**:
- T013, T014, T019 can run in parallel (different files)
- T015 depends on T014 (pricing API needed for checkout)
- T016-T018 are sequential (modifying same webhook file)

**User Story 2**:
- T025, T026, T032 can run in parallel (different files)
- T028, T029 can run in parallel (different functions in same file)

**User Story 3**:
- T033, T034, T035 can run in parallel (different email templates)

**Code Cleanup**:
- T040, T041, T042, T043, T044, T047, T048 can all run in parallel

**Polish**:
- T049-T056, T058, T059 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task T013: "Create dynamic pricing page in src/app/(in-app)/app/billing/plans/page.tsx"
Task T014: "Create pricing API endpoint in src/app/api/pricing/tiers/route.ts"
Task T019: "Create PremiumWelcomeEmail template in src/emails/PremiumWelcomeEmail.tsx"

# Then run sequential tasks:
Task T015: "Update billing checkout API" (depends on T014)
Task T016-T018: "Webhook handler updates" (sequential in same file)
Task T020: "Add welcome email trigger" (depends on T019)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (T001-T003)
2. ✅ Complete Phase 2: Foundational (T004-T012) **CRITICAL - blocks all stories**
3. ✅ Complete Phase 3: User Story 1 (T013-T020)
4. **STOP and VALIDATE**: Test subscription flow end-to-end independently
5. Deploy MVP: Users can now subscribe to premium!

### Incremental Delivery

1. Foundation (Setup + Foundational) → Database and infrastructure ready
2. **MVP: User Story 1** → Users can subscribe → **Deploy to production!**
3. Add User Story 4 → Admins can manage pricing → Deploy
4. Add User Story 2 → Users can manage subscriptions → Deploy
5. Add User Story 3 → Email notifications complete → Deploy
6. Code Cleanup → Simplified codebase → Deploy

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

1. **Developer A**: User Story 1 (P1 - Critical path to MVP)
2. **Developer B**: User Story 4 (P2 - Pricing admin, no dependencies)
3. **Developer C**: Code Cleanup (Phase 7 - Can start early, removes unused code)

After User Story 1 completes:
- **Developer A**: User Story 2 (depends on US1)
- **Developer B**: User Story 3 (notification templates)

---

## Task Summary

**Total Tasks**: 59
- **Setup**: 3 tasks
- **Foundational**: 9 tasks (BLOCKING)
- **User Story 1 (P1)**: 8 tasks (MVP)
- **User Story 4 (P2)**: 3 tasks
- **User Story 2 (P2)**: 9 tasks
- **User Story 3 (P3)**: 7 tasks
- **Code Cleanup**: 9 tasks
- **Polish**: 11 tasks

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel with others
**Independent User Stories**: US1 and US4 are fully independent; US2 requires US1; US3 requires US1+US2

**MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = 20 tasks
**Full Feature**: All 59 tasks

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ All user story tasks include [US#] label for traceability
✅ All tasks include specific file paths
✅ Sequential task IDs (T001-T059)
✅ Parallel opportunities clearly marked with [P]
✅ Phases organized by user story priority (P1 → P2 → P3)
✅ Each user story has independent test criteria
✅ MVP scope clearly defined (User Story 1)

---

## Notes

- All tasks are implementation-focused (no test tasks as not requested in spec)
- Manual testing will leverage existing Vitest/Playwright infrastructure
- Each user story deliverable is independently testable per spec requirements
- Stripe CLI required for local webhook testing (documented in quickstart.md)
- Database migrations use Drizzle kit (already configured)
- Email templates use React Email with Resend (already configured)
- Commit after each task or logical group for incremental progress
