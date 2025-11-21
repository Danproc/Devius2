# Quickstart: SEO Optimization Implementation

**Feature**: 003-seo-optimization
**Date**: 2025-11-21
**Estimated Time**: 8-12 hours across 3 implementation phases

---

## Overview

This guide provides a step-by-step implementation order for SEO optimization. Follow phases sequentially for incremental progress.

---

## Prerequisites

- [x] Next.js 16.0.1 with App Router
- [x] TypeScript 5.8
- [x] @vercel/og 0.6.8 installed
- [x] next-seo 6.6.0 installed (optional, for legacy support)
- [x] Database access (hackathons, devcards tables)
- [x] NEXT_PUBLIC_APP_URL environment variable configured

---

## Phase 1: Foundation (2-3 hours)

### 1.1 Create SEO Utility Modules

**Create**: `src/lib/seo/metadata.ts`

```typescript
import { Metadata } from 'next';

export function generatePageMetadata({
  title,
  description,
  path,
  ogImage,
  type = 'website'
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'profile';
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}${path}`;
  const defaultOgImage = `${baseUrl}/images/og.png`;

  return {
    title,
    description: description.slice(0, 160),
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url,
      type,
      images: [ogImage || defaultOgImage]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 160),
      images: [ogImage || defaultOgImage]
    }
  };
}
```

**Create**: `src/lib/seo/structured-data.ts`

```typescript
import { Hackathon } from '@/db/schema/hackathons';
import { Devcard } from '@/db/schema/devcard';

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StackPass",
    url: baseUrl,
    logo: `${baseUrl}/assets/logo.png`,
    description: "GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.",
    sameAs: [
      "https://twitter.com/cjsingg",
      "https://github.com/stackpass" // Update with actual GitHub org
    ]
  };
}

export function generateEventSchema(hackathon: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: hackathon.title,
    description: hackathon.description,
    startDate: new Date(hackathon.start_at).toISOString(),
    endDate: new Date(hackathon.submission_deadline_at).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `${baseUrl}/hackathons/${hackathon.slug}`
    },
    organizer: {
      "@type": "Organization",
      name: "StackPass",
      url: baseUrl
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    }
  };
}

export function generatePersonSchema(profile: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const displayName = profile.display_name || profile.github_username;

  const sameAs = [`https://github.com/${profile.github_username}`];
  if (profile.social_links?.twitter) sameAs.push(profile.social_links.twitter);
  if (profile.social_links?.linkedin) sameAs.push(profile.social_links.linkedin);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    image: profile.avatar_url,
    url: `${baseUrl}/${profile.url_slug}`,
    description: profile.custom_bio || undefined,
    sameAs
  };
}

export function generateBreadcrumbSchema(items: { label: string; href: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`
    }))
  };
}
```

**Create**: `src/db/queries/seo.ts`

```typescript
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { devcards } from '@/db/schema/devcard';
import { eq, inArray } from 'drizzle-orm';

export async function getAllHackathons() {
  return db.select({
    id: hackathons.id,
    slug: hackathons.slug,
    updated_at: hackathons.updated_at
  })
  .from(hackathons)
  .where(inArray(hackathons.status, ['upcoming', 'registration', 'active', 'voting', 'completed']));
}

export async function getPublicProfiles() {
  return db.select({
    url_slug: devcards.url_slug,
    updated_at: devcards.updated_at
  })
  .from(devcards)
  .where(eq(devcards.is_public, true));
}
```

**Checkpoint**: Utility functions ready ✅

---

### 1.2 Create Reusable Components

**Create**: `src/components/seo/StructuredData.tsx`

```typescript
export function StructuredData({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Create**: `src/components/seo/Breadcrumbs.tsx`

```typescript
import Link from 'next/link';
import { StructuredData } from './StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = generateBreadcrumbSchema(items);

  return (
    <>
      <StructuredData schema={schema} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex gap-2 text-sm text-devcard-text">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-2">
              {i < items.length - 1 ? (
                <>
                  <Link href={item.href} className="hover:text-devcard-green transition-colors">
                    {item.label}
                  </Link>
                  <span>/</span>
                </>
              ) : (
                <span className="text-devcard-heading">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

**Checkpoint**: Components created ✅

---

## Phase 2: Core SEO Implementation (3-4 hours)

### 2.1 Update Root Layout Metadata

**Edit**: `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | StackPass',
    default: 'StackPass - GitHub-Powered Developer Profiles'
  },
  description: 'GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.',
  keywords: ['StackPass', 'Developer Profiles', 'GitHub Integration', 'Hackathons', 'Developer Networking', 'Wallet Pass', 'DevCard'],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL
  },
  openGraph: {
    title: 'StackPass - GitHub-Powered Developer Profiles',
    description: 'GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'StackPass',
    locale: 'en_US',
    type: 'website',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og.png`]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackPass - GitHub-Powered Developer Profiles',
    description: 'GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og.png`]
  },
  robots: {
    index: true,
    follow: true
  }
};
```

**Add Organization Schema**: In root layout JSX

```typescript
import { StructuredData } from '@/components/seo/StructuredData';
import { generateOrganizationSchema } from '@/lib/seo/structured-data';

// In <body>
<StructuredData schema={generateOrganizationSchema()} />
<Providers>{children}</Providers>
```

**Checkpoint**: Root metadata enhanced ✅

---

### 2.2 Add Hackathon Page Metadata

**Edit**: `src/app/(website-layout)/hackathons/[slug]/page.tsx`

```typescript
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateEventSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const hackathon = await getHackathon(params.slug);

  if (!hackathon) {
    return {
      title: 'Hackathon Not Found - StackPass',
      description: 'The requested hackathon could not be found.'
    };
  }

  return generatePageMetadata({
    title: `${hackathon.title} - StackPass Hackathons`,
    description: hackathon.description,
    path: `/hackathons/${hackathon.slug}`,
    ogImage: `/api/og/hackathon?title=${encodeURIComponent(hackathon.title)}&prize=${hackathon.prizes.first}&currency=${hackathon.prizes.currency}`
  });
}

// In component JSX (top of page)
<>
  <StructuredData schema={generateEventSchema(hackathon)} />
  <Breadcrumbs items={[
    { label: 'Home', href: '/' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: hackathon.title, href: `/hackathons/${hackathon.slug}` }
  ]} />
  {/* Rest of page content */}
</>
```

**Checkpoint**: Hackathon SEO complete ✅

---

### 2.3 Add Profile Page Metadata

**Edit**: `src/app/(public)/[username]/page.tsx`

```typescript
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generatePersonSchema } from '@/lib/seo/structured-data';
import { StructuredData } from '@/components/seo/StructuredData';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const profile = await getPublicProfile(params.username);

  if (!profile) {
    return {
      title: 'Profile Not Found - StackPass',
      description: 'The requested profile could not be found.'
    };
  }

  const displayName = profile.display_name || profile.github_username;
  const bio = profile.custom_bio || `Check out ${displayName}'s developer profile on StackPass.`;

  return generatePageMetadata({
    title: `${displayName} - StackPass Developer Profile`,
    description: bio,
    path: `/${profile.url_slug}`,
    ogImage: profile.avatar_url, // Use avatar directly
    type: 'profile'
  });
}

// In component JSX
<StructuredData schema={generatePersonSchema(profile)} />
```

**Checkpoint**: Profile SEO complete ✅

---

### 2.4 Update Sitemap

**Edit**: `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { getAllHackathons, getPublicProfiles } from '@/db/queries/seo';
import { getAllBlogs } from '@/lib/mdx/blogs';
import { source } from '@/lib/docs/source';

export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Fetch all dynamic content
  const [hackathons, profiles, blogs, docs] = await Promise.all([
    getAllHackathons(),
    getPublicProfiles(),
    getAllBlogs(),
    Promise.resolve(source.getPages())
  ]);

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0, freq: 'monthly' as const },
    { path: '/about', priority: 0.8, freq: 'monthly' as const },
    { path: '/pricing', priority: 0.8, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
    { path: '/join-waitlist', priority: 0.7, freq: 'monthly' as const },
    { path: '/blog', priority: 0.8, freq: 'weekly' as const },
    { path: '/hackathons', priority: 0.9, freq: 'daily' as const }
  ].map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority
  }));

  // Policy pages
  const policyPages = ['/cookie', '/privacy', '/terms', '/refund'].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.5
  }));

  // Hackathon pages
  const hackathonPages = hackathons.map(h => ({
    url: `${baseUrl}/hackathons/${h.slug}`,
    lastModified: h.updated_at ? new Date(h.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8
  }));

  // Profile pages
  const profilePages = profiles.map(p => ({
    url: `${baseUrl}/${p.url_slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  // Blog pages
  const blogPages = blogs.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.frontmatter.createdDate),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  // Documentation pages
  const docsPages = docs.map(page => ({
    url: `${baseUrl}/docs/${page.slugs.join('/')}`,
    lastModified: new Date(page.data.lastModified ?? new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }));

  return [
    ...staticPages,
    ...policyPages,
    ...hackathonPages,
    ...profilePages,
    ...blogPages,
    ...docsPages
  ];
}
```

**Checkpoint**: Sitemap includes all content ✅

---

### 2.5 Create Robots.txt

**Create**: `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/', '/admin/', '/super-admin/']
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
```

**Checkpoint**: Robots.txt configured ✅

---

## Phase 3: Dynamic OG Images & Error Pages (3-4 hours)

### 3.1 Create Hackathon OG Image API

**Create**: `src/app/api/og/hackathon/route.tsx`

```typescript
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const prize = searchParams.get('prize');
    const currency = searchParams.get('currency') || 'USD';

    if (!title || !prize) {
      return new Response('Missing parameters', { status: 400 });
    }

    const formattedPrize = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(Number(prize));

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0a',
            padding: '60px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 24, color: '#00ff00', margin: 0, letterSpacing: '0.1em' }}>
              STACKPASS HACKATHONS
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: 64, fontWeight: 'bold', color: '#ffffff', margin: 0, lineHeight: 1.2, maxWidth: 1000 }}>
              {title}
            </h1>
            <div style={{ display: 'flex', gap: 30, fontSize: 28, color: '#a0a0a0' }}>
              <span style={{ color: '#00ff00' }}>★ First Prize: {formattedPrize}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 'bold', color: '#00ff00' }}>STACKPASS</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (error) {
    console.error('OG image generation failed:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
```

**Checkpoint**: OG images generating ✅

---

### 3.2 Create Error Pages

**Create**: `src/app/not-found.tsx`

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="bg-devcard-base min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-devcard-heading mb-4">404</h1>
        <p className="text-xl text-devcard-text mb-8">Page not found</p>
        <p className="text-sm text-devcard-text/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-devcard-green text-black hover:bg-devcard-green/90">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

**Create**: `src/app/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="bg-devcard-base min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-devcard-heading mb-4">500</h1>
        <p className="text-xl text-devcard-text mb-8">Something went wrong</p>
        <p className="text-sm text-devcard-text/70 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <Button
          onClick={reset}
          className="bg-devcard-green text-black hover:bg-devcard-green/90"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

**Checkpoint**: Error pages styled ✅

---

## Phase 4: Testing & Validation (1-2 hours)

### 4.1 Local Testing

```bash
# Run dev server
pnpm dev

# Test metadata
# Visit: http://localhost:3000/hackathons/[slug]
# Inspect: View source, check <head> tags

# Test sitemap
# Visit: http://localhost:3000/sitemap.xml
# Verify: All hackathons and profiles listed

# Test robots.txt
# Visit: http://localhost:3000/robots.txt

# Test OG image
# Visit: http://localhost:3000/api/og/hackathon?title=Test&prize=1000

# Test error pages
# Visit: http://localhost:3000/non-existent-page (404)
```

### 4.2 Validation Tools

**Twitter Card Validator**
```
https://cards-dev.twitter.com/validator
```
- Enter hackathon URL
- Verify card displays correctly

**Facebook Sharing Debugger**
```
https://developers.facebook.com/tools/debug/
```
- Enter hackathon URL
- Scrape new data
- Verify preview

**Google Rich Results Test**
```
https://search.google.com/test/rich-results
```
- Test hackathon page for Event schema
- Test profile page for Person schema

**Lighthouse SEO Audit**
```bash
# Chrome DevTools > Lighthouse > SEO category
# Target: 95+ score
```

---

## Deployment Checklist

- [ ] All files committed to `003-seo-optimization` branch
- [ ] Environment variable `NEXT_PUBLIC_APP_URL` set in Vercel
- [ ] Build succeeds: `pnpm build`
- [ ] TypeScript compiles: `pnpm type-check`
- [ ] Deploy to Vercel (preview deployment)
- [ ] Test sitemap on live URL
- [ ] Submit sitemap to Google Search Console
- [ ] Test social sharing on Twitter/LinkedIn
- [ ] Verify Rich Results with Google Search Console

---

## Post-Deployment Tasks

### Google Search Console Setup

1. **Add Property**: https://stackpass.app
2. **Verify Ownership**: DNS or HTML file method
3. **Submit Sitemap**: Submit `/sitemap.xml` URL
4. **Monitor Indexing**: Check coverage report
5. **Test Rich Results**: Verify Event and Person schemas appear

### Social Media Validation

- Share hackathon link on Twitter → Verify card
- Share profile link on LinkedIn → Verify card
- Share in Slack → Verify unfurl

### Performance Monitoring

- Monitor Lighthouse scores (target: SEO 95+)
- Check Core Web Vitals (LCP < 2.5s)
- Monitor sitemap generation time (<5s)

---

## Troubleshooting

### OG Images Not Showing
- Check `/api/og/hackathon` endpoint directly
- Verify image dimensions (1200x630)
- Clear social platform cache (Twitter, Facebook)

### Sitemap Empty
- Check database queries return data
- Verify `is_public` filter on profiles
- Check hackathon status filter

### Metadata Not Updating
- Clear Next.js cache: `rm -rf .next`
- Check ISR revalidation periods
- Verify `NEXT_PUBLIC_APP_URL` environment variable

### Structured Data Not Validating
- Use Google Rich Results Test
- Check JSON-LD syntax
- Verify required fields present

---

## Success Metrics

Track these metrics post-deployment:

- [ ] Lighthouse SEO score: 95+ (baseline: 5.5/10)
- [ ] Google Rich Results: 100% of hackathons pass Event schema test
- [ ] Indexing Coverage: 95% of pages indexed within 7 days
- [ ] Social CTR: 40% increase in click-through rate from social shares
- [ ] Sitemap Coverage: 100% of public hackathons and profiles in sitemap
- [ ] Error Rate: Zero soft 404 errors in Search Console

**Timeline**: Monitor metrics for 30 days post-deployment.

---

## Additional Resources

- [Next.js Metadata Docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Event](https://schema.org/Event)
- [Schema.org Person](https://schema.org/Person)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
