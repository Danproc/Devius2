# EXACT LAYOUT SPECIFICATION - DevCard V2

**Reference**: `specs/001-devcard-platform/design/Exact-Layout.png`

## CRITICAL ISSUES TO FIX

### 1. Font Weight - Name is Too Heavy
```tsx
// WRONG:
<h1 className="text-4xl font-bold"> or font-semibold

// CORRECT:
<h1 className="text-4xl font-medium text-[#dde3ed]">Dan Proctor</h1>
```

### 2. Missing Member ID Badge
```tsx
// Name section should be:
<div className="flex items-center justify-center gap-3">
  <h1 className="text-4xl font-medium text-[#dde3ed]">Dan Proctor</h1>
  <span className="text-2xl font-medium text-[#5b6a7f]">#1</span>
</div>
```

### 3. Top Languages - WRONG FORMAT
Currently using progress bars ❌
Should use **pills/tags with colored dots** ✅

```tsx
// CORRECT FORMAT (from mockup):
<div className="flex flex-wrap gap-3">
  {/* Row 1 */}
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-[#3178c6]"></div>
    <span className="text-[#dde3ed]">TypeScript</span>
    <span className="text-[#5b6a7f]">65.5%</span>
  </div>

  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-[#f7df1e]"></div>
    <span className="text-[#dde3ed]">Javascript</span>
    <span className="text-[#5b6a7f]">12.2%</span>
  </div>

  {/* Row 2 */}
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-[#89e051]"></div>
    <span className="text-[#dde3ed]">Shell</span>
    <span className="text-[#5b6a7f]">6.1%</span>
  </div>

  {/* etc */}
</div>
```

### 4. Separate Cards - CRITICAL LAYOUT FIX

The layout has **3 SEPARATE CARDS** with spacing between them:

```tsx
// Page structure:
<main className="min-h-screen bg-[#04080f] py-12 px-4">
  <div className="max-w-2xl mx-auto space-y-6">

    {/* CARD 1: Profile/Connect Card */}
    <div className="bg-[#04080f] border border-[#121824] rounded-3xl p-8">
      {/* Premium badge (absolute top-right) */}
      {/* Avatar */}
      {/* Name + #1 */}
      {/* Bio */}
      {/* Location + Social links */}
      {/* Connect button */}
      {/* Connected developers */}
    </div>

    {/* GAP */}

    {/* CARD 2: GitHub Stats Card */}
    <div className="bg-[#04080f] border border-[#121824] rounded-3xl p-8">
      {/* Header: @danproc + GitHub Profile button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GithubIcon className="w-5 h-5 text-[#dde3ed]" />
          <span className="text-[#dde3ed]">@danproc</span>
        </div>
        <button className="bg-[#1cf491] text-black px-4 py-2 rounded-full">
          GitHub Profile
        </button>
      </div>

      {/* Top Languages Section */}
      <div>
        <h3 className="text-lg font-medium text-[#dde3ed]">Top Languages</h3>
        <p className="text-sm text-[#5b6a7f] mb-4">Detected from repositories</p>

        {/* Language pills - 2 rows */}
        <div className="flex flex-wrap gap-3">
          {/* Pills with colored dots */}
        </div>
      </div>
    </div>

    {/* GAP */}

    {/* SECTION HEADING */}
    <div className="text-center">
      <h2 className="text-2xl font-medium text-[#dde3ed]">Featured Repositories</h2>
      <p className="text-sm text-[#5b6a7f]">GitHub Projects</p>
    </div>

    {/* CARD 3: Repository Card (one card per repo) */}
    <div className="bg-[#04080f] border border-[#121824] rounded-3xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-medium text-[#dde3ed]">Devius</h3>
          <div className="flex items-center gap-3 text-sm text-[#5b6a7f] mt-1">
            <span>🌐 devius.ai</span>
            <span>⭐ 11</span>
          </div>
        </div>
        <button className="bg-[#1cf491] text-black px-4 py-2 rounded-full text-sm">
          Visit Repo
        </button>
      </div>
      <p className="text-[#5b6a7f]">Lorem ipsum description...</p>

      {/* Bottom green button (View Project) */}
      <button className="w-full bg-[#1cf491] text-black py-3 rounded-full font-medium mt-6">
        View Project
      </button>
    </div>

    {/* More repo cards... */}

  </div>
</main>
```

## TYPOGRAPHY CORRECTIONS

### Name + Member ID
```tsx
<div className="flex items-center justify-center gap-3 mt-6">
  <h1 className="text-4xl font-medium text-[#dde3ed]">Dan Proctor</h1>
  <span className="text-2xl font-medium text-[#5b6a7f]">#1</span>
</div>
```
**Note**: `font-medium` NOT `font-bold` or `font-semibold`

### Bio Text
```tsx
<p className="text-base text-[#5b6a7f] text-center max-w-lg mx-auto mt-4 leading-relaxed">
  {bio || "Lorem ipsum dolor sit amet..."}
</p>
```

### Section Headings
```tsx
// "Top Languages", "Featured Repositories"
<h2 className="text-lg font-medium text-[#dde3ed]">Top Languages</h2>
// NOT font-bold, NOT font-semibold
```

## GITHUB DATA SYNCING ISSUE

Check why GitHub stats aren't loading:

1. **Verify data fetch** in `src/lib/devcard/generate.ts`:
   - Should call `fetchGitHubProfile(userId)`
   - Should call `fetchUserRepositories(userId)`
   - Should call `calculateCompleteStats(userId)`

2. **Check cache** - Might be failing silently:
   ```
   Vercel KV not configured. Caching is disabled.
   ```
   This is OK - should fall back to direct API calls

3. **Check Octokit client** - Access token might be missing

4. **Debug**: Add console.logs to `generate.ts` to see what's being fetched

## SPACING

- Gap between cards: `space-y-6` (24px)
- Padding inside cards: `p-8` (32px)
- Gap between elements: `gap-4` (16px) or `gap-6` (24px)
- Max width: `max-w-2xl` (672px)

## SUMMARY OF FIXES NEEDED

1. ✅ Colors already correct
2. ❌ Font weight too heavy → Change to `font-medium`
3. ❌ Missing "#1" badge → Add next to name
4. ❌ Top Languages wrong format → Change from progress bars to pills with dots
5. ❌ Cards not separated → Split into 3 separate cards with gaps
6. ❌ GitHub stats not syncing → Debug data fetching
7. ❌ Connect button should say "Connect with [Name]" not generic text

---

**Next Step**: Have Claude Code Web implement these exact fixes.
