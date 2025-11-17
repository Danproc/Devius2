# Quickstart: StackPass Hackathons Development

**Feature**: StackPass Hackathons
**Branch**: `002-hackathons-system`

## For Developers

### Prerequisites

- Existing StackPass development environment running
- Postgres database with Drizzle ORM
- Super admin account for testing admin features
- At least 2 Pro member accounts for testing teams/voting

### Local Setup

```bash
# Switch to hackathons branch
git checkout 002-hackathons-system

# Install any new dependencies (if added)
pnpm install

# Run database migrations
pnpm db:push

# Start dev server
pnpm dev
```

### Testing the Feature

**As Admin:**
1. Visit http://localhost:3000/app/admin/hackathons
2. Create a test hackathon with short deadline (1 day out)
3. Publish the hackathon

**As Pro Member:**
1. Visit http://localhost:3000/app/hackathons
2. Enter the hackathon (solo or form a team)
3. Submit a test project with GitHub URL
4. After deadline, cast votes on other submissions

**As Public User:**
1. Visit http://localhost:3000/gallery
2. Browse winning projects

### Key Files to Know

**Database Schemas**: `src/db/schema/hackathon*.ts`
**API Routes**: `src/app/api/hackathons/`
**Admin Pages**: `src/app/admin/hackathons/`
**User Pages**: `src/app/hackathons/`
**Components**: `src/components/hackathons/`
**Types**: `src/types/hackathons.ts`

### Common Development Tasks

**Add new hackathon field:**
1. Update schema in `src/db/schema/hackathons.ts`
2. Run `pnpm db:push`
3. Update TypeScript type in `src/types/hackathons.ts`
4. Update admin form component

**Add new badge type:**
1. Update enum in `hackathon_badges` schema
2. Add badge styling in `BadgeCard` component
3. Update wallet pass badge formatter

---

## For Product/QA

### Testing Checklist

**Admin Flow:**
- [ ] Create hackathon with valid dates and prizes
- [ ] Publish hackathon (status changes to active)
- [ ] View submissions in judging interface
- [ ] Declare 3 winners, verify badges created

**Pro Member Flow:**
- [ ] Browse hackathons, see countdown timers
- [ ] Enter hackathon, form 3-person team
- [ ] Submit project with all fields
- [ ] Edit submission before deadline
- [ ] Vote on 5 other submissions during voting period
- [ ] Verify cannot vote for own submission

**Public Flow:**
- [ ] View gallery without login
- [ ] Filter winners by hackathon
- [ ] Click project to see details
- [ ] Click team member to view their StackPass profile

**Badge Integration:**
- [ ] Winner's profile shows gold badge in Achievements section
- [ ] Download wallet pass, verify badge summary appears
- [ ] Multiple wins show multiple badges

---

## Troubleshooting

**"Cannot create hackathon" error:**
- Check user has `is_super_admin = true` in database
- Verify RLS policies are applied

**"Team invite not sending":**
- Check Resend API key is configured
- Verify email template exists

**"Votes not counting":**
- Check unique constraint on hackathon_votes table
- Verify voter is Pro member
- Check voting period is active

---

## Deployment

### Environment Variables

No new environment variables required - uses existing:
- Supabase connection (existing)
- Resend API key (existing)
- Stripe (existing)

### Database Migrations

```bash
# Production
pnpm db:push # or use Supabase migrations
```

### Feature Flags

Consider adding feature flag for gradual rollout:
- `HACKATHONS_ENABLED=true` in env vars
- Hide /app/hackathons route if disabled
