# Implementation Plan: DevCard V2 - Developer Social Business Card Platform

**Branch**: `001-devcard-platform` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-devcard-platform/spec.md`

## Summary

DevCard V2 is a developer social business card platform that auto-generates beautiful, shareable digital cards from GitHub profiles. The primary requirement is to enable developers to instantly create professional cards by connecting their GitHub account via OAuth, then share these cards through multiple channels (QR codes, wallet passes, links, social media) for easy networking at tech events and online communities.

**Technical Approach**: Build on existing Next.js 16 + Drizzle ORM + Supabase stack with NextAuth.js for authentication. Add GitHub OAuth provider, extend user schema for DevCard profiles, implement QR code generation with `qrcode` library, wallet pass generation with `passkit-generator`, and create sharing mechanisms. Use server actions for GitHub API integration with `@octokit/rest` (already in dependencies), implement caching strategy for GitHub data, and build analytics tracking with existing infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.8 / Next.js 16.0.1 (App Router with Turbopack)
**Primary Dependencies**:
- Next.js 16 (React 19.2) with App Router
- NextAuth.js 5.0.0-beta.25 (authentication)
- Drizzle ORM 0.38.4 (database)
- @neondatabase/serverless (Postgres via Neon)
- @octokit/rest 22.0.1 (GitHub API client)
- qrcode 1.5.4 (QR code generation)
- passkit-generator 3.5.5 (wallet pass creation)
- stripe 17.7.0 (payment processing)
- Radix UI + Tailwind CSS 4.1 (UI components)
- Inngest 3.34.5 (background jobs)
- React Email 4.0.16 (transactional emails)

**Storage**: PostgreSQL (Neon serverless), AWS S3 (file storage), Vercel KV/Redis (GitHub data caching with 24-hour TTL + PostgreSQL backup)

**Testing**: Vitest (unit/integration tests), React Testing Library (component tests), Playwright (E2E tests)

**Target Platform**: Web (Vercel deployment), optimized for mobile + desktop browsers

**Project Type**: Web application (Next.js full-stack)

**Performance Goals**:
- Card generation: <60 seconds from OAuth to shareable link
- Card page load: <2 seconds (LCP)
- QR code generation: <1 second
- GitHub data sync: <5 minutes for manual refresh
- Support 10,000 concurrent card views without degradation

**Constraints**:
- GitHub API rate limits (5,000 requests/hour authenticated)
- Wallet pass size limits (<200KB for Apple Wallet)
- Session timeout: 30 days inactivity
- Rate limiting: 20 connection requests/hour per user

**Scale/Scope**:
- Target: 10,000+ active users
- Expected: 100,000+ card views/month
- Data retention: Indefinite for active accounts, 30-day grace for inactive
- Premium tier: ~5% conversion target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution file is a template - no project-specific principles defined yet.

**Initial Assessment (Pre-Phase 0)**: Since no constitution exists, proceeding with industry-standard best practices:
- ✅ Use existing Next.js project structure (no new projects needed)
- ✅ Extend existing authentication system (NextAuth.js)
- ✅ Build on existing database schema (Drizzle ORM)
- ✅ Follow Next.js App Router conventions
- ✅ Maintain type safety with TypeScript
- ✅ Use server actions for mutations
- ✅ Implement proper error handling
- ✅ Add comprehensive logging

**Post-Design Re-check (After Phase 1)**: ✅ PASSED

After completing Phase 0 research and Phase 1 design artifacts, the implementation approach remains aligned with best practices:

- ✅ **Architecture Simplicity**: Extends existing Next.js monolith, no new projects or microservices
- ✅ **Database Design**: Normalized schema with proper indexes, follows Drizzle ORM conventions
- ✅ **Caching Strategy**: Three-tier caching (Edge CDN → Redis → PostgreSQL) with clear TTLs
- ✅ **Testing Coverage**: Comprehensive strategy (Vitest + RTL + Playwright) covers unit/integration/E2E
- ✅ **API Design**: RESTful endpoints following OpenAPI spec, clear contracts defined
- ✅ **Security**: OAuth-only authentication, minimal GitHub scopes, webhook HMAC verification
- ✅ **Performance**: ISR for static generation, edge deployment, database indexes optimized
- ✅ **Error Handling**: Graceful GitHub API failures, fallback to cache, retry logic with exponential backoff
- ✅ **Privacy Compliance**: GDPR-compliant analytics (hashed visitor IDs, 90-day retention)
- ✅ **Observability**: Structured logging, analytics tracking, Inngest job monitoring

**Conclusion**: No constitution violations. Design follows industry standards and maintains existing architectural patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-devcard-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Technical decisions and patterns
├── data-model.md        # Phase 1 output - Database schema extensions
├── quickstart.md        # Phase 1 output - Developer onboarding guide
├── contracts/           # Phase 1 output - API contracts
│   ├── api-endpoints.yaml    # OpenAPI spec for REST endpoints
│   └── github-integration.md # GitHub API integration patterns
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/              # Existing auth routes
│   │   └── auth/
│   │       └── github/      # NEW: GitHub OAuth callback
│   ├── (in-app)/
│   │   └── app/
│   │       ├── dashboard/   # NEW: User dashboard
│   │       ├── card/        # NEW: Card editor
│   │       ├── network/     # NEW: Connections management
│   │       ├── analytics/   # NEW: Analytics dashboard
│   │       └── settings/    # Existing - extend for DevCard settings
│   ├── (public)/
│   │   └── [username]/      # NEW: Public DevCard page
│   ├── api/
│   │   ├── auth/            # Existing NextAuth routes
│   │   ├── github/          # NEW: GitHub data sync endpoints
│   │   ├── cards/           # NEW: Card CRUD operations
│   │   ├── connections/     # NEW: Connection management
│   │   ├── analytics/       # NEW: Analytics tracking
│   │   ├── share/           # NEW: QR code & wallet pass generation
│   │   └── webhooks/
│   │       ├── stripe/      # Existing - extend for DevCard subscriptions
│   │       └── github/      # NEW: GitHub webhook handlers
│   └── (website-layout)/    # Existing marketing pages
│
├── components/
│   ├── auth/                # Existing auth components
│   ├── devcard/             # NEW: DevCard display components
│   │   ├── card-preview.tsx
│   │   ├── card-editor.tsx
│   │   ├── profile-section.tsx
│   │   ├── repo-showcase.tsx
│   │   └── stats-display.tsx
│   ├── sharing/             # NEW: Sharing components
│   │   ├── qr-code.tsx
│   │   ├── share-modal.tsx
│   │   └── wallet-pass-button.tsx
│   ├── network/             # NEW: Networking components
│   │   ├── connection-request.tsx
│   │   ├── connections-list.tsx
│   │   └── user-card-mini.tsx
│   └── analytics/           # NEW: Analytics components
│       ├── dashboard.tsx
│       └── metrics-chart.tsx
│
├── lib/
│   ├── github/              # NEW: GitHub integration
│   │   ├── client.ts        # Octokit client setup
│   │   ├── fetch-profile.ts
│   │   ├── fetch-repos.ts
│   │   ├── calculate-stats.ts
│   │   └── cache.ts         # GitHub data caching
│   ├── devcard/             # NEW: DevCard business logic
│   │   ├── generate.ts      # Card generation
│   │   ├── customize.ts     # Customization logic
│   │   └── url-utils.ts     # URL generation/validation
│   ├── sharing/             # NEW: Sharing utilities
│   │   ├── qr-generator.ts  # QR code generation
│   │   ├── wallet-pass.ts   # Apple/Google Wallet passes
│   │   └── share-links.ts   # Social media share links
│   ├── connections/         # NEW: Connection management
│   │   ├── requests.ts      # Connection request logic
│   │   ├── rate-limit.ts    # Rate limiting (20/hour)
│   │   └── notifications.ts # Connection notifications
│   ├── analytics/           # NEW: Analytics tracking
│   │   ├── track.ts         # Event tracking
│   │   ├── aggregate.ts     # Data aggregation
│   │   └── privacy.ts       # Privacy-compliant tracking
│   └── users/               # Existing - extend
│       └── onUserCreate.ts  # Extend for DevCard initialization
│
├── db/
│   └── schema/
│       ├── user.ts          # Existing - extend with GitHub fields
│       ├── devcard.ts       # NEW: DevCard profiles
│       ├── github-cache.ts  # NEW: Cached GitHub data
│       ├── connections.ts   # NEW: User connections
│       ├── analytics.ts     # NEW: Analytics events
│       └── plans.ts         # Existing - extend for DevCard premium
│
├── emails/                  # Existing - add new templates
│   ├── connection-request.tsx
│   ├── connection-accepted.tsx
│   └── premium-reminder.tsx
│
└── types/
    ├── github.ts            # NEW: GitHub API types
    ├── devcard.ts           # NEW: DevCard types
    └── analytics.ts         # NEW: Analytics types

tests/                       # NEW: Add testing infrastructure
├── unit/
│   ├── lib/
│   │   ├── github/
│   │   ├── devcard/
│   │   └── sharing/
│   └── components/
├── integration/
│   ├── api/
│   └── auth/
└── e2e/
    ├── card-creation.spec.ts
    ├── sharing.spec.ts
    └── connections.spec.ts
```

**Structure Decision**: Using Option 2 structure (Next.js full-stack web application). The existing codebase follows this pattern with:
- `src/app/` for Next.js App Router pages and API routes
- `src/components/` for React components
- `src/lib/` for business logic and utilities
- `src/db/schema/` for Drizzle ORM schema definitions

This aligns with the current project structure and enables feature development by extending existing patterns rather than introducing new architectural paradigms.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - constitution is not yet defined for this project. Following Next.js and industry best practices.
