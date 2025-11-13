# DevCard Preview Usage Guide

This guide explains how to consistently use DevCard previews across the application.

## Problem Solved

Previously, `CardPreview` was used directly in multiple places with inconsistent props. When we added `custom_projects`, we had to update 4+ different files. This led to:
- Duplicated code
- Inconsistent data passing
- Easy to miss updates in some places

## Solution

We've created helper utilities to standardize DevCard usage:

### 1. `useDevCard` Hook

Fetch the authenticated user's DevCard data consistently:

```tsx
import { useDevCard } from '@/hooks/useDevCard';

function MyComponent() {
  const { devcard, isLoading, mutate } = useDevCard();

  if (isLoading) return <div>Loading...</div>;

  return <div>{devcard.display_name}</div>;
}
```

### 2. `DevCardPreviewWrapper` Component

Use this instead of `CardPreview` directly to ensure all props are passed correctly:

```tsx
import { DevCardPreviewWrapper } from '@/components/devcard/devcard-preview-wrapper';

function MyPage() {
  const { devcard } = useDevCard();

  return (
    <DevCardPreviewWrapper
      devcard={devcard}
      featuredRepos={[]} // optional
      connections={connectionsData} // optional
    />
  );
}
```

## Benefits

1. **Single source of truth**: All DevCard data structure is defined in `DevCardData` interface
2. **Automatic prop passing**: The wrapper handles all the prop mapping
3. **Type safety**: TypeScript ensures you pass the right data
4. **Easy updates**: When adding new fields, update once in the wrapper

## Migration Guide

### Before (Multiple places to update):
```tsx
<CardPreview
  displayName={devcard.display_name}
  githubUsername={devcard.github_username}
  avatarUrl={devcard.avatar_url}
  customBio={devcard.custom_bio}
  location={devcard.location}
  // ... 15+ more props
  customProjects={devcard.custom_projects as any} // Had to add this everywhere!
/>
```

### After (One place to update):
```tsx
<DevCardPreviewWrapper devcard={devcard} />
```

## Current Usage Locations

All CardPreview usages now include `customProjects`:
1. ✅ `/app/dashboard/page.tsx` - Dashboard preview
2. ✅ `/app/card/edit/page.tsx` - Live editor preview
3. ✅ `/app/settings/theme/page.tsx` - Theme preview
4. ✅ `/[username]/page.tsx` - Public profile page

## Future Additions

When adding new fields to DevCard:

1. Update the database schema
2. Update `DevCardData` interface in `devcard-preview-wrapper.tsx`
3. Update `CardPreview` component to accept the new prop
4. Update `DevCardPreviewWrapper` to pass the new prop
5. Done! All usages automatically get the new field ✨

## Example: How We Added Custom Projects

1. Added `custom_projects` to database schema ✅
2. Added to `DevCardData` interface ✅
3. Added prop to `CardPreview` ✅
4. Added mapping in `DevCardPreviewWrapper` ✅
5. All 4 pages automatically showed custom projects! ✅

Without the wrapper, we would have had to update each of the 4 files manually.
