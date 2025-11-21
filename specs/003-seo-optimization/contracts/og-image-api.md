# OG Image API Contract

**Feature**: 003-seo-optimization
**Type**: REST API (Next.js Route Handler with ImageResponse)

---

## Overview

Dynamic Open Graph image generation using `@vercel/og`. Generates 1200x630px images on-demand for social media previews.

---

## Contract 1: Hackathon OG Image

**Endpoint**: `/api/og/hackathon`

**Method**: GET

**Purpose**: Generate custom OG images for hackathon pages (FR-009)

### Request

**Query Parameters**:
```typescript
{
  title: string;      // Hackathon title (required)
  prize: number;      // First prize amount (required)
  currency?: string;  // Currency code (optional, default: "USD")
  startDate?: string; // ISO date string (optional)
}
```

**Example**:
```
GET /api/og/hackathon?title=Build%20a%20Tool&prize=1000&currency=USD&startDate=2025-12-01
```

### Response

**Success (200)**:
- **Content-Type**: `image/png`
- **Dimensions**: 1200x630px
- **File Size**: <5MB (typically 50-200KB)

**Image Design**:
```
┌─────────────────────────────────────────────────┐
│  STACKPASS HACKATHONS                           │
│                                                 │
│  Build a Tool                                   │
│  ★ First Prize: $1,000                          │
│  🗓️  Starts: Dec 1, 2025                        │
│                                                 │
│  [StackPass Logo]                               │
└─────────────────────────────────────────────────┘
```

### Implementation

```typescript
// src/app/api/og/hackathon/route.tsx
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const title = searchParams.get('title');
    const prize = searchParams.get('prize');
    const currency = searchParams.get('currency') || 'USD';
    const startDate = searchParams.get('startDate');

    // Validation (FR-009)
    if (!title || !prize) {
      return new Response('Missing required parameters: title, prize', { status: 400 });
    }

    // Format prize
    const formattedPrize = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(Number(prize));

    // Format date
    const formattedDate = startDate
      ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

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
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 24, color: '#00ff00', margin: 0, letterSpacing: '0.1em' }}>
              STACKPASS HACKATHONS
            </p>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.2,
                maxWidth: 1000
              }}
            >
              {title}
            </h1>
            <div style={{ display: 'flex', gap: 30, fontSize: 28, color: '#a0a0a0' }}>
              <span style={{ color: '#00ff00' }}>★ First Prize: {formattedPrize}</span>
              {formattedDate && <span>🗓️ Starts: {formattedDate}</span>}
            </div>
          </div>

          {/* Footer */}
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
    console.error('Failed to generate hackathon OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
```

**Error Handling**:
- Missing parameters → 400 Bad Request
- Invalid prize format → 400 Bad Request
- Image generation failure → 500 Internal Server Error, fallback to generic OG image in metadata

**Caching**:
- Vercel Edge automatically caches generated images
- Cache key: Full URL with query parameters
- Cache duration: Indefinite (until deployment/purge)

---

## Contract 2: Profile OG Image

**Endpoint**: `/api/og/profile`

**Method**: GET

**Purpose**: Generate custom OG images for user profiles (FR-010)

### Request

**Query Parameters**:
```typescript
{
  name: string;         // User display name (required)
  bio?: string;         // Short bio (optional, max 100 chars for display)
  avatarUrl?: string;   // User avatar URL (optional)
  techStack?: string;   // Comma-separated tech skills (optional, max 5)
}
```

**Example**:
```
GET /api/og/profile?name=John%20Doe&bio=Full-stack%20developer&avatarUrl=https://...&techStack=React,Node.js,TypeScript
```

### Response

**Success (200)**:
- **Content-Type**: `image/png`
- **Dimensions**: 1200x630px
- **File Size**: <5MB

**Image Design**:
```
┌─────────────────────────────────────────────────┐
│  [Avatar]  JOHN DOE                             │
│            Full-stack developer                 │
│                                                 │
│            React • Node.js • TypeScript         │
│                                                 │
│  STACKPASS DEVELOPER PROFILE                    │
└─────────────────────────────────────────────────┘
```

### Implementation

```typescript
// src/app/api/og/profile/route.tsx
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');
    const bio = searchParams.get('bio');
    const avatarUrl = searchParams.get('avatarUrl');
    const techStack = searchParams.get('techStack')?.split(',').slice(0, 5); // Max 5

    if (!name) {
      return new Response('Missing required parameter: name', { status: 400 });
    }

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
          {/* Main Content */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={name}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  border: '4px solid #00ff00'
                }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h1
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {name}
              </h1>
              {bio && (
                <p style={{ fontSize: 28, color: '#a0a0a0', margin: 0, maxWidth: 900 }}>
                  {bio.slice(0, 100)}
                </p>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          {techStack && techStack.length > 0 && (
            <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
              {techStack.map((tech, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 24,
                    color: '#00ff00',
                    padding: '8px 20px',
                    border: '2px solid #00ff00',
                    borderRadius: 8
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 24, color: '#a0a0a0', letterSpacing: '0.1em' }}>
              STACKPASS DEVELOPER PROFILE
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (error) {
    console.error('Failed to generate profile OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
```

**Note**: Profile OG images are optional. Most profiles will use avatar_url directly as OG image (FR-010). This endpoint is for enhanced social sharing with bio and tech stack.

---

## Contract 3: Generic/Fallback OG Image

**Location**: `/public/images/og.png`

**Purpose**: Fallback image when dynamic generation fails

**Specifications**:
- Dimensions: 1200x630px
- Format: PNG
- File size: <500KB
- Content: StackPass branding, tagline, generic design

**Usage**:
```typescript
// Fallback in metadata
const ogImage = hackathon
  ? `/api/og/hackathon?title=${hackathon.title}&prize=${hackathon.prizes.first}`
  : '/images/og.png'; // Fallback
```

---

## Performance Considerations

### Edge Runtime
```typescript
export const runtime = 'edge';
```
- Runs on Vercel Edge (not Node.js)
- Fast global execution
- Lower cold start times

### Caching Strategy
- Vercel automatically caches ImageResponse outputs
- Cache invalidation: New deployment or manual purge
- No explicit cache headers needed (Vercel handles)

### Image Optimization
- Use `@vercel/og` built-in optimizations
- Avoid complex gradients (slow rendering)
- Limit external image fetches (avatars should be fast URLs)

---

## Testing Checklist

- [ ] Hackathon OG image generates at `/api/og/hackathon?title=Test&prize=1000`
- [ ] Profile OG image generates at `/api/og/profile?name=Test`
- [ ] Images are exactly 1200x630px
- [ ] Images display correctly in Twitter Card Validator
- [ ] Images display correctly in Facebook Sharing Debugger
- [ ] Missing parameters return 400 error
- [ ] Invalid parameters return 400 error
- [ ] Generation errors fall back gracefully
- [ ] Caching works (second request is instant)
- [ ] Edge runtime functions correctly

**Validation Tools**:
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Browser DevTools > Network tab (check image dimensions)
- `curl -I https://stackpass.app/api/og/hackathon?title=Test&prize=1000` (check headers)

---

## Error Handling

### Missing Required Parameters
```typescript
if (!title || !prize) {
  return new Response('Missing required parameters: title, prize', {
    status: 400,
    headers: { 'Content-Type': 'text/plain' }
  });
}
```

### Invalid Number Format
```typescript
const prizeNum = Number(prize);
if (isNaN(prizeNum)) {
  return new Response('Invalid prize format', { status: 400 });
}
```

### External Image Load Failure (avatars)
```typescript
// If avatarUrl fails to load, render without avatar
{avatarUrl && (
  <img
    src={avatarUrl}
    alt={name}
    onError={() => {
      // Edge runtime doesn't support onError, so we don't render broken images
    }}
  />
)}
```

### Image Generation Failure
```typescript
try {
  return new ImageResponse(/* ... */);
} catch (error) {
  console.error('Failed to generate OG image:', error);
  // Return 500, metadata will fall back to /images/og.png
  return new Response('Failed to generate image', { status: 500 });
}
```

---

## Future Enhancements

### Dynamic Background Images
- Fetch hackathon cover images
- Composite over background
- Requires more complex ImageResponse

### QR Codes
- Generate QR code to hackathon page
- Include in bottom corner of OG image

### Animated OG Images
- Not supported by `@vercel/og`
- Would require external service (Cloudinary, etc.)
- Out of scope for initial implementation

---

## API Rate Limits

**Vercel Limits**:
- No explicit rate limits on Edge Functions
- Automatically scaled based on demand
- Cold starts: ~50-100ms
- Warm requests: ~10-20ms

**Recommendation**: No rate limiting needed (Vercel handles scaling).
