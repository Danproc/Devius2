# Metadata API Contract

**Feature**: 003-seo-optimization
**Type**: Next.js Page Metadata (not REST API)

---

## Overview

Metadata generation is handled by Next.js App Router's built-in Metadata API. Pages export either static `metadata` objects or dynamic `generateMetadata()` functions.

---

## Contract 1: Static Page Metadata

**Pattern**: Static pages (landing, about, pricing, etc.)

**Implementation**:
```typescript
// src/app/(website-layout)/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - StackPass',
  description: 'Learn about StackPass, the GitHub-powered developer networking platform.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about`
  },
  openGraph: {
    title: 'About - StackPass',
    description: 'Learn about StackPass, the GitHub-powered developer networking platform.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
    type: 'website',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og.png`]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - StackPass',
    description: 'Learn about StackPass, the GitHub-powered developer networking platform.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og.png`]
  }
};
```

**Output Format**: Next.js automatically renders as HTML `<meta>` tags

**Validation**:
- `title`: 1-60 characters
- `description`: 1-160 characters
- All URLs must be absolute (include protocol and domain)
- OG images must be 1200x630px

---

## Contract 2: Dynamic Hackathon Metadata

**Pattern**: Hackathon detail pages with dynamic content

**Endpoint**: `src/app/(website-layout)/hackathons/[slug]/page.tsx`

**Input**:
- Route parameter: `params.slug` (string)

**Implementation**:
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch hackathon data
  const hackathon = await getHackathon(params.slug);

  if (!hackathon) {
    return {
      title: 'Hackathon Not Found - StackPass',
      description: 'The requested hackathon could not be found.'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const url = `${baseUrl}/hackathons/${hackathon.slug}`;
  const ogImageUrl = `/api/og/hackathon?title=${encodeURIComponent(hackathon.title)}&prize=${hackathon.prizes.first}`;

  return {
    title: `${hackathon.title} - StackPass Hackathons`,
    description: hackathon.description.slice(0, 160),
    alternates: {
      canonical: url
    },
    openGraph: {
      title: hackathon.title,
      description: hackathon.description.slice(0, 160),
      url,
      type: 'website',
      images: [ogImageUrl]
    },
    twitter: {
      card: 'summary_large_image',
      title: hackathon.title,
      description: hackathon.description.slice(0, 160),
      images: [ogImageUrl]
    }
  };
}
```

**Output Format**: Next.js `Metadata` object

**Data Requirements**:
- Must fetch: `title`, `description`, `slug`, `prizes`
- Optional: `theme`, `start_at` for enhanced descriptions

**Validation**:
- Description truncated to 160 chars
- Title includes branding: "[Hackathon Title] - StackPass Hackathons"
- OG image URL properly encoded
- Canonical URL matches page URL

---

## Contract 3: Dynamic Profile Metadata

**Pattern**: User profile pages with dynamic content

**Endpoint**: `src/app/(public)/[username]/page.tsx`

**Input**:
- Route parameter: `params.username` (string, url_slug)

**Implementation**:
```typescript
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  // Fetch profile data
  const profile = await getPublicProfile(params.username);

  if (!profile) {
    return {
      title: 'Profile Not Found - StackPass',
      description: 'The requested profile could not be found.'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const url = `${baseUrl}/${profile.url_slug}`;
  const displayName = profile.display_name || profile.github_username;
  const bio = profile.custom_bio || `Check out ${displayName}'s developer profile on StackPass.`;

  return {
    title: `${displayName} - StackPass Developer Profile`,
    description: bio.slice(0, 160),
    alternates: {
      canonical: url
    },
    openGraph: {
      title: `${displayName} - Developer Profile`,
      description: bio.slice(0, 160),
      url,
      type: 'profile',
      images: [profile.avatar_url]
    },
    twitter: {
      card: 'summary',
      title: `${displayName} - Developer Profile`,
      description: bio.slice(0, 160),
      images: [profile.avatar_url]
    }
  };
}
```

**Output Format**: Next.js `Metadata` object

**Data Requirements**:
- Must fetch: `url_slug`, `display_name`, `github_username`, `avatar_url`, `custom_bio`, `is_public`
- Fallback bio if `custom_bio` is null

**Validation**:
- Bio truncated to 160 chars
- Display name defaults to GitHub username if not set
- OG type is 'profile' (not 'website')
- Twitter card is 'summary' (not 'summary_large_image' - avatar is square)

---

## Contract 4: Root Layout Metadata

**Pattern**: Base metadata inherited by all pages

**Endpoint**: `src/app/layout.tsx`

**Implementation**:
```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | StackPass',
    default: 'StackPass - GitHub-Powered Developer Profiles'
  },
  description: 'GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.',
  keywords: ['StackPass', 'Developer Profiles', 'GitHub Integration', 'Hackathons', 'Developer Networking'],
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

**Output Format**: Base metadata merged with page-specific metadata

**Notes**:
- `title.template` allows child pages to use `%s` placeholder
- Root metadata is inherited and can be overridden by child pages

---

## Helper Utilities

### generatePageMetadata()

**Location**: `src/lib/seo/metadata.ts`

**Signature**:
```typescript
function generatePageMetadata(config: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'profile';
}): Metadata
```

**Purpose**: Standardize metadata generation with fallbacks

**Example**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const hackathon = await getHackathon(params.slug);

  return generatePageMetadata({
    title: `${hackathon.title} - StackPass Hackathons`,
    description: hackathon.description,
    path: `/hackathons/${hackathon.slug}`,
    ogImage: `/api/og/hackathon?title=${encodeURIComponent(hackathon.title)}&prize=${hackathon.prizes.first}`,
    type: 'website'
  });
}
```

---

## Error Handling

### Missing Data
- If hackathon/profile not found: Return fallback metadata with "Not Found" messaging
- Never throw errors in `generateMetadata()` (breaks page rendering)

### Invalid Characters
- URL encode all query parameters (titles, bios)
- Sanitize user-generated content in descriptions

### Environment Variables
- Always check `process.env.NEXT_PUBLIC_APP_URL` exists
- Provide fallback for local development: `http://localhost:3000`

---

## Performance Considerations

### Caching
- Metadata generation runs on every request (server-side)
- Combine metadata queries with existing page data queries (avoid extra DB calls)
- Use existing ISR revalidation periods

### Query Optimization
```typescript
// BAD: Separate metadata query
const hackathon = await getHackathon(slug);  // Page query
const metadataHackathon = await getHackathon(slug);  // Duplicate!

// GOOD: Reuse page data
const hackathon = await getHackathon(slug);
// Use hackathon data for both page rendering AND metadata
```

---

## Testing Checklist

- [ ] Static pages have valid metadata (title, description, OG tags)
- [ ] Dynamic pages generate metadata correctly
- [ ] Missing hackathon/profile returns fallback metadata
- [ ] Titles are 60 chars or less
- [ ] Descriptions are 160 chars or less
- [ ] All URLs are absolute (not relative)
- [ ] OG images are 1200x630px
- [ ] Twitter cards display correctly in validators
- [ ] No duplicate `<meta>` tags (Next.js deduplication works)

**Validation Tools**:
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- Chrome DevTools > Elements > `<head>` section
