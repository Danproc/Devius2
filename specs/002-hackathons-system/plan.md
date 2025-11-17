# Implementation Plan: StackPass Hackathons

**Branch**: `002-hackathons-system`
**Date**: 2025-11-17
**Spec**: [spec.md](./spec.md)

## Summary

StackPass Hackathons is a Pro-member exclusive competition system enabling custom coding events with team formation, manual judging, community voting, cash prizes, and permanent achievement badges. Implementation extends existing StackPass platform without modifying core auth, membership, or profile systems.

**Technical Approach**: Add 6 new Postgres tables via Drizzle ORM migrations, create admin dashboard with Next.js App Router for hackathon management, build Pro member participation flows (team formation, submissions, voting), implement public gallery with ISR caching, integrate badges into existing StackPass profiles and Apple Wallet passes, use Resend for email notifications.

## Technical Context

**Tech Stack** (from user input):
- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js API routes → Supabase Postgres
- Auth: Supabase Auth (GitHub OAuth) + existing session helpers
- Database: Supabase Postgres with RLS (Row Level Security)
- ORM: Drizzle ORM (existing pattern)
- Storage: Supabase Storage (for future: project screenshots)
- Payments: Stripe (existing Pro membership, reuse)
- Wallet: passkit-generator (existing, extend for badges)
- Email: Resend (existing)
- Analytics: PostHog (existing)

**Dependencies**:
- Existing Pro membership check (users table subscription status)
- Existing devcards table for profile badge display
- Existing wallet pass generation for badge integration
- Existing admin role check (is_super_admin flag)

**Constraints**:
- Do NOT modify core auth or membership flows
- Do NOT break existing devcard profiles or wallet passes
- Reuse existing UI patterns (shadcn components, layout shell)
- Follow existing API route organization

## Constitution Check

*No project constitution exists - using industry best practices*

**Pre-Design Assessment**: ✅ PASSED
- Extends existing monolith (no new services)
- Uses established patterns (Drizzle, RLS, API routes)
- Follows Next.js App Router conventions
- Type-safe with TypeScript
- Proper error handling and logging

**Post-Design Assessment**: ✅ PASSED
- Database design normalized with proper indexes
- RLS policies enforce access control at DB level
- API follows RESTful patterns
- No breaking changes to existing systems
- Performance optimized (vote_count denormalization, caching strategy)

## Implementation Phases

### Phase 1: Database Schema & Migrations

**Duration**: 1-2 days

**Tasks**:
1. Create Drizzle schema files for 6 new tables
   - `src/db/schema/hackathons.ts`
   - `src/db/schema/hackathon-teams.ts`
   - `src/db/schema/hackathon-invites.ts`
   - `src/db/schema/hackathon-submissions.ts`
   - `src/db/schema/hackathon-votes.ts`
   - `src/db/schema/hackathon-badges.ts`

2. Generate and run migrations
   - `drizzle-kit generate`
   - `drizzle-kit push` to Supabase

3. Create RLS policies in Supabase dashboard
   - Admin-only for hackathons CUD operations
   - Pro-only for teams, submissions, votes
   - Public read for gallery data

4. Add TypeScript types
   - `src/types/hackathons.ts` - All hackathon-related interfaces
   - Export from existing type files

**Deliverables**:
- 6 schema files
- Migration SQL
- RLS policies applied
- TypeScript types

**Testing**: Verify tables created, constraints work, RLS blocks unauthorized access

---

### Phase 2: Admin Hackathon Management

**Duration**: 3-4 days

**Tasks**:
1. Create admin routes
   - `/app/admin/hackathons` - List view
   - `/app/admin/hackathons/new` - Create form
   - `/app/admin/hackathons/[id]/edit` - Edit form
   - `/app/admin/hackathons/[id]/judging` - Judging interface

2. Build admin components
   - `HackathonForm` - Create/edit with date pickers, prize inputs
   - `JudgingTable` - Submissions grid with vote counts, links
   - `WinnerSelector` - 1st/2nd/3rd place picker

3. Create admin API routes
   - `POST /api/hackathons` - Create
   - `PATCH /api/hackathons/[id]` - Update
   - `POST /api/hackathons/[id]/publish` - Publish
   - `POST /api/hackathons/[id]/declare-winners` - Award

4. Add admin navigation
   - Sidebar link to /app/admin/hackathons (admin-only)

**Deliverables**:
- 4 admin pages
- 3 reusable admin components
- 4 API endpoints
- Admin role middleware

**Testing**: Admin can create, publish, and manage hackathons end-to-end

---

### Phase 3: Team Formation & Invitations

**Duration**: 3-4 days

**Tasks**:
1. Create team management routes
   - `/app/hackathons/[id]/team` - Team builder interface

2. Build team components
   - `TeamBuilder` - Create team, invite members
   - `TeamInviteCard` - Pending invites inbox
   - `MemberSearch` - Find Pro members by username

3. Create team API routes
   - `POST /api/hackathons/[id]/teams` - Create team
   - `POST /api/hackathons/[id]/teams/[teamId]/invites` - Send invite
   - `POST /api/hackathons/teams/invites/[id]/accept` - Accept
   - `DELETE /api/hackathons/teams/invites/[id]` - Decline

4. Add team notifications
   - Email template: TeamInviteEmail
   - Toast notifications in-app

**Deliverables**:
- Team builder UI
- 4 team API endpoints
- Email template
- Notification system

**Testing**: Users can form teams, send/accept invites, see team members

---

### Phase 4: Project Submissions

**Duration**: 4-5 days

**Tasks**:
1. Create submission routes
   - `/app/hackathons/[id]/enter` - Entry + submission form
   - `/app/hackathons/submissions/[id]/edit` - Edit form

2. Build submission components
   - `SubmissionForm` - Project details, URLs, tech stack
   - `SubmissionPreview` - Read-only view
   - `DeadlineCounter` - Countdown timer component

3. Create submission API routes
   - `POST /api/hackathons/[id]/submissions` - Create
   - `PATCH /api/hackathons/submissions/[id]` - Update
   - `GET /api/hackathons/[id]/submissions/me` - My submission

4. Add validation
   - GitHub URL format check
   - Tech stack from predefined list
   - Character limits on title/description

**Deliverables**:
- Submission form with validation
- 3 submission API endpoints
- Countdown timer hook
- Draft/submit status flow

**Testing**: Pro members can create, edit, and finalize submissions

---

### Phase 5: Community Voting

**Duration**: 2-3 days

**Tasks**:
1. Create voting routes
   - `/app/hackathons/[id]/vote` - Submissions browser with voting

2. Build voting components
   - `SubmissionGrid` - Cards with vote buttons
   - `VoteButton` - One-click voting with optimistic UI
   - `VoteCount` - Display vote total

3. Create voting API routes
   - `POST /api/hackathons/submissions/[id]/vote` - Cast vote
   - `DELETE /api/hackathons/submissions/[id]/vote` - Remove vote

4. Add vote validation
   - Check Pro membership
   - Check not own team
   - Check within voting period

**Deliverables**:
- Voting UI with submission cards
- 2 vote API endpoints
- Real-time vote count updates
- "Already voted" state

**Testing**: Users can vote during voting period, counts update correctly

---

### Phase 6: Public Winners Gallery

**Duration**: 3-4 days

**Tasks**:
1. Create gallery routes
   - `/gallery` - All winners grid
   - `/gallery/hackathons/[slug]` - Single hackathon winners
   - `/gallery/projects/[id]` - Project detail

2. Build gallery components
   - `WinnerGrid` - Project cards with placement badges
   - `ProjectCard` - Thumbnail, title, team, tech stack
   - `ProjectDetail` - Full view with GitHub/demo links
   - `GalleryFilters` - Hackathon and tech stack filters

3. Create gallery API routes
   - `GET /api/gallery/winners` - Paginated winners
   - `GET /api/gallery/hackathons/[slug]/winners` - Event-specific

4. Add SEO optimization
   - Open Graph meta tags for projects
   - Server-side rendering for public pages
   - ISR with 1-hour revalidation

**Deliverables**:
- 3 public pages
- 4 gallery components
- 2 API endpoints
- SEO meta tags

**Testing**: Public can browse winners, filter, view project details

---

### Phase 7: Badge Integration

**Duration**: 2-3 days

**Tasks**:
1. Update profile components
   - Add `AchievementsSection` to StackPass profile
   - Display badges with hackathon names, placement, dates

2. Extend wallet pass generation
   - Update `generateAppleWalletPass()` to query badges
   - Add auxiliary field with badge summary
   - Format: "2x Winner: 1 Gold, 1 Silver"

3. Add badge queries
   - Profile page: Load badges on profile render
   - Wallet pass: Query top 3 badges (Gold → Silver → Bronze, by recency)

4. Create badge components
   - `BadgeCard` - Individual badge display
   - `BadgeSummary` - Compact badge count

**Deliverables**:
- Achievements section on profile
- Updated wallet pass with badges
- 2 badge components
- Badge query functions

**Testing**: Winners see badges on profile and in downloaded wallet pass

---

### Phase 8: Email Notifications

**Duration**: 1-2 days

**Tasks**:
1. Create email templates (React Email)
   - `TeamInvite.tsx` - Invitation to join team
   - `DeadlineReminder.tsx` - 24h before submission closes
   - `VotingOpen.tsx` - Voting period started
   - `WinnerAnnouncement.tsx` - Congrats on winning

2. Add email triggers
   - Team invite: On invite creation
   - Deadline reminder: Cron job 24h before (Inngest/Vercel Cron)
   - Voting open: On status change to "voting"
   - Winner: On badge award

3. Configure Resend templates
   - Update email branding to match StackPass dark theme

**Deliverables**:
- 4 email templates
- Email trigger functions
- Cron job for deadline reminders

**Testing**: Emails send at correct triggers with proper data

---

### Phase 9: Polish & UX Enhancements

**Duration**: 2-3 days

**Tasks**:
1. Add hackathons to main navigation
   - Sidebar link for Pro members: /app/hackathons
   - Public link in footer: /gallery

2. Create empty states
   - No active hackathons
   - No submissions yet
   - No badges earned

3. Add loading states
   - Skeleton loaders for hackathon lists
   - Submission form loading
   - Vote button loading states

4. Create upgrade CTAs
   - Free users see "Upgrade to Pro" on entry buttons
   - Link to pricing page with hackathons highlighted

5. Add analytics tracking
   - PostHog events: hackathon_entered, submission_created, vote_cast, badge_earned, winner_declared

**Deliverables**:
- Navigation updates
- Empty/loading states
- Upgrade CTAs
- Analytics events

**Testing**: Smooth UX for all user types, proper loading/empty states

---

## Risks & Mitigations

### Risk 1: Vote Manipulation

**Risk**: Users create multiple accounts to vote for own submission

**Mitigation**:
- Require Pro membership for voting ($49 barrier)
- One vote per submission limit
- Admin can manually review suspicious patterns
- Future: IP tracking, email verification

### Risk 2: Wallet Pass Size Limits

**Risk**: Too many badges break 200KB Apple Wallet limit

**Mitigation**:
- Only include top 3 badges in pass
- Use text summary, not images
- Test with 10+ badge scenario

### Risk 3: Submission Deadline Race Conditions

**Risk**: User submits exactly at deadline, clock skew causes rejection

**Mitigation**:
- 1-minute grace period server-side
- Client shows warning at T-5 minutes
- Clear error message if deadline passed

---

## Rollout Strategy

### MVP (Minimum Viable Product)

**Scope**: Phases 1-6
- Database + migrations
- Admin can create hackathons and declare winners
- Pro members can submit (solo only initially)
- Public gallery works
- Basic badges on profile (no wallet pass yet)

**Goal**: Run first hackathon end-to-end with manual processes

**Timeline**: 2-3 weeks

---

### v1.0 (Full Feature)

**Scope**: MVP + Phases 7-9
- Team formation complete
- Voting system live
- Badges in wallet passes
- Email notifications
- Polished UX

**Goal**: Self-service Pro member experience with minimal admin intervention

**Timeline**: +1-2 weeks after MVP

---

### v1.1 (Enhancements)

**Future Additions**:
- Automated deadline/voting transitions (no manual status changes)
- Project screenshots gallery
- Real-time leaderboard during voting
- Advanced search and filters
- Submission edit history/versioning
- Team chat/collaboration tools

---

## Success Metrics

**MVP Success Criteria**:
- Admin creates hackathon in <5 minutes ✓
- 10+ Pro members submit projects ✓
- Winners receive badges visible on profile ✓
- Public gallery displays all winners ✓

**v1.0 Success Criteria**:
- 50% Pro member participation rate ✓
- Badges appear in wallet pass within 1 minute ✓
- Voting participation >30% of Pro members ✓
- Zero unauthorized admin access ✓

---

## Appendix: File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── hackathons/
│   │       ├── page.tsx (list)
│   │       ├── new/page.tsx (create)
│   │       ├── [id]/
│   │       │   ├── edit/page.tsx
│   │       │   └── judging/page.tsx
│   ├── hackathons/
│   │   ├── page.tsx (browse)
│   │   ├── [id]/
│   │   │   ├── page.tsx (detail)
│   │   │   ├── enter/page.tsx (submission form)
│   │   │   ├── team/page.tsx (team builder)
│   │   │   └── vote/page.tsx (voting)
│   ├── gallery/
│   │   ├── page.tsx (winners grid)
│   │   └── projects/[id]/page.tsx (project detail)
│   └── api/
│       ├── hackathons/
│       │   ├── route.ts (GET list, POST create)
│       │   ├── [id]/
│       │   │   ├── route.ts (PATCH update)
│       │   │   ├── publish/route.ts
│       │   │   ├── declare-winners/route.ts
│       │   │   ├── judging/route.ts
│       │   │   ├── teams/route.ts
│       │   │   └── submissions/
│       │   │       ├── route.ts (GET, POST)
│       │   │       └── me/route.ts
│       │   └── submissions/
│       │       └── [id]/
│       │           ├── route.ts (PATCH)
│       │           └── vote/route.ts (POST, DELETE)
│       └── gallery/
│           └── winners/route.ts
├── components/
│   └── hackathons/
│       ├── HackathonCard.tsx
│       ├── SubmissionForm.tsx
│       ├── TeamBuilder.tsx
│       ├── VoteButton.tsx
│       ├── BadgeCard.tsx
│       ├── WinnerGrid.tsx
│       └── ... (15+ components)
├── db/
│   └── schema/
│       └── (6 new schema files)
├── lib/
│   └── hackathons/
│       ├── queries.ts (reusable DB queries)
│       ├── validations.ts (URL checks, limits)
│       └── helpers.ts (badge formatting, etc.)
└── types/
    └── hackathons.ts
```

---

## Next Steps

1. ✅ Spec complete (spec.md)
2. ✅ Research complete (research.md)
3. ✅ Data model defined (data-model.md)
4. ✅ API contracts specified (contracts/api-endpoints.md)
5. ⏳ Run `/speckit.tasks` to generate actionable task breakdown
6. ⏳ Begin Phase 1 implementation (database schema)

**Ready to proceed with task generation and implementation!**
