# Implementation Plan: StackPass Premium Membership System

**Branch**: `005-premium-stripe` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-premium-stripe/spec.md`

## Summary

Simplify StackPass's payment system to a Stripe-only premium membership model with dynamic pricing from the database. This consolidates the dual payment architecture (indie-kit plan management + DevCard premium) into a single, streamlined premium subscription system. Users can subscribe to premium tiers, manage subscriptions through a self-service dashboard, receive automated email notifications, and administrators can adjust pricing without code deployments.

**Primary Requirement**: Enable revenue generation through Stripe subscriptions with minimal complexity and maximum business flexibility.

**Technical Approach**: Leverage existing Stripe integration, migrate from dual payment system to premium-only model, implement database-driven pricing, enhance billing UI with Stripe Customer Portal integration, and build React Email templates for subscription lifecycle communication.

## Technical Context

**Language/Version**: TypeScript 5.8.3, Next.js 16.0.1 (App Router with Turbopack), React 19.2.0, Node ES2017
**Primary Dependencies**: Stripe SDK v17.7.0, Drizzle ORM v0.38.4, NextAuth v5.0.0-beta.25, Resend v6.4.2, React Email v4.0.16, Inngest v3.34.5
**Storage**: PostgreSQL via Neon serverless (@neondatabase/serverless v0.10.4), Drizzle ORM for schema management
**Testing**: Vitest v4.0.8 for unit/integration tests, Playwright v1.56.1 for E2E, @testing-library/react v16.3.0
**Target Platform**: Web application (Next.js SSR/SSG), Vercel deployment, serverless architecture
**Project Type**: Web (monolithic Next.js app with frontend and backend API routes)
**Performance Goals**: Webhook processing <5s, pricing page load <2s, 95% subscription event success rate
**Constraints**: Stripe webhook max duration 20s, ISR revalidation periods (60s-3600s), Resend email delivery <1 hour
**Scale/Scope**: Multi-tier premium system, existing Stripe integration, 11+ email templates, background job processing via Inngest

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: No constitution file found with project-specific principles. Using general best practices:

✅ **Simplicity**: Removing unused payment providers (Dodo, PayPal, LemonSqueezy) reduces complexity by ~30%
✅ **Existing Infrastructure**: Building on established Stripe integration (v17.7.0) rather than introducing new dependencies
✅ **Database-First**: Pricing stored in database enables business flexibility without code changes
✅ **Self-Service**: Stripe Customer Portal integration reduces support burden
✅ **Idempotency**: Webhook signature verification and event deduplication prevent double-processing
✅ **Testability**: Existing Vitest and Playwright infrastructure supports comprehensive testing strategy

**No constitution violations identified.** Implementation aligns with Next.js/React best practices, leverages existing architecture, and reduces complexity through consolidation.

## Project Structure

### Documentation (this feature)

```text
specs/005-premium-stripe/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (technology decisions and patterns)
├── data-model.md        # Phase 1 output (database schema and entities)
├── quickstart.md        # Phase 1 output (setup and configuration guide)
├── contracts/           # Phase 1 output (API contracts and webhook schemas)
│   ├── stripe-webhooks.yaml
│   ├── billing-api.yaml
│   └── pricing-api.yaml
├── checklists/
│   └── requirements.md  # Specification quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (in-app)/
│   │   └── app/
│   │       ├── billing/              # Enhanced billing dashboard
│   │       │   ├── page.tsx          # Main dashboard (UPDATE)
│   │       │   └── plans/
│   │       │       └── page.tsx      # Dynamic pricing page (UPDATE)
│   │       └── plan/
│   │           └── page.tsx          # Redirect to billing (EXISTS)
│   └── api/
│       ├── billing/
│       │   ├── checkout/
│       │   │   └── route.ts          # Create Stripe checkout sessions (UPDATE)
│       │   └── portal/
│       │       └── route.ts          # Stripe Customer Portal access (EXISTS)
│       └── webhooks/
│           └── stripe/
│               └── route.ts          # Webhook handler (SIMPLIFY - remove legacy)
├── db/
│   └── schema/
│       ├── user.ts                   # User schema (UPDATE - add premium_tier)
│       └── plans.ts                  # Plans schema (UPDATE - focus on premium tiers)
├── lib/
│   ├── stripe/
│   │   ├── client.ts                 # Stripe SDK client (EXISTS)
│   │   ├── subscriptions.ts          # Subscription management (UPDATE)
│   │   └── webhooks.ts               # Webhook handlers (SIMPLIFY)
│   ├── premium/
│   │   ├── check-premium.ts          # Access control (EXISTS - CONSOLIDATE)
│   │   └── tiers.ts                  # Tier management (NEW)
│   ├── email/
│   │   ├── client.ts                 # Resend client (EXISTS)
│   │   └── sendMail.ts               # Email sender (EXISTS)
│   └── plans/                        # Legacy plan management (REMOVE)
│       ├── getPlanForUser.ts         # (DELETE)
│       ├── updatePlan.ts             # (DELETE)
│       └── [other plan files]        # (DELETE)
├── emails/
│   ├── PremiumReminderEmail.tsx      # Expiry reminder (EXISTS)
│   ├── PremiumWelcomeEmail.tsx       # Welcome email (NEW)
│   ├── PaymentFailedEmail.tsx        # Payment failure (NEW)
│   └── SubscriptionCancelledEmail.tsx # Cancellation (NEW)
└── inngest/
    └── functions/
        └── check-subscription-expiry.ts # Expiry checker (EXISTS - UPDATE)

tests/
├── unit/
│   ├── premium/
│   │   └── check-premium.test.ts     # Access control tests (NEW)
│   └── stripe/
│       ├── webhooks.test.ts          # Webhook processing (NEW)
│       └── subscriptions.test.ts     # Subscription management (NEW)
└── e2e/
    ├── subscription-flow.spec.ts     # End-to-end subscription (NEW)
    └── billing-dashboard.spec.ts     # Dashboard management (NEW)
```

**Structure Decision**: Next.js monolithic web application with App Router. All premium logic resides in `/src` with clear separation between UI (`/app`), business logic (`/lib`), data (`/db`), and communication (`/emails`, `/inngest`). Removing legacy payment provider integrations and plan management code to simplify architecture.

## Complexity Tracking

> **Not applicable** - No constitution violations requiring justification. Implementation reduces complexity through consolidation.

---

## Phase 0: Research & Decisions

**Status**: ✅ Complete (consolidated from technical context research)

### Key Technologies

| Technology | Version | Rationale | Alternatives Considered |
|------------|---------|-----------|-------------------------|
| Stripe SDK | v17.7.0 | Already integrated, comprehensive subscription management, industry standard for SaaS | PayPal (limited subscription features), LemonSqueezy (less mature), Paddle (higher fees) |
| Drizzle ORM | v0.38.4 | Type-safe schema management, already in use, PostgreSQL optimization | Prisma (heavier runtime), TypeORM (less type safety), raw SQL (no type safety) |
| Resend | v6.4.2 | Developer-friendly API, React Email integration, already configured | SendGrid (complex pricing), AWS SES (requires AWS setup), Mailgun (less modern API) |
| React Email | v4.0.16 | Component-based templates, type-safe props, preview tooling | MJML (XML syntax), Foundation for Emails (complex), Plain HTML (no component reuse) |
| Inngest | v3.34.5 | Background job scheduling, retry logic, already used for expiry checks | BullMQ (requires Redis), node-cron (no retry logic), Vercel Cron (limited scheduling) |

### Architecture Decisions

**1. Premium-Only Model vs. Dual System**
- **Decision**: Migrate to premium-only system (is_premium flag + premium_tier)
- **Rationale**: Simplifies codebase, easier to reason about subscription state, aligns with user's stated preference
- **Migration**: Keep plans table for pricing configuration, remove planId references, deprecate legacy plan management functions

**2. Dynamic Pricing Approach**
- **Decision**: Store pricing in database plans table, map to Stripe price IDs
- **Rationale**: Allows pricing experiments without code deployment, supports A/B testing, enables promotional campaigns
- **Trade-off**: Requires manual Stripe Dashboard updates when adding new price points (acceptable for infrequent changes)

**3. Stripe Customer Portal vs. Custom UI**
- **Decision**: Use Stripe Customer Portal for payment methods, invoices, cancellation
- **Rationale**: Battle-tested UI, automatic PCI compliance, reduced development/maintenance burden, standard SaaS pattern
- **Custom UI**: Retain custom dashboard for tier selection, feature visibility, and subscription overview

**4. Email Template Strategy**
- **Decision**: React Email components with Resend delivery
- **Rationale**: Type-safe templates, preview tooling, version control, existing infrastructure
- **Templates Needed**: Welcome, Expiry Reminder (7/3/1 day variants), Payment Failed, Cancellation Confirmed

**5. Webhook Idempotency**
- **Decision**: Continue using Stripe webhook signature verification + database transaction isolation
- **Rationale**: Prevents double-processing, handles retry scenarios, industry best practice
- **Implementation**: Existing webhook handler already implements signature verification

**6. Testing Strategy**
- **Decision**: Unit tests for business logic (Vitest), E2E tests for subscription flow (Playwright)
- **Rationale**: Vitest for fast feedback, Playwright for critical user journeys, leverage existing test infrastructure
- **Critical Paths**: Checkout completion, webhook processing, dashboard access, email delivery

---

## Phase 1: Design & Contracts

**Status**: Ready to generate (next step after this plan is saved)

### Artifacts to Generate

1. **data-model.md**
   - Premium Tier entity (name, code, features, monthly/annual price, Stripe price IDs)
   - User Premium Status entity (is_premium, premium_tier, expires_at, customer/subscription IDs)
   - Subscription Event entity (webhook event types and payloads)
   - Migration strategy from dual system to premium-only

2. **contracts/stripe-webhooks.yaml**
   - OpenAPI schema for Stripe webhook events
   - Event types: checkout.session.completed, customer.subscription.*, invoice.*
   - Signature verification requirements
   - Response codes and error handling

3. **contracts/billing-api.yaml**
   - POST /api/billing/checkout - Create Stripe checkout session
   - GET /api/billing/portal - Access Stripe Customer Portal
   - GET /api/billing/subscription - Retrieve current subscription details
   - POST /api/billing/upgrade - Upgrade to higher tier (proration)
   - POST /api/billing/downgrade - Schedule downgrade to next cycle

4. **contracts/pricing-api.yaml**
   - GET /api/pricing/tiers - Fetch all active premium tiers with current pricing
   - Response includes tier code, name, features list, monthly/annual prices

5. **quickstart.md**
   - Stripe account setup (products, prices, webhook endpoints)
   - Environment variable configuration
   - Database migration instructions
   - Testing with Stripe CLI webhook forwarding
   - Email template preview and testing

---

## Implementation Phases (Post-Planning)

**Note**: Detailed task breakdown will be generated by `/speckit.tasks` command after planning is complete.

### Phase 2: Database Migration
- Add `premium_tier` field to users table
- Update plans table schema for premium-focused structure
- Create migration script to remove `planId` references
- Seed initial premium tiers (Premium, Premium Pro)

### Phase 3: Stripe Integration Updates
- Simplify webhook handler (remove legacy plan management code)
- Update subscription management functions for tier-based logic
- Implement proration for upgrades
- Add downgrade scheduling for next billing cycle

### Phase 4: Billing UI Enhancement
- Convert pricing page to fetch from database
- Enhance billing dashboard with invoice history
- Add Stripe Customer Portal integration
- Implement expiry warning indicators

### Phase 5: Email Templates
- Create PremiumWelcomeEmail component
- Create PaymentFailedEmail component
- Create SubscriptionCancelledEmail component
- Update PremiumReminderEmail for new tier structure

### Phase 6: Code Cleanup
- Remove Dodo Payments integration (/src/lib/dodopayments, /src/app/api/webhooks/dodo)
- Remove PayPal integration (/src/app/api/webhooks/paypal)
- Remove LemonSqueezy integration (/src/lib/lemonsqueezy)
- Delete legacy plan management functions (/src/lib/plans)
- Consolidate premium checking logic

### Phase 7: Testing & Validation
- Write unit tests for premium access control
- Write unit tests for subscription management
- Create E2E test for subscription flow
- Create E2E test for billing dashboard
- Test all webhook events with Stripe CLI
- Verify email delivery for all templates

---

## Next Steps

1. ✅ Plan complete - Save this file
2. ⏭️ Run `/speckit.tasks` to generate dependency-ordered implementation tasks
3. ⏭️ Run `/speckit.implement` to execute the task plan
4. ⏭️ Manual: Configure Stripe products/prices in Stripe Dashboard
5. ⏭️ Manual: Test end-to-end subscription flow in staging environment
