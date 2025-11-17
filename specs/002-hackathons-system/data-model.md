# Data Model: StackPass Hackathons

**Feature**: StackPass Hackathons
**Branch**: 002-hackathons-system
**Date**: 2025-11-17

## Overview

This document defines the database schema for the StackPass Hackathons feature, including new tables and extensions to existing tables.

---

## New Tables

### hackathons

Stores hackathon event data, lifecycle status, and prize configuration.

**Fields**:
- `id` (uuid, PK) - Unique identifier
- `slug` (text, unique) - URL-safe identifier (e.g., "build-a-tool-2025-01")
- `title` (text, not null) - Display name (e.g., "Build a Developer Tool")
- `theme` (text, nullable) - Short theme description (e.g., "CLI tools, APIs, libraries")
- `description` (text, not null) - Full hackathon description and rules
- `rules` (text, nullable) - Detailed rules markdown
- `status` (enum, not null) - Current lifecycle state
  - Values: `draft`, `upcoming`, `active`, `voting`, `completed`
- `start_at` (timestamptz, not null) - Hackathon begins
- `submission_deadline_at` (timestamptz, not null) - Last moment to submit
- `voting_start_at` (timestamptz, nullable) - Community voting opens
- `voting_end_at` (timestamptz, nullable) - Community voting closes
- `prizes` (jsonb, not null) - Prize structure
  - Schema: `{ currency: "USD", first: 500, second: 300, third: 200 }`
- `max_participants` (integer, nullable) - Cap on entries (null = unlimited)
- `created_by` (uuid, FK → users.id) - Admin who created event
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Indexes**:
- Primary key on `id`
- Unique on `slug`
- Index on `status` for filtering active/upcoming events
- Index on `created_by` for admin dashboard

**Constraints**:
- `submission_deadline_at` > `start_at`
- `voting_start_at` >= `submission_deadline_at` (if not null)
- `voting_end_at` > `voting_start_at` (if both not null)

---

### hackathon_teams

Stores finalized teams participating in hackathons.

**Fields**:
- `id` (uuid, PK) - Unique team identifier
- `hackathon_id` (uuid, FK → hackathons.id, cascade delete) - Which event
- `team_name` (text, nullable) - Optional custom name (defaults to submission title)
- `creator_user_id` (uuid, FK → users.id) - User who created team
- `members` (jsonb, not null) - Array of user IDs
  - Schema: `[{user_id: uuid, joined_at: timestamp}]`
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Indexes**:
- Primary key on `id`
- Index on `hackathon_id` for listing teams in an event
- Index on `creator_user_id` for "my teams" view
- GIN index on `members` JSONB for finding teams by member

**Constraints**:
- `members` array length between 1 and 5
- Creator must be in members array

**Relationships**:
- Many teams per hackathon (1:N)
- One creator per team (N:1 to users)
- Many members per team (stored as JSONB array of user_ids)

---

### hackathon_team_invites

Tracks pending team invitations (before team is finalized).

**Fields**:
- `id` (uuid, PK) - Invite identifier
- `team_id` (uuid, FK → hackathon_teams.id, cascade delete) - Which team
- `inviter_user_id` (uuid, FK → users.id) - Who sent invite
- `invitee_user_id` (uuid, FK → users.id) - Who is being invited
- `status` (enum, not null) - Invite state
  - Values: `pending`, `accepted`, `declined`, `expired`
- `created_at` (timestamptz, default now())
- `responded_at` (timestamptz, nullable) - When accepted/declined

**Indexes**:
- Primary key on `id`
- Index on `invitee_user_id` for "my invites" inbox
- Composite index on `(team_id, status)` for pending invite counts

**Constraints**:
- Unique on `(team_id, invitee_user_id)` - prevent duplicate invites
- `inviter_user_id` != `invitee_user_id` - cannot invite yourself

**Relationships**:
- Many invites per team (1:N)
- One inviter per invite (N:1 to users)
- One invitee per invite (N:1 to users)

---

### hackathon_submissions

Stores project submissions for hackathons.

**Fields**:
- `id` (uuid, PK) - Submission identifier
- `hackathon_id` (uuid, FK → hackathons.id, cascade delete) - Which event
- `team_id` (uuid, FK → hackathon_teams.id, nullable) - Team (null if solo)
- `user_id` (uuid, FK → users.id) - Solo submitter OR team captain (if team_id not null)
- `project_title` (text, not null) - Project name
- `description` (text, not null, max 5000 chars) - Full project description
- `github_url` (text, not null) - Repository URL
- `demo_url` (text, nullable) - Live demo link
- `video_url` (text, nullable) - Demo video (YouTube, Loom, etc.)
- `tech_stack` (jsonb, not null) - Array of tech tags
  - Schema: `["React", "TypeScript", "Node.js"]`
- `status` (enum, not null) - Submission lifecycle
  - Values: `draft`, `submitted`, `disqualified`, `winner_first`, `winner_second`, `winner_third`
- `placement` (integer, nullable) - Final placement (1, 2, 3, or null)
- `vote_count` (integer, default 0) - Cached vote total
- `submitted_at` (timestamptz, nullable) - When status changed to "submitted"
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Indexes**:
- Primary key on `id`
- Index on `hackathon_id` for listing submissions
- Index on `user_id` for "my submissions"
- Index on `team_id` for team submissions
- Composite index on `(hackathon_id, placement)` for winner queries
- Index on `vote_count DESC` for sorting by popularity

**Constraints**:
- Unique on `(hackathon_id, team_id)` OR `(hackathon_id, user_id)` - one submission per team/user per event
- `placement` in (1, 2, 3, null)
- Either `team_id` is set OR it's a solo submission (user_id only)

**Relationships**:
- Many submissions per hackathon (1:N)
- One submission per team per hackathon (1:1 for that event)
- Submissions link to users (solo) or teams (collaborative)

---

### hackathon_votes

Tracks community votes on submissions.

**Fields**:
- `id` (uuid, PK) - Vote identifier
- `hackathon_id` (uuid, FK → hackathons.id, cascade delete) - Which event
- `submission_id` (uuid, FK → hackathon_submissions.id, cascade delete) - Which project
- `voter_user_id` (uuid, FK → users.id, cascade delete) - Who voted
- `created_at` (timestamptz, default now())

**Indexes**:
- Primary key on `id`
- Composite index on `(submission_id, created_at DESC)` for recent votes
- Index on `voter_user_id` for "my votes" view

**Constraints**:
- Unique on `(hackathon_id, submission_id, voter_user_id)` - one vote per user per submission
- Voter cannot be member of the submission's team (enforced via RLS or app logic)

**Relationships**:
- Many votes per hackathon (1:N)
- Many votes per submission (1:N)
- One voter per vote (N:1 to users)

---

### hackathon_badges

Stores permanent achievement badges for hackathon winners.

**Fields**:
- `id` (uuid, PK) - Badge identifier
- `user_id` (uuid, FK → users.id, cascade delete) - Badge recipient
- `hackathon_id` (uuid, FK → hackathons.id) - Which event
- `submission_id` (uuid, FK → hackathon_submissions.id) - Winning submission
- `badge_type` (enum, not null) - Badge tier
  - Values: `gold`, `silver`, `bronze`
- `awarded_at` (timestamptz, default now())

**Indexes**:
- Primary key on `id`
- Composite index on `(user_id, awarded_at DESC)` for profile badge display
- Index on `hackathon_id` for event winner queries

**Constraints**:
- Badge type must match submission placement (gold=1st, silver=2nd, bronze=3rd)

**Relationships**:
- Many badges per user (1:N) - users can win multiple hackathons
- One badge per user per hackathon (enforced by unique submission per hackathon)
- Badges link to winning submission and hackathon for context

---

## Extensions to Existing Tables

### users (No changes required)

**Current Structure**: Already has `id`, `email`, `name`, likely has `is_super_admin` or `role` field

**Used By Hackathons**:
- Foreign keys from teams, submissions, votes, badges
- Admin authorization via `is_super_admin` check
- Pro membership check via existing subscription/plan logic

**No Schema Changes Needed**: Badges queried by user_id, no new columns required

---

### devcards (No schema changes, query-time joins)

**Current Structure**: User profiles with `user_id`, `github_username`, `avatar_url`, etc.

**Integration**:
- When loading profile, LEFT JOIN `hackathon_badges` ON `user_id`
- Display badges in new "Achievements" UI section
- Badge count can be computed: `SELECT COUNT(*) FROM hackathon_badges WHERE user_id = X`

**No Schema Changes Needed**: Badges are separate table, joined on read

---

## Entity Relationships Diagram (Conceptual)

```
users (existing)
  ├─→ hackathons (created_by)
  ├─→ hackathon_teams (creator, members array)
  ├─→ hackathon_submissions (user_id for solo)
  ├─→ hackathon_votes (voter_user_id)
  └─→ hackathon_badges (user_id)

hackathons
  ├─→ hackathon_teams (hackathon_id)
  ├─→ hackathon_submissions (hackathon_id)
  ├─→ hackathon_votes (hackathon_id)
  └─→ hackathon_badges (hackathon_id)

hackathon_teams
  ├─→ hackathon_team_invites (team_id)
  └─→ hackathon_submissions (team_id)

hackathon_submissions
  ├─→ hackathon_votes (submission_id)
  └─→ hackathon_badges (submission_id)
```

---

## Data Validation Rules

### hackathons

- `slug`: lowercase, alphanumeric + hyphens only, 3-50 chars
- `title`: 3-100 chars
- `description`: 10-5000 chars
- `start_at`: must be future date when creating (can be past for historical events)
- `prizes.first|second|third`: positive integers >= 0

### hackathon_teams

- `team_name`: 2-50 chars if provided
- `members`: array length 1-5, all must be valid user UUIDs

### hackathon_submissions

- `project_title`: 3-100 chars
- `description`: 10-5000 chars
- `github_url`: valid GitHub repo URL format
- `demo_url`: valid HTTP/HTTPS URL if provided
- `tech_stack`: array of 1-10 tags, each 2-30 chars

### hackathon_votes

- `voter_user_id` must be Pro member
- `voter_user_id` not in submission's team members

---

## State Machines

### Hackathon Status Flow

```
draft → upcoming → active → voting → completed
         ↓          ↓         ↓
       (publish)  (start)  (deadline)  (declare winners)
```

**Transitions**:
- `draft` → `upcoming`: Admin clicks "Publish" (if start_at is future)
- `draft` → `active`: Admin clicks "Publish" (if start_at is now/past)
- `upcoming` → `active`: Auto-transition when start_at timestamp reached
- `active` → `voting`: Auto-transition when submission_deadline_at reached
- `voting` → `completed`: Admin clicks "Declare Winners"

### Submission Status Flow

```
draft → submitted → (disqualified OR winner_first|second|third)
```

**Transitions**:
- `draft` → `submitted`: User clicks "Finalize Submission"
- `submitted` → `disqualified`: Admin manually flags invalid submission
- `submitted` → `winner_*`: Admin declares winners

---

## Query Patterns

### Common Queries

**1. Load active hackathons for Pro member:**
```sql
SELECT * FROM hackathons
WHERE status IN ('upcoming', 'active', 'voting')
ORDER BY start_at ASC;
```

**2. Get user's submission for a hackathon:**
```sql
SELECT s.* FROM hackathon_submissions s
LEFT JOIN hackathon_teams t ON s.team_id = t.id
WHERE s.hackathon_id = $1
  AND (s.user_id = $2 OR t.members @> jsonb_build_array($2));
```

**3. Gallery: Get winners for all hackathons:**
```sql
SELECT h.*, s.* FROM hackathon_submissions s
JOIN hackathons h ON s.hackathon_id = h.id
WHERE s.placement IS NOT NULL
ORDER BY h.start_at DESC, s.placement ASC;
```

**4. Profile: Get user's badges:**
```sql
SELECT b.*, h.title, h.slug, s.project_title
FROM hackathon_badges b
JOIN hackathons h ON b.hackathon_id = h.id
JOIN hackathon_submissions s ON b.submission_id = s.id
WHERE b.user_id = $1
ORDER BY b.awarded_at DESC;
```

**5. Voting: Check if user can vote on submission:**
```sql
-- User hasn't voted yet
SELECT 1 FROM hackathon_votes
WHERE submission_id = $1 AND voter_user_id = $2;

-- User not on submission's team
SELECT 1 FROM hackathon_teams t
WHERE t.id = (SELECT team_id FROM hackathon_submissions WHERE id = $1)
  AND t.members @> jsonb_build_array($2);
```

---

## Data Migration Strategy

### Migration Order

1. Create `hackathons` table (no dependencies)
2. Create `hackathon_teams` table (depends on hackathons, users)
3. Create `hackathon_team_invites` table (depends on teams)
4. Create `hackathon_submissions` table (depends on hackathons, teams, users)
5. Create `hackathon_votes` table (depends on submissions, users)
6. Create `hackathon_badges` table (depends on hackathons, submissions, users)

### Rollback Plan

- All tables have cascade delete on foreign keys
- Dropping hackathons table cascades to all child tables
- No changes to existing tables means existing features unaffected

---

## Performance Considerations

### Denormalized Fields for Speed

- `vote_count` on hackathon_submissions (avoid COUNT(*) queries)
- `member_count` could be added to hackathon_teams (computed from JSONB array length)

### Caching Strategy

- Hackathon list: Cache active/upcoming (5-minute TTL)
- Submission counts: Invalidate on new submission
- Vote counts: Real-time acceptable, updated on vote create/delete
- Gallery: Static generation with ISR (1-hour revalidation)

---

## RLS (Row Level Security) Policies

### hackathons

- **SELECT**: All authenticated users can read non-draft hackathons
- **INSERT/UPDATE/DELETE**: Only `is_super_admin = true` users

### hackathon_teams

- **SELECT**: All users can read teams for active/completed hackathons
- **INSERT**: Pro members only, for active hackathons
- **UPDATE**: Team creator only, before submission finalized
- **DELETE**: Team creator only, before submission created

### hackathon_submissions

- **SELECT**: All users can read `submitted` or `winner_*` status submissions during/after voting
- **INSERT**: Pro members only, for active hackathons
- **UPDATE**: Team members only, before submission deadline
- **DELETE**: Not allowed (soft delete via status if needed)

### hackathon_votes

- **SELECT**: Pro members can read all votes for voting/completed hackathons
- **INSERT**: Pro members only, during voting period, cannot vote for own team
- **UPDATE**: Not allowed (votes are immutable once cast)
- **DELETE**: Voter can delete own vote during voting period (to re-vote elsewhere)

### hackathon_badges

- **SELECT**: All users can read (public achievements)
- **INSERT**: System only (triggered by admin winner selection)
- **UPDATE/DELETE**: Not allowed (permanent achievements)

---

## Storage Estimates

### Initial Scale (100 hackathons, 5000 submissions)

- `hackathons`: ~100 rows × 2KB = 200KB
- `hackathon_teams`: ~2500 teams × 1KB = 2.5MB
- `hackathon_team_invites`: ~10,000 invites × 500B = 5MB
- `hackathon_submissions`: ~5000 submissions × 3KB = 15MB
- `hackathon_votes`: ~50,000 votes × 500B = 25MB
- `hackathon_badges`: ~300 badges × 500B = 150KB

**Total**: ~48MB for 100 hackathons

**Projected 1-year growth**: ~500 hackathons, ~25K submissions → ~240MB (well within Postgres limits)

---

## Backup & Data Retention

- **Active Data**: All hackathons, submissions, votes, badges retained indefinitely
- **Soft Deletes**: Use status flags rather than DELETE for audit trail
- **GDPR Compliance**: When user deletes account, cascade deletes their votes/badges per existing user deletion flow
