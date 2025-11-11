# Research & Technical Decisions: DevCard V2

**Feature**: DevCard V2 - Developer Social Business Card Platform
**Date**: 2025-11-11
**Branch**: `001-devcard-platform`

## Overview

This document consolidates research findings and technical decisions for implementing the DevCard platform. It resolves all NEEDS CLARIFICATION items from the Technical Context and provides rationale for key architectural choices.

## 1. GitHub Data Caching Strategy

### Decision

Use **Vercel KV (Redis)** for GitHub API response caching with the following strategy:

- **Cache Duration**: 24 hours for profile data, 1 hour for repository stats
- **Cache Keys**: `github:profile:{username}`, `github:repos:{username}`, `github:stats:{username}`
- **Manual Refresh**: Clear cache on user-initiated refresh
- **Fallback**: Store last successful fetch in PostgreSQL as backup when cache/API fails

### Rationale

1. **Vercel KV** is already available on Vercel deployment (no additional service)
2. **GitHub API Rate Limits** (5,000/hour authenticated) require aggressive caching for 10k+ users
3. **Redis TTL** automatically handles cache expiration without manual cleanup
4. **PostgreSQL backup** ensures cards display even when GitHub API is down

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| In-memory cache (Node.js) | Lost on serverless cold starts, no persistence across instances |
| PostgreSQL only | Slower reads, no automatic TTL, requires manual cleanup jobs |
| External Redis (Upstash) | Additional cost when Vercel KV is included |
| No caching | Would exhaust GitHub API limits with minimal traffic |

### Implementation Notes

```typescript
// Cache structure
interface GitHubProfileCache {
  login: string;
  avatar_url: string;
  bio: string;
  location: string;
  public_repos: number;
  followers: number;
  cached_at: string;
}

// Cache TTL
const CACHE_TTL = {
  profile: 86400,    // 24 hours
  repos: 3600,       // 1 hour
  stats: 3600        // 1 hour
};
```

## 2. Testing Framework Selection

### Decision

Implement **Vitest + React Testing Library + Playwright** testing stack:

- **Vitest**: Unit and integration tests (Jest-compatible, faster, better TypeScript support)
- **React Testing Library**: Component testing (industry standard, promotes accessibility)
- **Playwright**: E2E tests (official Next.js recommendation, better than Cypress for modern apps)

### Rationale

1. **Vitest** is faster than Jest, has native ESM support, better for Next.js 16 + TypeScript 5.8
2. **React Testing Library** encourages testing user behavior over implementation details
3. **Playwright** has better TypeScript support, built-in parallelization, cross-browser testing
4. **Next.js 16 compatibility** - all three are officially supported/recommended

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Jest + React Testing Library + Cypress | Jest slower than Vitest, Cypress not recommended for Next.js 16 |
| AVA + Testing Library + Puppeteer | Less ecosystem support, Puppeteer maintenance concerns |
| No testing framework | Not acceptable - violates basic quality standards |

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for `lib/` utilities
- **Integration Tests**: All API routes + database operations
- **E2E Tests**: Critical user journeys (P1 user stories)

### Implementation Plan

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @playwright/test
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## 3. GitHub OAuth Implementation Pattern

### Decision

Use **NextAuth.js GitHub Provider** with custom callbacks for DevCard initialization:

```typescript
// src/auth.ts extension
GitHubProvider({
  clientId: process.env.GITHUB_ID!,
  clientSecret: process.env.GITHUB_SECRET!,
  authorization: {
    params: {
      scope: 'read:user user:email public_repo'
    }
  }
}),

// Callbacks
callbacks: {
  async signIn({ user, account, profile }) {
    if (account?.provider === 'github') {
      await createDevCard(user.id, {
        githubUsername: profile.login,
        githubId: profile.id,
        accessToken: account.access_token
      });
    }
    return true;
  }
}
```

### Rationale

1. **NextAuth.js** already configured - minimal integration effort
2. **OAuth scopes** limited to public data only (privacy-friendly)
3. **Automatic token refresh** handled by NextAuth.js
4. **Access token storage** in database for GitHub API calls

### GitHub API Client Pattern

Use `@octokit/rest` (already in dependencies) with token from database:

```typescript
// lib/github/client.ts
export async function getGitHubClient(userId: string) {
  const account = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.userId, userId),
      eq(accounts.provider, 'github')
    )
  });

  if (!account?.access_token) {
    throw new Error('GitHub not connected');
  }

  return new Octokit({
    auth: account.access_token,
    throttle: {
      onRateLimit: (retryAfter) => true,
      onSecondaryRateLimit: (retryAfter) => true
    }
  });
}
```

## 4. QR Code Generation Approach

### Decision

Use **qrcode library (already installed)** with server-side generation + caching:

```typescript
// lib/sharing/qr-generator.ts
import QRCode from 'qrcode';

export async function generateCardQR(username: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_URL}/${username}`;

  // Generate as data URL (base64)
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return qrDataUrl;
}
```

### Rationale

1. **Server-side generation** prevents client-side bundle bloat
2. **Data URL format** easy to embed in pages and wallet passes
3. **Error correction level M** balances readability vs data density
4. **400px width** works well for both screen display and printing

### Caching Strategy

- Cache generated QR codes in Vercel KV: `qr:{username}` → base64 data URL
- TTL: 7 days (QR codes rarely change)
- Invalidate on username change or card visibility toggle

## 5. Wallet Pass Generation Pattern

### Decision

Use **passkit-generator (already installed)** with Apple Wallet + Google Pay support:

### Apple Wallet (.pkpass)

```typescript
// lib/sharing/wallet-pass.ts
import { PKPass } from 'passkit-generator';

export async function generateApplePass(devcard: DevCard) {
  const pass = new PKPass({
    model: './certificates/pass-model',
    certificates: {
      wwdr: process.env.APPLE_WWDR_CERT,
      signerCert: process.env.APPLE_SIGNER_CERT,
      signerKey: process.env.APPLE_SIGNER_KEY,
      signerKeyPassphrase: process.env.APPLE_KEY_PASSPHRASE
    }
  });

  pass.primaryFields.add({
    key: 'name',
    value: devcard.name
  });

  pass.secondaryFields.add({
    key: 'github',
    label: 'GitHub',
    value: `@${devcard.githubUsername}`
  });

  // Add QR code
  pass.barcodes = [{
    format: 'PKBarcodeFormatQR',
    message: `${process.env.NEXT_PUBLIC_URL}/${devcard.username}`,
    messageEncoding: 'iso-8859-1'
  }];

  return pass.getAsBuffer();
}
```

### Google Pay (JWT)

```typescript
export async function generateGooglePass(devcard: DevCard) {
  // Use Google Wallet API
  const genericObject = {
    id: `${process.env.GOOGLE_ISSUER_ID}.${devcard.id}`,
    classId: `${process.env.GOOGLE_ISSUER_ID}.devcard`,
    heroImage: {
      sourceUri: { uri: devcard.avatar }
    },
    barcode: {
      type: 'QR_CODE',
      value: `${process.env.NEXT_PUBLIC_URL}/${devcard.username}`
    },
    cardTitle: { defaultValue: { language: 'en', value: devcard.name } },
    header: { defaultValue: { language: 'en', value: `@${devcard.githubUsername}` } }
  };

  // Return JWT for add to Google Wallet button
  return jwt.sign({ payload: { genericObjects: [genericObject] } },
    process.env.GOOGLE_SERVICE_KEY,
    { algorithm: 'RS256' }
  );
}
```

### Rationale

1. **Apple Wallet** requires certificates (setup complexity but native iOS integration)
2. **Google Pay** uses JWT (simpler, no certificates required)
3. **QR codes embedded** in passes for quick scanning
4. **Size limits respected** (<200KB for Apple, lightweight JSON for Google)

### Setup Requirements

- **Apple**: Developer account, pass type certificate, WWDR certificate
- **Google**: Google Cloud project, Wallet API enabled, service account key

## 6. Analytics Tracking Architecture

### Decision

Implement **privacy-first analytics** using PostgreSQL + aggregation jobs:

```typescript
// lib/analytics/track.ts
export async function trackCardView(
  username: string,
  metadata: {
    referrer?: string;
    userAgent?: string;
    country?: string; // From Vercel edge headers
  }
) {
  // Hash visitor ID (no PII storage)
  const visitorId = await hashVisitorId(metadata.userAgent, metadata.ip);

  await db.insert(analytics_events).values({
    type: 'card_view',
    username,
    visitor_id: visitorId,
    referrer: metadata.referrer,
    country: metadata.country,
    timestamp: new Date()
  });
}
```

### Privacy Compliance

- **No PII stored**: Visitor IDs are hashed (SHA-256 + salt)
- **Geographic data**: Country-level only (from Vercel headers)
- **No cross-site tracking**: No cookies, no third-party trackers
- **GDPR compliance**: Users can export/delete their analytics data
- **Retention policy**: 90 days for raw events, indefinite for aggregated stats

### Aggregation Strategy

Use Inngest (already in dependencies) for daily aggregation:

```typescript
// lib/inngest/functions/aggregate-analytics.ts
export const aggregateAnalytics = inngest.createFunction(
  { name: 'Aggregate Daily Analytics' },
  { cron: '0 2 * * *' }, // 2 AM daily
  async ({ event, step }) => {
    const yesterday = subDays(new Date(), 1);

    // Aggregate views, scans, shares
    await aggregateDailyMetrics(yesterday);

    // Clean up raw events older than 90 days
    await cleanupOldEvents();
  }
);
```

## 7. Rate Limiting Implementation

### Decision

Use **Upstash Rate Limit** (works with Vercel KV) for connection request limiting:

```typescript
// lib/connections/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const connectionRequestLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true
});

export async function checkConnectionRateLimit(userId: string): Promise<boolean> {
  const { success, remaining } = await connectionRequestLimiter.limit(
    `connection_requests:${userId}`
  );

  return success;
}
```

### Rationale

1. **Upstash Ratelimit** integrates with Vercel KV (no extra service)
2. **Sliding window** more accurate than fixed window
3. **Analytics enabled** for monitoring abuse patterns
4. **20 requests/hour** prevents spam while allowing legitimate networking

## 8. Database Migration Strategy

### Decision

Use **Drizzle Kit** (already configured) for schema migrations:

```bash
# Generate migration
pnpm drizzle-kit generate

# Push to database
pnpm drizzle-kit push

# Or run migration
pnpm drizzle-kit migrate
```

### Migration Workflow

1. **Development**: Use `drizzle-kit push` for rapid iteration
2. **Production**: Generate migrations, review SQL, then apply
3. **Rollback**: Maintain down migrations for critical changes
4. **Data migrations**: Separate Inngest jobs for data backfills

### Schema Versioning

- **Version control**: All schema files in Git
- **Migration history**: Stored in `drizzle/migrations/` directory
- **Production safety**: Require migration review before deploy

## 9. URL Slug Strategy

### Decision

Use **GitHub username as URL slug** with conflict resolution:

```typescript
// lib/devcard/url-utils.ts
export async function generateCardUrl(githubUsername: string): Promise<string> {
  // Primary: Use GitHub username
  let slug = githubUsername.toLowerCase();

  // Check uniqueness
  const existing = await db.query.devcards.findFirst({
    where: eq(devcards.url_slug, slug)
  });

  if (existing) {
    // Conflict: Append random suffix
    slug = `${githubUsername}-${nanoid(6)}`;
  }

  return slug;
}
```

### Rationale

1. **GitHub username primary** - natural, memorable URLs
2. **Conflict resolution** handles edge cases (username changes, multiple accounts)
3. **nanoid suffix** when needed - short, URL-safe
4. **Immutable after creation** - prevents broken links

### Custom Domain Support (Premium)

```typescript
// For premium users
interface CustomDomain {
  domain: string;        // e.g., "card.johndoe.dev"
  verified: boolean;     // DNS verification status
  ssl_status: string;    // Certificate provisioning
}
```

Premium users can configure custom domains via Vercel's domain API.

## 10. Performance Optimization Strategies

### Decision

Implement multi-layered performance optimization:

### 1. Static Generation for Public Cards

```typescript
// app/[username]/page.tsx
export async function generateStaticParams() {
  // Pre-generate top 1000 cards at build time
  const topCards = await getTopCards(1000);
  return topCards.map(card => ({ username: card.username }));
}

export const revalidate = 3600; // ISR: Revalidate hourly
```

### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={devcard.avatar}
  alt={devcard.name}
  width={200}
  height={200}
  placeholder="blur"
  blurDataURL={devcard.avatar_placeholder}
/>
```

### 3. Database Query Optimization

```typescript
// Index strategy
await db.execute(sql`
  CREATE INDEX idx_devcards_username ON devcards(url_slug);
  CREATE INDEX idx_connections_user ON connections(user_id);
  CREATE INDEX idx_analytics_username ON analytics_events(username, timestamp);
`);

// Use Drizzle prepared statements
const getCardByUsername = db.query.devcards.findFirst({
  where: eq(devcards.url_slug, sql.placeholder('username'))
}).prepare();
```

### 4. Edge Caching

```typescript
// app/[username]/page.tsx
export const runtime = 'edge'; // Deploy to edge
export const revalidate = 3600;

// Cache-Control headers
export async function GET(request: Request) {
  return new Response(html, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

### Rationale

- **Static generation**: 2-second load time goal met with ISR
- **Image optimization**: Reduces LCP, improves Core Web Vitals
- **Database indexes**: Sub-100ms query times for card lookups
- **Edge deployment**: Global CDN distribution, low latency

## Summary of Technical Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Caching | Vercel KV (Redis) + PostgreSQL backup | Built-in, handles GitHub rate limits |
| Testing | Vitest + RTL + Playwright | Modern, fast, Next.js 16 compatible |
| GitHub OAuth | NextAuth.js GitHub provider | Already integrated, token management |
| QR Codes | qrcode library (server-side) | Already installed, simple, cacheable |
| Wallet Passes | passkit-generator (Apple + Google) | Industry standard, full-featured |
| Analytics | PostgreSQL + Inngest aggregation | Privacy-first, GDPR compliant |
| Rate Limiting | Upstash Ratelimit | Works with Vercel KV, sliding window |
| Migrations | Drizzle Kit | Already configured, type-safe |
| URL Slugs | GitHub username + conflict resolution | Memorable, handles edge cases |
| Performance | ISR + Edge + Indexes + Image optimization | Meets <2s load time goal |

## Next Steps

1. ✅ Research complete - all NEEDS CLARIFICATION resolved
2. ⏭️ Phase 1: Generate data-model.md with schema definitions
3. ⏭️ Phase 1: Generate API contracts (OpenAPI spec)
4. ⏭️ Phase 1: Generate quickstart.md for developer onboarding
5. ⏭️ Phase 2: Generate tasks.md with dependency-ordered implementation tasks

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs/overview)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Vercel KV (Redis)](https://vercel.com/docs/storage/vercel-kv)
- [Apple Wallet Developer Guide](https://developer.apple.com/wallet/)
- [Google Wallet API](https://developers.google.com/wallet)
- [Upstash Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
