# Research & Technical Decisions: StackPass Hackathons

**Feature**: StackPass Hackathons
**Branch**: 002-hackathons-system
**Date**: 2025-11-17

## Overview

This document captures technical research, decisions, and patterns for implementing the StackPass Hackathons feature within the existing Next.js + Supabase + Stripe stack.

---

## Key Technical Decisions

### 1. Database Schema & Relationships

**Decision**: Use Drizzle ORM with Supabase Postgres, add 5 new tables with foreign key constraints to existing `users` and `devcards` tables

**Rationale**:
- Consistent with existing codebase patterns (already using Drizzle + Supabase)
- Leverages existing RLS policies and authentication
- Foreign keys ensure referential integrity (cascade deletes when users/devcards removed)
- JSONB columns for flexible arrays (team members, tech stack tags, prize structure)

**Alternatives Considered**:
- Separate microservice: Rejected - adds complexity, breaks existing auth/session flow
- NoSQL/MongoDB: Rejected - team already standardized on Postgres
- Embedded in devcards table: Rejected - violates normalization, would bloat existing table

---

### 2. Team Formation & Invitations

**Decision**: Reuse existing connection request pattern with dedicated `hackathon_team_invites` table

**Rationale**:
- Team invites work similarly to connection requests (invite → accept/decline flow)
- Can reuse existing notification infrastructure (emails via Resend)
- Familiar UX pattern for users already using StackPass connections
- Separate table allows tracking pending vs accepted team members

**Alternatives Considered**:
- Magic team links: Rejected - less secure, harder to track who's invited
- Auto-accept teams: Rejected - users should consent to team participation
- External team formation: Rejected - defeats purpose of in-app collaboration

**Implementation Notes**:
- `hackathon_teams` table stores finalized teams
- `hackathon_team_invites` table stores pending invitations
- Team becomes "locked" once submission is created (members can be added but not removed)

---

### 3. Voting System & Anti-Gaming

**Decision**: Database-level unique constraint on (submission_id, voter_user_id) with additional check preventing self-voting

**Rationale**:
- Unique constraint prevents double-voting at database level (not just app layer)
- Cannot vote for own team enforced via SQL query joining team membership
- Vote counts cached/aggregated for performance (avoid count queries on every load)
- Simple majority voting (1 vote = 1 point, no weighted votes in MVP)

**Alternatives Considered**:
- Ranked choice voting: Rejected - too complex for MVP
- Star ratings (1-5): Rejected - votes are binary endorsements for simplicity
- Anonymous voting: Rejected - want transparency (vote counts visible)

**Implementation Notes**:
- Add `vote_count` column to `hackathon_submissions` for performance
- Increment/decrement on vote create/delete (denormalized but fast)
- RLS policy ensures Pro members only can insert votes

---

###  4. Badge Integration with StackPass Profiles

**Decision**: Create separate `hackathon_badges` table with foreign key to `users`, query badges when loading profile, display in new "Achievements" section

**Rationale**:
- Keeps badges normalized (one record per achievement)
- Easy to query all badges for a user: `SELECT * FROM hackathon_badges WHERE user_id = X`
- Can extend later with other badge types (contributor, mentor, etc.)
- Profile component conditionally renders Achievements section if badges exist

**Alternatives Considered**:
- JSONB array in devcards: Rejected - harder to query, doesn't scale, loses relational integrity
- Separate achievements service: Rejected - over-engineering for MVP
- Store in user metadata: Rejected - mixes concerns, harder to filter/search

**Implementation Notes**:
- Profile query joins hackathon_badges on user_id
- Wallet pass generation queries top 3 badges (by tier, then recency)
- Badge component shows hackathon name, placement, date earned

---

### 5. Wallet Pass Badge Display

**Decision**: Add auxiliary field to Apple Wallet pass showing badge summary (e.g., "2x Winner: 1 Gold, 1 Silver"), limit to top 3 most impressive badges to avoid pass bloat

**Rationale**:
- Wallet passes have size limits (~200KB), cannot include full badge details
- Auxiliary field is perfect for short achievement summary
- Summary format: "{count}x Winner" or "{gold_count} Gold, {silver_count} Silver"
- Shows recent wins first (sorted by awarded_at DESC)

**Alternatives Considered**:
- Full badge list: Rejected - would make pass too large
- Badge icons: Rejected - image assets increase pass size significantly
- No badges in pass: Rejected - defeats purpose of portable achievements

**Implementation Notes**:
- Query: `SELECT badge_type, COUNT(*) FROM hackathon_badges WHERE user_id = X GROUP BY badge_type`
- Format: If 1+ Gold → "Hackathon Winner (Gold)", if multiple → "3x Winner: 2 Gold, 1 Silver"
- Fits in existing auxiliary fields structure

---

### 6. Admin Authorization & Role Checking

**Decision**: Check for super_admin role in existing `users` table, create middleware to protect /app/admin routes

**Rationale**:
- Existing codebase likely has admin/role concepts (super-admin users table has is_super_admin flag based on patterns)
- Middleware pattern consistent with Next.js App Router
- Rejects non-admin access at route level (not just UI hiding)

**Alternatives Considered**:
- Separate admin accounts: Rejected - adds auth complexity
- Hard-coded admin list: Rejected - not scalable
- Admin JWT claims: Rejected - requires NextAuth.js changes

**Implementation Notes**:
- Check session user for `is_super_admin = true` flag
- Wrap admin routes in layout with auth check
- Redirect non-admins to /app with error toast

---

### 7. Real-Time Countdown Timers

**Decision**: Client-side React countdown using submission_deadline_at timestamp, no WebSockets needed

**Rationale**:
- Countdowns are client-side calculations from known deadline timestamp
- No server push required (deadline doesn't change)
- Lighter infrastructure vs WebSockets for this use case
- Acceptable if clock skew exists (user's local time, not mission-critical)

**Alternatives Considered**:
- Server-sent events (SSE): Rejected - overkill for static countdowns
- Polling for deadline updates: Rejected - deadline is immutable
- WebSockets: Rejected - unnecessary infrastructure for read-only countdowns

**Implementation Notes**:
- React hook: `useCountdown(deadline)` returns {days, hours, minutes, seconds}
- Update every second using setInterval
- Show "Submissions closed" when deadline passes

---

### 8. Submission Edit Conflict Resolution

**Decision**: Optimistic locking with last-write-wins, no conflict detection in MVP

**Rationale**:
- Team editing conflicts rare (users coordinate externally)
- Complex merge strategies not worth dev time for MVP
- Last-write-wins is simple, predictable behavior
- Can add optimistic locking (version field) in v1.1 if needed

**Alternatives Considered**:
- Pessimistic locking: Rejected - requires lock management, timeouts, complexity
- Operational transform: Rejected - massive over-engineering
- Read-only after first save: Rejected - users need edit flexibility

**Implementation Notes**:
- Show toast "Submission updated" on save
- No conflict warnings in MVP
- Consider adding `version` field later for optimistic locking

---

### 9. GitHub Repository Validation

**Decision**: Validate URL format only (regex for github.com/user/repo), do not verify repo exists or has commits

**Rationale**:
- Trust-based system for MVP (Pro members are paying customers)
- GitHub API calls for verification add latency and hit rate limits
- Broken links caught during admin judging (judges manually verify)
- Can add repo verification in v1.1 as background job

**Alternatives Considered**:
- Real-time GitHub API check: Rejected - slow, rate limits, auth complexity
- Webhook verification: Rejected - requires GitHub App setup
- No validation: Rejected - at least check URL format

**Implementation Notes**:
- Regex: `^https://github\.com/[\w-]+/[\w-]+(/.*)?$`
- Optional: Extract owner/repo name for display
- Admin judging UI can flag "repo not found" errors post-submission

---

### 10. Gallery Performance with Large Datasets

**Decision**: Paginate gallery (20 projects per page), index on (hackathon_id, placement) for fast filtering

**Rationale**:
- Gallery queries will grow over time (100s of winning projects)
- Pagination prevents slow full-table scans
- Index on hackathon_id + placement makes filtered queries instant
- Can add search later if needed

**Alternatives Considered**:
- Infinite scroll: Rejected - pagination clearer for browsing
- Load all winners: Rejected - doesn't scale beyond 50 projects
- Elasticsearch: Rejected - over-engineering for structured data

**Implementation Notes**:
- SQL: `SELECT * FROM hackathon_submissions WHERE placement IS NOT NULL ORDER BY hackathon_id DESC, placement ASC LIMIT 20 OFFSET {page * 20}`
- Frontend: shadcn Pagination component
- Cache gallery pages with revalidation

---

## Unresolved Questions / Future Research

### For v1.1+

- **Prize Automation**: Stripe Connect for automated payouts (requires KYC for winners, tax handling)
- **Real-Time Voting Dashboard**: Consider WebSockets or SSE for live vote counts during voting period
- **GitHub Commit Verification**: Verify work done during hackathon period (requires GitHub App + webhooks)
- **Advanced Search**: Full-text search on project descriptions, tech stack autocomplete
- **Image Uploads**: Allow project screenshots (requires S3 + image optimization pipeline)

---

## Performance Considerations

### Query Optimization

- **Voting Queries**: Denormalized vote_count on submissions table (updated via triggers or app logic)
- **Badge Queries**: Index on (user_id, badge_type) for fast profile lookups
- **Gallery Queries**: Composite index on (hackathon_id, placement) for winner filtering
- **Team Member Queries**: Index on hackathon_teams team_id and user_id for fast member checks

### Caching Strategy

- **Hackathon List**: Cache active/upcoming hackathons (revalidate every 5 minutes)
- **Gallery**: ISR with 1-hour revalidation (winners don't change often)
- **Submission Counts**: Cache per-hackathon counts (refresh on new submission)
- **Vote Counts**: Real-time updates acceptable, no caching needed

---

## Security Considerations

### Access Control Patterns

- **Admin Routes**: Middleware checks `is_super_admin` flag, 403 for non-admins
- **Pro Member Actions**: Check active subscription before entry/submission/voting
- **RLS Policies**: Supabase Row Level Security enforces read/write permissions at database level
- **Vote Integrity**: Unique constraint + RLS prevents vote manipulation

### Data Validation

- **URL Validation**: Regex for GitHub/demo URLs, XSS sanitization on descriptions
- **Team Size Limits**: Enforce 1-5 members at API level + database constraint
- **Submission Limits**: Unique constraint on (hackathon_id, user_id) OR (hackathon_id, team_id)
- **Deadline Enforcement**: Server-side timestamp checks, client countdown is UI only

---

## Integration Points

### Existing Systems to Integrate With

1. **Pro Membership**: Query user's subscription status before allowing hackathon entry
2. **StackPass Profiles**: Join hackathon_badges on user_id when loading profile
3. **Wallet Pass Generation**: Update `generateAppleWalletPass()` to include badge summary
4. **Email System (Resend)**: Reuse existing email templates for hackathon notifications
5. **Analytics (PostHog)**: Track events: hackathon_entered, submission_created, vote_cast, badge_earned

### Extension Points

- **devcards Table**: Add virtual/computed field for badge count (not stored, queried on demand)
- **Wallet Pass**: Add auxiliary field for achievement summary
- **Profile Page**: Add conditional Achievements section (only if badges exist)
- **Navigation**: Add /app/hackathons link in sidebar for Pro users

---

## Conclusion

All technical decisions align with existing StackPass architecture. No new infrastructure required. Ready to proceed with data model and API contract design.
