# Research: SEO Optimization

**Feature**: 003-seo-optimization
**Date**: 2025-11-21
**Purpose**: Resolve technical unknowns and document best practices for implementing comprehensive SEO in Next.js 16

---

## 1. Next.js 16 Metadata API

### Decision
Use Next.js App Router Metadata API with `generateMetadata()` for dynamic pages and static `metadata` exports for static pages.

### Rationale
- **Native Integration**: Next.js 16 provides first-class metadata support via `Metadata` type
- **Type Safety**: Full TypeScript support with autocomplete
- **Performance**: Metadata is generated at build time for static pages, runtime for dynamic
- **SEO Best Practices**: Automatically handles deduplication, merging, and proper tag placement

### Implementation Pattern
```typescript
// Static metadata (layout.tsx, static pages)
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: { ... },
  twitter: { ... }
}

// Dynamic metadata (dynamic pages like [slug])
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params.slug);
  return {
    title: data.title,
    description: data.description,
    // ...
  }
}
```

### Alternatives Considered
- **next-seo library**: Already installed but less necessary with native Metadata API. Keep for legacy compatibility if needed.
- **Manual meta tags**: More error-prone, no TypeScript safety, requires manual deduplication.

**Chosen**: Native Metadata API for new implementations, migrate from next-seo gradually.

---

## 2. Dynamic Sitemap Generation

### Decision
Use Next.js `sitemap.ts` file with database queries to dynamically generate sitemap including hackathons and profiles.

### Rationale
- **Native Support**: Next.js provides `MetadataRoute.Sitemap` type
- **Dynamic Updates**: Runs at build time (static export) or request time (dynamic route)
- **Google Compliance**: Properly formatted XML output with lastModified, changeFrequency, priority
- **Performance**: Can implement caching and pagination for large datasets

### Implementation Pattern
```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Fetch dynamic content
  const hackathons = await db.select().from(hackathonsTable).where(eq(hackathonsTable.status, 'active'));
  const profiles = await db.select().from(devcardsTable).where(eq(devcardsTable.is_public, true));

  return [
    // Static pages
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    // Dynamic hackathons
    ...hackathons.map(h => ({
      url: `${baseUrl}/hackathons/${h.slug}`,
      lastModified: h.updated_at,
      changeFrequency: 'daily' as const,
      priority: 0.8
    })),
    // Dynamic profiles
    ...profiles.map(p => ({
      url: `${baseUrl}/${p.url_slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
  ];
}
```

### Sitemap Index Strategy
For scalability beyond 50,000 URLs:
```typescript
// src/app/sitemap.ts - Main index
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/sitemap/static.xml` },
    { url: `${baseUrl}/sitemap/hackathons.xml` },
    { url: `${baseUrl}/sitemap/profiles.xml` }
  ];
}

// src/app/sitemap/[type]/route.ts - Individual sitemaps
```

### Alternatives Considered
- **Static sitemap.xml in public/**: Requires manual updates, no dynamic content
- **Third-party sitemap generators**: Adds dependency, less control
- **next-sitemap package**: Additional package when native solution exists

**Chosen**: Native Next.js sitemap.ts with fallback to sitemap index if URLs exceed 50K.

---

## 3. Structured Data (Schema.org JSON-LD)

### Decision
Implement JSON-LD structured data using a reusable `StructuredData` component that accepts schema objects and renders them in `<script type="application/ld+json">`.

### Rationale
- **Google Preferred Format**: JSON-LD is recommended over Microdata or RDFa
- **Separation of Concerns**: Keeps structured data separate from HTML markup
- **Type Safety**: Can create TypeScript interfaces for schema types
- **Reusability**: Single component for all schema types (Organization, Event, Person, BreadcrumbList)

### Implementation Pattern
```typescript
// components/seo/StructuredData.tsx
export function StructuredData({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Usage in page.tsx
<StructuredData schema={{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": hackathon.title,
  "startDate": hackathon.start_at,
  "endDate": hackathon.submission_deadline_at,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "organizer": {
    "@type": "Organization",
    "name": "StackPass"
  }
}} />
```

### Schema Types Needed
1. **Organization** (Root/Homepage):
   - `@type: Organization`
   - name, url, logo, sameAs (social links)

2. **Event** (Hackathon Pages):
   - `@type: Event`
   - name, description, startDate, endDate, eventStatus, eventAttendanceMode, location (virtual), offers (prizes), organizer

3. **Person** (Profile Pages):
   - `@type: Person`
   - name, image, description (bio), url, sameAs (GitHub, social links)

4. **BreadcrumbList** (Navigation):
   - `@type: BreadcrumbList`
   - itemListElement array with position, name, item (URL)

### Alternatives Considered
- **Microdata in HTML**: More verbose, mixed with markup, harder to maintain
- **schema-dts package**: Adds 1MB+ to bundle, overkill for our use case
- **Manual JSON in head**: Works but component provides reusability and testing

**Chosen**: Custom StructuredData component with TypeScript interfaces for type safety.

---

## 4. Dynamic OG Image Generation

### Decision
Use `@vercel/og` (already installed) to generate dynamic Open Graph images for hackathons and profiles.

### Rationale
- **Already Installed**: @vercel/og 0.6.8 in dependencies
- **Vercel Optimized**: Runs on Edge Runtime, fast generation
- **Tailwind Support**: Can use Tailwind classes in image generation
- **1200x630 Standard**: Outputs correct size for social platforms

### Implementation Pattern
```typescript
// src/app/api/og/hackathon/route.tsx
import { ImageResponse } from '@vercel/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const prize = searchParams.get('prize');

  return new ImageResponse(
    (
      <div style={{ /* Tailwind-like styles */ }}>
        <h1>{title}</h1>
        <p>Prize: ${prize}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

// Usage in metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const hackathon = await getHackathon(params.slug);
  return {
    openGraph: {
      images: [`/api/og/hackathon?title=${hackathon.title}&prize=${hackathon.prizes.first}`]
    }
  };
}
```

### Fallback Strategy
- **Generic OG Image**: Use existing `/public/images/og.png` as fallback
- **Error Handling**: If dynamic generation fails, fall back to generic image
- **Caching**: Vercel Edge automatically caches generated images

### Alternatives Considered
- **Cloudinary**: External service, additional cost, API complexity
- **Canvas API**: Server-side canvas rendering, heavier dependencies
- **Pre-generated images**: Not dynamic, requires storage for each page

**Chosen**: @vercel/og with fallback to generic image on error.

---

## 5. Robots.txt Implementation

### Decision
Use Next.js `robots.ts` file to dynamically generate robots.txt with environment-aware rules.

### Rationale
- **Native Support**: Next.js MetadataRoute.Robots type
- **Environment Aware**: Can disable crawling in staging/preview environments
- **Dynamic Rules**: Can programmatically add/remove disallow rules
- **Sitemap Reference**: Automatically includes sitemap location

### Implementation Pattern
```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/', '/admin/', '/super-admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### Alternatives Considered
- **Static robots.txt in public/**: Less flexible, no environment awareness
- **Middleware-based generation**: Over-engineered for this use case

**Chosen**: Native robots.ts for simplicity and environment flexibility.

---

## 6. Error Pages (404, 500)

### Decision
Create custom `not-found.tsx` and `error.tsx` at root level using Next.js special files.

### Rationale
- **Native Support**: Next.js automatically uses these files
- **Proper Status Codes**: not-found.tsx returns 404, error.tsx returns 500
- **SEO Safe**: Prevents soft 404 errors (200 status on missing pages)
- **Brand Consistency**: Matches StackPass design system

### Implementation Pattern
```typescript
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="bg-devcard-base min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-devcard-heading">404</h1>
        <p className="text-devcard-text">Page not found</p>
        <Link href="/" className="text-devcard-green">Back to Home</Link>
      </div>
    </div>
  );
}

// src/app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-devcard-base min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-devcard-heading">500</h1>
        <p className="text-devcard-text">Something went wrong</p>
        <button onClick={reset} className="text-devcard-green">Try again</button>
      </div>
    </div>
  );
}
```

### Alternatives Considered
- **Generic error pages**: Poor UX, no brand consistency
- **Redirect to home**: Loses context, confusing for users
- **API-based error handling**: Doesn't cover page-level errors

**Chosen**: Native Next.js special files with StackPass design system styling.

---

## 7. ISR and Performance Considerations

### Decision
Maintain existing ISR revalidation periods and use `next/image` priority for above-fold images.

### Rationale
- **Existing Strategy**: Hackathons browse: 600s, detail: 60s works well
- **SEO Balance**: Freshness vs. performance already optimized
- **LCP Optimization**: Priority images improve Largest Contentful Paint
- **No Breaking Changes**: Maintains current performance characteristics

### Implementation Pattern
```typescript
// Existing revalidation (keep as-is)
export const revalidate = 600; // hackathons browse
export const revalidate = 60;  // hackathon detail

// Add priority to hero images
<Image
  src={hackathon.image}
  alt={hackathon.title}
  priority={true}  // Adds fetchpriority="high"
  width={1200}
  height={630}
/>
```

### Performance Checklist
- ✅ Remove console.log from production (FR-030)
- ✅ Use next/image for all images
- ✅ Priority flag for above-fold images
- ✅ Minimize metadata generation queries (combine with existing page queries)

**Chosen**: Maintain existing ISR, add image priority flags, audit console.logs.

---

## 8. Breadcrumbs Navigation

### Decision
Create reusable `Breadcrumbs` component that generates both visual navigation and BreadcrumbList structured data.

### Rationale
- **Dual Purpose**: Single component for UX and SEO
- **Type Safety**: TypeScript interface for breadcrumb items
- **Consistency**: Same breadcrumbs across all pages
- **Schema Integration**: Automatically generates JSON-LD

### Implementation Pattern
```typescript
// components/seo/Breadcrumbs.tsx
interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${process.env.NEXT_PUBLIC_APP_URL}${item.href}`
    }))
  };

  return (
    <>
      <StructuredData schema={schema} />
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-2 text-sm text-devcard-text">
          {items.map((item, i) => (
            <li key={item.href}>
              {i < items.length - 1 ? (
                <><Link href={item.href}>{item.label}</Link> / </>
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

// Usage
<Breadcrumbs items={[
  { label: 'Home', href: '/' },
  { label: 'Hackathons', href: '/hackathons' },
  { label: hackathon.title, href: `/hackathons/${hackathon.slug}` }
]} />
```

**Chosen**: Combined visual + structured data component for maintainability.

---

## 9. Metadata Generation Utilities

### Decision
Create centralized metadata helper functions in `lib/seo/metadata.ts` to standardize metadata across pages.

### Rationale
- **DRY Principle**: Reuse common metadata patterns
- **Consistency**: Same fallbacks, character limits, URL formatting
- **Type Safety**: TypeScript ensures correct metadata structure
- **Testing**: Centralized functions easier to unit test

### Implementation Pattern
```typescript
// lib/seo/metadata.ts
export function generatePageMetadata({
  title,
  description,
  path,
  ogImage,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const url = `${baseUrl}${path}`;
  const defaultOgImage = `${baseUrl}/images/og.png`;

  return {
    title,
    description: description.slice(0, 160), // Enforce limit
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url,
      type: 'website',
      images: [ogImage || defaultOgImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 160),
      images: [ogImage || defaultOgImage],
    },
  };
}

export function generateHackathonMetadata(hackathon: Hackathon): Metadata {
  return generatePageMetadata({
    title: `${hackathon.title} - StackPass Hackathons`,
    description: hackathon.description,
    path: `/hackathons/${hackathon.slug}`,
    ogImage: `/api/og/hackathon?title=${encodeURIComponent(hackathon.title)}&prize=${hackathon.prizes.first}`,
  });
}
```

**Chosen**: Centralized utilities with page-specific wrapper functions.

---

## Summary of Technology Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Metadata | Next.js Metadata API | Native, type-safe, automatic deduplication |
| Sitemap | Next.js sitemap.ts | Native support, dynamic generation, Google compliant |
| Structured Data | Custom StructuredData component + JSON-LD | Google preferred, separation of concerns |
| OG Images | @vercel/og | Already installed, Edge runtime, Vercel optimized |
| Robots.txt | Next.js robots.ts | Native, environment-aware |
| Error Pages | not-found.tsx, error.tsx | Native, proper status codes, brand consistency |
| Performance | Existing ISR + priority images | Maintains current performance, optimizes LCP |
| Breadcrumbs | Custom component with schema | Dual UX + SEO benefit |
| Utilities | lib/seo/ modules | DRY, testable, consistent |

## Open Questions Resolved
✅ How to generate dynamic metadata? → Next.js generateMetadata()
✅ How to handle 50K+ URLs in sitemap? → Sitemap index pattern
✅ Which structured data format? → JSON-LD via component
✅ How to generate OG images? → @vercel/og API routes
✅ How to create error pages? → Next.js special files
✅ ISR strategy? → Maintain existing, add image priority

All technical unknowns have been resolved. Ready for Phase 1: Design.
