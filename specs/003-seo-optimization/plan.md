# Implementation Plan: SEO Optimization

**Branch**: `003-seo-optimization` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-seo-optimization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement comprehensive SEO optimization for StackPass including dynamic metadata for all public pages (landing, hackathons, profiles), dynamic sitemap with hackathons and profiles, structured data schemas (Organization, Event, Person), breadcrumbs, custom OG images, root error pages, robots.txt improvements, and performance optimizations. Target: Improve SEO score from 5.5/10 to 9/10, achieve 100% hackathons in Rich Results, 40% social CTR increase, and 95% indexing coverage within 7 days.

## Technical Context

**Language/Version**: TypeScript 5.8 / Next.js 16.0.1 (App Router with Turbopack)
**Primary Dependencies**: React 19.2.0, next-seo 6.6.0, drizzle-orm 0.38.4, @vercel/og 0.6.8
**Storage**: PostgreSQL via Supabase (existing schema: hackathons, devcards, users tables)
**Testing**: Vitest 4.0.8, Playwright 1.56.1
**Target Platform**: Vercel deployment (Next.js hosting with ISR support)
**Project Type**: Web application (Next.js App Router structure with route groups)
**Performance Goals**: Lighthouse SEO score 95+, Performance 90+, <3s sitemap generation
**Constraints**: Cannot modify database schema, must maintain existing ISR caching (hackathons: 600s browse / 60s detail), OG images <5MB, sitemap <5s generation time
**Scale/Scope**: Estimated <50,000 total public pages (hackathons + profiles), initial SEO score 5.5/10 target 9/10

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (No constitution file defined yet)

Since no constitution.md has been ratified for this project, no gates apply. SEO optimization is a standard web enhancement that:
- Uses existing Next.js patterns and established libraries
- Does not introduce new architectural complexity
- Builds on existing database schema without modifications
- Follows Next.js App Router conventions already in use

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (website-layout)/
│   │   ├── hackathons/          # Public hackathons pages (with metadata)
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx     # Individual hackathon detail
│   │   │   └── page.tsx         # Hackathons browse
│   │   └── ...                  # Other public pages
│   ├── (public)/
│   │   └── [username]/
│   │       └── page.tsx         # User profile pages (with metadata)
│   ├── sitemap.ts               # Dynamic sitemap generation
│   ├── robots.ts                # Robots.txt generation (NEW)
│   ├── not-found.tsx            # Root 404 page (NEW)
│   ├── error.tsx                # Root error page (NEW)
│   └── layout.tsx               # Root layout with base metadata
│
├── components/
│   └── seo/                     # SEO-specific components (NEW)
│       ├── StructuredData.tsx   # JSON-LD wrapper
│       ├── Breadcrumbs.tsx      # Breadcrumb navigation
│       └── MetaTags.tsx         # Reusable metadata helper
│
├── lib/
│   ├── seo/                     # SEO utilities (NEW)
│   │   ├── metadata.ts          # Metadata generation helpers
│   │   ├── structured-data.ts   # Schema.org generators
│   │   └── og-image.ts          # Dynamic OG image generation
│   └── config.ts                # App config (existing)
│
└── db/
    └── queries/
        └── seo.ts               # SEO-specific queries (NEW)
```

**Structure Decision**: Web application using Next.js App Router with route groups. SEO implementation will add new utility modules (`lib/seo/`, `components/seo/`) and enhance existing page components with metadata exports. New root-level special files (`robots.ts`, `not-found.tsx`, `error.tsx`) will be created per Next.js conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations
