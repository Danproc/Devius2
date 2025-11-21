# Sitemap API Contract

**Feature**: 003-seo-optimization
**Type**: Next.js Sitemap Route

---

## Overview

Dynamic sitemap generation using Next.js `sitemap.ts` file. Outputs XML format compliant with Google Sitemap Protocol.

---

## Contract 1: Main Sitemap

**Endpoint**: `/sitemap.xml`

**Implementation**: `src/app/sitemap.ts`

**HTTP Method**: GET (automatic via Next.js)

**Request**: None (accessed via URL)

**Response Format**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stackpass.app/</loc>
    <lastmod>2025-11-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... more URLs -->
</urlset>
```

**Response Headers**:
```
Content-Type: application/xml
Cache-Control: public, max-age=3600
```

**Implementation**:
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllHackathons, getPublicProfiles } from '@/db/queries/seo';
import { getAllBlogs } from '@/lib/mdx/blogs';
import { source } from '@/lib/docs/source';

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
    { path: '', priority: 1.0, freq: 'monthly' },
    { path: '/about', priority: 0.8, freq: 'monthly' },
    { path: '/pricing', priority: 0.8, freq: 'monthly' },
    { path: '/contact', priority: 0.7, freq: 'monthly' },
    { path: '/join-waitlist', priority: 0.7, freq: 'monthly' },
    { path: '/blog', priority: 0.8, freq: 'weekly' },
    { path: '/hackathons', priority: 0.9, freq: 'daily' }
  ].map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq as const,
    priority
  }));

  // Policy pages
  const policyPages = ['/cookie', '/privacy', '/terms', '/refund'].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.5
  }));

  // Hackathon pages (FR-016)
  const hackathonPages = hackathons.map(h => ({
    url: `${baseUrl}/hackathons/${h.slug}`,
    lastModified: h.updated_at ? new Date(h.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8
  }));

  // Profile pages (FR-017)
  const profilePages = profiles.map(p => ({
    url: `${baseUrl}/${p.url_slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  // Blog pages (FR-018)
  const blogPages = blogs.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.frontmatter.createdDate),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  // Documentation pages (FR-018)
  const docsPages = docs.map(page => ({
    url: `${baseUrl}/docs/${page.slugs.join('/')}`,
    lastModified: new Date(page.data.lastModified ?? new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }));

  const allEntries = [
    ...staticPages,
    ...policyPages,
    ...hackathonPages,
    ...profilePages,
    ...blogPages,
    ...docsPages
  ];

  // Check limit (FR-020)
  if (allEntries.length > 50000) {
    console.warn(`Sitemap has ${allEntries.length} URLs, exceeding Google's 50K limit. Consider sitemap index.`);
    // For now, return all (will implement sitemap index if needed)
  }

  return allEntries;
}
```

**Data Requirements**:

Query: `getAllHackathons()`
```sql
SELECT id, slug, updated_at
FROM hackathons
WHERE status IN ('upcoming', 'registration', 'active', 'voting', 'completed')
ORDER BY updated_at DESC;
```

Query: `getPublicProfiles()`
```sql
SELECT url_slug, updated_at
FROM devcards
WHERE is_public = true
ORDER BY updated_at DESC;
```

**Performance Requirements** (FR-019):
- Total execution time: <5 seconds
- Database queries: <3 seconds combined
- Transformation logic: <1 second
- Next.js caching handles regeneration

**Validation**:
- All URLs must be absolute (include protocol and domain)
- `lastModified` must be valid Date
- `changeFrequency` must be one of: always, hourly, daily, weekly, monthly, yearly, never
- `priority` must be 0.0 to 1.0
- Total entries per file: <50,000

---

## Contract 2: Sitemap Index (Future)

**Endpoint**: `/sitemap.xml` (replaces main sitemap if needed)

**Trigger**: When total URLs > 50,000

**Implementation**: `src/app/sitemap.ts`

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return [
    {
      url: `${baseUrl}/sitemap/static.xml`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/sitemap/hackathons.xml`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/sitemap/profiles.xml`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/sitemap/blog.xml`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/sitemap/docs.xml`,
      lastModified: new Date()
    }
  ];
}
```

**Individual Sitemap Routes**: `src/app/sitemap/[type]/route.ts`

```typescript
// src/app/sitemap/hackathons/route.ts
import { MetadataRoute } from 'next';

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const hackathons = await getAllHackathons();

  const sitemap: MetadataRoute.Sitemap = hackathons.map(h => ({
    url: `${baseUrl}/hackathons/${h.slug}`,
    lastModified: h.updated_at ? new Date(h.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8
  }));

  // Manually generate XML (Next.js doesn't auto-generate for route handlers)
  const xml = generateSitemapXML(sitemap);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
```

**Note**: Only implement sitemap index if URLs exceed 50K. Start with single sitemap.

---

## Contract 3: Robots.txt Reference

**Location**: Sitemap URL must be referenced in robots.txt

**Implementation**: `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/', '/admin/', '/super-admin/']
    },
    sitemap: `${baseUrl}/sitemap.xml`  // References main sitemap
  };
}
```

**Output**:
```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/
Disallow: /admin/
Disallow: /super-admin/

Sitemap: https://stackpass.app/sitemap.xml
```

---

## Regeneration Strategy

### Build Time (Static)
- Sitemap generated during `next build`
- Uploaded to Vercel as static file
- Stale after deployment until next build

### On-Demand (ISR)
- Add `export const revalidate = 3600;` to `sitemap.ts`
- Regenerates every hour (FR-019)
- Balances freshness vs. server load

**Chosen**: ISR with 1-hour revalidation (3600 seconds)

```typescript
// src/app/sitemap.ts
export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ...
}
```

---

## Error Handling

### Database Query Failure
```typescript
try {
  const hackathons = await getAllHackathons();
} catch (error) {
  console.error('Failed to fetch hackathons for sitemap:', error);
  // Return empty array, don't crash sitemap generation
  return [];
}
```

### Missing Environment Variables
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost');
}
```

### Timeout Protection
```typescript
// Set query timeout to prevent hanging
const hackathons = await db.select()
  .from(hackathonsTable)
  .timeout(5000); // 5 second timeout
```

---

## Testing Checklist

- [ ] Sitemap generates successfully at `/sitemap.xml`
- [ ] All hackathons appear in sitemap
- [ ] All public profiles appear in sitemap
- [ ] Blog posts and docs included
- [ ] URLs are absolute (not relative)
- [ ] `lastModified` dates are valid
- [ ] Total generation time < 5 seconds
- [ ] robots.txt references sitemap correctly
- [ ] Sitemap validates at [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [ ] Google Search Console accepts sitemap

**Validation Tools**:
- [Google Search Console Sitemap Tester](https://search.google.com/search-console)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- `curl https://stackpass.app/sitemap.xml` (manual inspection)

---

## Performance Benchmarks

Target performance for sitemap generation:

| Content Type | Estimated Count | Query Time | Priority |
|--------------|----------------|------------|----------|
| Static pages | 10 | 0ms | 0.8-1.0 |
| Policy pages | 4 | 0ms | 0.5 |
| Hackathons | 100-500 | <500ms | 0.8 |
| Profiles | 5,000-10,000 | <2s | 0.7 |
| Blog posts | 50-100 | <100ms | 0.6 |
| Docs pages | 50-100 | <100ms | 0.7 |
| **Total** | **~15K-20K** | **<3s** | - |

**Scaling Plan**: If profiles exceed 30K, implement sitemap index (Contract 2).
