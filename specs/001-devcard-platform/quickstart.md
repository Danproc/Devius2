# DevCard V2 - Developer Quickstart Guide

**Feature**: DevCard V2 - Developer Social Business Card Platform
**Branch**: `001-devcard-platform`
**Last Updated**: 2025-11-11

## Overview

Welcome to DevCard V2! This guide will help you get started with the codebase, understand the architecture, and begin contributing to the developer social business card platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Architecture Overview](#architecture-overview)
4. [Database Setup](#database-setup)
5. [GitHub OAuth Setup](#github-oauth-setup)
6. [Running the Application](#running-the-application)
7. [Key Concepts](#key-concepts)
8. [Development Workflow](#development-workflow)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or later
- **pnpm**: v8.x or later
- **PostgreSQL**: v15+ (or Neon account for serverless)
- **Git**: Latest version
- **GitHub Account**: For OAuth testing

**Recommended Tools**:
- VS Code with extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- Postman or similar for API testing
- Redis Desktop Manager (optional, for cache inspection)

## Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd Devius

# Checkout the feature branch
git checkout 001-devcard-platform

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devius
DIRECT_URL=postgresql://user:password@localhost:5432/devius

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here # Generate with: openssl rand -base64 32

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Vercel KV (Redis) - Optional for local dev
KV_URL=redis://localhost:6379
KV_REST_API_URL=http://localhost:8079
KV_REST_API_TOKEN=local_token

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS (for S3 storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=devius-assets

# Email (AWS SES)
AWS_SES_FROM_EMAIL=noreply@devius.io

# Inngest
INNGEST_EVENT_KEY=your_inngest_key
INNGEST_SIGNING_KEY=your_signing_key

# Application
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate webhook secret
openssl rand -base64 32
```

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 16 (App Router + React 19)
- **Language**: TypeScript 5.8
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS 4 + Radix UI
- **Background Jobs**: Inngest
- **Email**: React Email + AWS SES
- **Caching**: Vercel KV (Redis)
- **Payments**: Stripe
- **Deployment**: Vercel

### Project Structure

```text
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication routes
│   ├── (in-app)/       # Protected app routes
│   ├── (public)/       # Public DevCard pages
│   └── api/            # API routes
├── components/         # React components
│   ├── devcard/        # DevCard components
│   ├── sharing/        # Sharing components
│   └── network/        # Networking components
├── lib/                # Business logic
│   ├── github/         # GitHub integration
│   ├── devcard/        # DevCard logic
│   ├── sharing/        # QR & wallet passes
│   └── analytics/      # Analytics tracking
├── db/                 # Database
│   └── schema/         # Drizzle schemas
├── types/              # TypeScript types
└── emails/             # React Email templates

specs/001-devcard-platform/
├── spec.md             # Feature specification
├── plan.md             # Implementation plan
├── research.md         # Technical decisions
├── data-model.md       # Database schema
├── quickstart.md       # This file
└── contracts/          # API contracts
```

## Database Setup

### 1. Create Database

**Option A: Local PostgreSQL**
```bash
createdb devius
```

**Option B: Neon (Recommended)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `.env.local`

### 2. Run Migrations

```bash
# Generate migration from schema
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit push

# Or use migrate command
pnpm drizzle-kit migrate
```

### 3. Seed Database (Optional)

```bash
# Run seed script
pnpm tsx scripts/seed-devcard-data.ts
```

### 4. Inspect Database

```bash
# Open Drizzle Studio
pnpm drizzle-kit studio
```

Visit `https://local.drizzle.studio` to explore your database.

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: DevCard Local
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy **Client ID** and generate a **Client Secret**
6. Add to `.env.local`:
   ```env
   GITHUB_ID=your_client_id
   GITHUB_SECRET=your_client_secret
   ```

### 2. Test OAuth Flow

1. Start the dev server: `pnpm dev`
2. Navigate to `http://localhost:3000/sign-in`
3. Click "Continue with GitHub"
4. Authorize the app
5. You should be redirected back with a session

## Running the Application

### Start Development Server

```bash
# Start all services (Next.js + Inngest + Email)
pnpm dev

# Or individually:
pnpm next dev          # Next.js only
pnpm inngest-cli dev   # Inngest dev server
pnpm react-email dev   # Email preview
```

Access the application:
- **App**: http://localhost:3000
- **Inngest**: http://localhost:8288
- **Email Preview**: http://localhost:3001

### Build for Production

```bash
# Type check
pnpm type-check

# Build
pnpm build

# Start production server
pnpm start
```

## Key Concepts

### 1. DevCard Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: GitHub OAuth
    Created --> Syncing: Auto-sync triggered
    Syncing --> Active: Data fetched
    Active --> Customizing: User edits
    Customizing --> Active: Save changes
    Active --> Syncing: Manual refresh
    Active --> Inactive: User deletes
    Inactive --> [*]
```

### 2. GitHub Data Flow

```text
1. User connects GitHub → OAuth token stored
2. Initial sync triggered → Inngest job
3. Fetch profile + repos from GitHub API
4. Store in cache (Redis + PostgreSQL)
5. Update DevCard with latest data
6. Display on public card page
```

### 3. Caching Strategy

**Three-tier caching**:
1. **Edge CDN**: Static card pages (ISR with 1-hour revalidation)
2. **Redis (Vercel KV)**: GitHub API responses (24-hour TTL)
3. **PostgreSQL**: Long-term backup cache

### 4. Authentication Flow

1. User clicks "Connect with GitHub"
2. NextAuth.js redirects to GitHub OAuth
3. User authorizes app
4. GitHub returns access token
5. Token stored in `accounts` table
6. Session created with user ID
7. DevCard automatically created

### 5. Connection Requests

```text
User A → Send Request → User B
User B → Accept/Decline/Block
If Accepted → Both users in "My Network"
Rate Limit: 20 requests/hour
```

## Development Workflow

### 1. Create a New Feature

```bash
# Create feature branch from 001-devcard-platform
git checkout -b feature/my-feature 001-devcard-platform

# Make changes
# Commit with descriptive messages
git add .
git commit -m "feat: add QR code generation"

# Push and create PR
git push origin feature/my-feature
```

### 2. Database Schema Changes

```bash
# 1. Update schema file
# src/db/schema/devcard.ts

# 2. Generate migration
pnpm drizzle-kit generate

# 3. Review migration SQL
cat drizzle/migrations/<timestamp>_migration.sql

# 4. Apply migration
pnpm drizzle-kit push
```

### 3. Add New API Endpoint

```typescript
// app/api/cards/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const card = await db.query.devcards.findFirst({
    where: eq(devcards.url_slug, params.username)
  });

  if (!card) {
    return NextResponse.json(
      { error: 'DevCard not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(card);
}
```

### 4. Add New Component

```tsx
// components/devcard/card-preview.tsx
'use client';

import { DevCard } from '@/types/devcard';
import { Avatar } from '@/components/ui/avatar';

interface CardPreviewProps {
  card: DevCard;
}

export function CardPreview({ card }: CardPreviewProps) {
  return (
    <div className="rounded-lg border p-6">
      <Avatar src={card.avatar_url} alt={card.display_name} />
      <h2>{card.display_name}</h2>
      <p>{card.custom_bio}</p>
    </div>
  );
}
```

## Testing

### Setup Testing Framework

```bash
# Install test dependencies
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @playwright/test
```

### Run Tests

```bash
# Unit tests
pnpm vitest

# Unit tests with UI
pnpm vitest --ui

# E2E tests
pnpm playwright test

# Coverage report
pnpm vitest --coverage
```

### Example Unit Test

```typescript
// lib/github/__tests__/fetch-profile.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchGitHubProfile } from '../fetch-profile';

vi.mock('@octokit/rest');

describe('fetchGitHubProfile', () => {
  it('should fetch user profile from GitHub', async () => {
    const profile = await fetchGitHubProfile('test-user-id');

    expect(profile).toMatchObject({
      login: expect.any(String),
      name: expect.any(String),
      avatar_url: expect.any(String)
    });
  });
});
```

### Example E2E Test

```typescript
// tests/e2e/card-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create DevCard via GitHub OAuth', async ({ page }) => {
  await page.goto('/sign-in');
  await page.click('text=Connect with GitHub');

  // Mock GitHub OAuth (use test account)
  // ...

  await expect(page).toHaveURL('/app/dashboard');
  await expect(page.locator('h1')).toContainText('Your DevCard');
});
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running or check `DATABASE_URL` in `.env.local`

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@15
```

#### 2. GitHub OAuth Fails

```
Error: redirect_uri_mismatch
```

**Solution**: Verify callback URL in GitHub OAuth app matches:
```
http://localhost:3000/api/auth/callback/github
```

#### 3. Vercel KV Connection Error

```
Error: KV_URL is not defined
```

**Solution**: For local dev without Redis, mock the KV client:

```typescript
// lib/github/cache.ts
const kv = process.env.KV_URL
  ? require('@vercel/kv').kv
  : {
      get: async () => null,
      setex: async () => 'OK',
      del: async () => 1
    };
```

#### 4. Build Errors

```
Type error: Cannot find module '@/components/ui/avatar'
```

**Solution**: Run the build command to ensure all imports are valid:

```bash
pnpm type-check
pnpm build
```

#### 5. Inngest Jobs Not Running

**Solution**: Ensure Inngest dev server is running:

```bash
pnpm inngest-cli dev -p 8288
```

And the app is properly configured:

```typescript
// lib/inngest/client.ts
export const inngest = new Inngest({
  id: 'devius',
  eventKey: process.env.INNGEST_EVENT_KEY
});
```

### Debug Mode

Enable verbose logging:

```env
# .env.local
DEBUG=*
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Get Help

- **Documentation**: Check `specs/001-devcard-platform/` for detailed docs
- **API Reference**: See `contracts/api-endpoints.yaml`
- **Database Schema**: Review `data-model.md`
- **GitHub Issues**: Report bugs and request features

## Next Steps

1. ✅ Development environment set up
2. ⏭️ Review feature specification (`spec.md`)
3. ⏭️ Explore API contracts (`contracts/api-endpoints.yaml`)
4. ⏭️ Understand data model (`data-model.md`)
5. ⏭️ Check implementation tasks (`tasks.md` - to be generated)
6. ⏭️ Start contributing!

## Useful Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm type-check             # TypeScript type checking

# Database
pnpm drizzle-kit generate   # Generate migration
pnpm drizzle-kit push       # Apply migrations
pnpm drizzle-kit studio     # Open database GUI

# Testing
pnpm vitest                 # Run unit tests
pnpm playwright test        # Run E2E tests
pnpm vitest --coverage      # Generate coverage report

# Background Jobs
pnpm inngest-cli dev        # Start Inngest dev server

# Email
pnpm react-email dev        # Preview email templates
```

## Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs)
- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Inngest Documentation](https://www.inngest.com/docs)
- [GitHub API Reference](https://docs.github.com/en/rest)

---

**Happy coding!** If you have questions, reach out to the team or check the existing documentation in the `specs/` directory.
