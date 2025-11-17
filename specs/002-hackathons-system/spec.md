# Feature Specification: StackPass Hackathons

**Feature Branch**: `002-hackathons-system`
**Created**: 2025-11-17
**Status**: Draft
**Input**: Pro-only hackathon competition system with registration phase, capacity limits, team formation, manual judging, community voting, cash prizes, and permanent achievement badges

## Clarifications

### Session 2025-01-17

- Q: Can users unregister from a hackathon after registering? → A: Allow unregistration only before registration window closes, prevent after submissions open

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates and Manages Hackathon (Priority: P1)

An admin creates a new hackathon event with a theme ("Build a Developer Tool"), sets registration dates and participant capacity, configures a 14-day duration with submission deadline, configures prize pool ($500/$300/$200 for 1st/2nd/3rd), publishes the event, then after submissions close, reviews entries with vote counts, and declares the top 3 winners who automatically receive badges on their StackPass profiles and wallet passes.

**Why this priority**: Core functionality - without admin event creation, no hackathons exist. This is the foundation that enables all other user stories.

**Independent Test**: Can be fully tested by creating a hackathon with registration phase in admin dashboard, opening registration, waiting for deadlines, and selecting winners. Delivers immediate value by enabling the hackathon system.

**Acceptance Scenarios**:

1. **Given** admin is logged in, **When** they navigate to /app/admin/hackathons and click "Create Hackathon", **Then** they see a form with fields for title, theme, description, rules, registration start/end dates, max participants, start date, submission deadline, voting period dates, and prize amounts
2. **Given** admin fills all required fields, **When** they click "Publish", **Then** hackathon status changes to "upcoming" or "registration" based on registration start date, and appears in Pro member hackathons list
3. **Given** submission deadline has passed, **When** admin opens judging interface, **Then** they see all submissions with vote counts, GitHub/demo links, and can select 1st/2nd/3rd place winners
4. **Given** admin selects winners and confirms, **When** they click "Award Winners", **Then** gold/silver/bronze badges are created for each winning team member, submissions are flagged for gallery, and badge appears on winners' StackPass profiles and wallet passes

---

### User Story 2 - Pro Member Registers, Enters, and Submits Project (Priority: P1)

A Pro member browses hackathons during registration period, clicks "Register" and selects solo or team participation preference, waits for submission phase to open, then creates a submission with project title/description/GitHub URL/demo URL/tech stack tags (forming a team if they chose team preference), edits their submission multiple times before deadline, and when deadline passes, their submission becomes visible for community voting.

**Why this priority**: Core user value - Pro members paying for hackathon access need to be able to register, participate, and submit projects. This is the primary revenue-driving feature with registration creating scarcity and urgency.

**Independent Test**: Can be tested end-to-end by a Pro member registering during registration window, waiting for submission phase, forming a team (if applicable), and submitting a project. Delivers value by enabling competition participation with controlled capacity.

**Acceptance Scenarios**:

1. **Given** Pro member is logged in, **When** they visit /app/hackathons, **Then** they see list of hackathons with registration status, available spots (X/Y), dates, prizes, and countdown timers
2. **Given** hackathon is in "registration" status and capacity not reached, **When** Pro member clicks "Register" and selects solo/team preference, **Then** registration is created, spots counter updates, and they see "Registered" confirmation
3. **Given** user is registered and registration is still open, **When** they click "Unregister", **Then** registration is canceled, spot is freed, and they can re-register
4. **Given** registration window has closed but submission phase hasn't started, **When** registered user visits hackathon page, **Then** they see "Submission phase opens in X days" message and cannot submit yet
5. **Given** hackathon is in "active" status and user is registered, **When** they click "Submit Project", **Then** they can choose to form team (if registered as team) or work solo (if registered as solo), and see submission form
6. **Given** user chose "Form Team", **When** they invite 1-4 other registered Pro members by username, **Then** invitees receive notifications, and team forms when invites are accepted
7. **Given** team is formed (or user is solo), **When** they fill submission form with title/description/GitHub URL/demo URL/tech stack and click "Submit", **Then** submission is created with status "draft" and they can continue editing
8. **Given** submission exists and deadline hasn't passed, **When** user edits any field and saves, **Then** changes are persisted and last_edited timestamp updates
9. **Given** submission deadline passes, **When** user tries to edit, **Then** form becomes read-only with message "Submission deadline has passed"
10. **Given** user is not registered for hackathon, **When** they try to submit project during active phase, **Then** they see error "You must register during registration period to submit"

---

### User Story 3 - Community Voting on Submissions (Priority: P2)

After submission deadline closes, admin changes hackathon status to "voting", Pro members browse all submissions for that event, view project details/demos, and cast one vote per submission they like (cannot vote for own team's project), vote counts are visible to admin during judging, and users can see total vote counts after voting period ends.

**Why this priority**: Enables community engagement and provides judges with crowdsourced input. Not critical for MVP but significantly enhances fairness and engagement.

**Independent Test**: Can be tested by creating test submissions, opening voting period, and having multiple users cast votes. Delivers value by democratizing winner selection.

**Acceptance Scenarios**:

1. **Given** hackathon is in "voting" status, **When** Pro member visits hackathon detail page, **Then** they see "Vote on Submissions" section with all submitted projects
2. **Given** user is viewing submissions, **When** they click "Vote" on a project (not their own team's), **Then** vote is recorded, button changes to "Voted", and they cannot vote again on that submission
3. **Given** user tries to vote on their own team's submission, **When** they click "Vote", **Then** button is disabled with tooltip "Cannot vote for your own submission"
4. **Given** voting period ends, **When** anyone views submissions, **Then** vote counts are displayed publicly alongside each project

---

### User Story 4 - Public Gallery Showcases Winners (Priority: P2)

Any visitor (Free or Pro user, logged in or not) visits /gallery, sees grid of past hackathon winners organized by event, can filter by hackathon name or tech stack, clicks on a winning project to see full details with team member StackPass profiles linked, and can navigate to team members' profiles to view their badges and achievements.

**Why this priority**: Public showcase drives new signups and provides social proof. Important for growth but not essential for core hackathon functionality.

**Independent Test**: Can be tested by creating hackathons with winners and viewing gallery page. Delivers value by showcasing community work and driving conversions.

**Acceptance Scenarios**:

1. **Given** any user visits /gallery, **When** page loads, **Then** they see grid of winning projects grouped by hackathon with project thumbnail/title/team members
2. **Given** user is on gallery page, **When** they select a tech stack filter (e.g., "React"), **Then** only projects using that tech appear
3. **Given** user clicks on a project, **When** project detail modal/page opens, **Then** they see full description, GitHub link, demo link, and clickable team member profiles
4. **Given** user clicks team member's StackPass link, **When** profile loads, **Then** they see that member's badges including the hackathon win, displayed in Achievements section

---

### User Story 5 - Badges Display on Profile and Wallet Pass (Priority: P2)

When a user wins a hackathon (1st/2nd/3rd place), a badge (Gold/Silver/Bronze) is automatically created and linked to their user account, the badge immediately appears in an "Achievements" section on their public StackPass profile, and when they download/update their Apple Wallet pass, the badge is included in the pass metadata, making achievements portable and verifiable.

**Why this priority**: Permanent recognition is a key motivator for participation. Integrates with existing StackPass core features. Important for retention but can be added after core hackathon flow works.

**Independent Test**: Can be tested by awarding a badge manually, checking profile page, and downloading wallet pass. Delivers value by providing lasting achievement recognition.

**Acceptance Scenarios**:

1. **Given** user wins 1st place in a hackathon, **When** admin declares winners, **Then** a Gold badge record is created linking user_id, hackathon_id, and submission_id
2. **Given** user has badges, **When** anyone views their public StackPass profile, **Then** an "Achievements" section displays all earned badges with hackathon names and placement
3. **Given** user downloads Apple Wallet pass, **When** pass is generated, **Then** pass includes summary of user's top badges (e.g., "3x Winner, 1x Gold, 2x Silver")
4. **Given** user has multiple badges, **When** other users browse developers, **Then** they can filter by badge holders (future: "Show me all hackathon winners")

---

### Edge Cases

- What happens when a team member leaves/is removed after submission is created?
  - **Answer**: Submission remains valid, remaining team members are credited, departed member loses credit for that submission
- What happens when submission deadline and voting start are the same time?
  - **Answer**: System allows admin to set voting_start_at equal to or after submission_deadline_at, enforces submissions cannot be edited once voting begins
- What happens when user tries to join multiple teams for the same hackathon?
  - **Answer**: System enforces one active team membership per user per hackathon, attempting to join second team shows error "You are already part of a team for this hackathon"
- What happens when a GitHub repo is deleted after submission?
  - **Answer**: Submission remains in system with broken link, admin judging UI shows "Repository unavailable" warning, project can still win based on demo/description but gets flagged
- What happens when two team members try to edit submission simultaneously?
  - **Answer**: Last-write-wins, no conflict resolution needed for MVP (optimistic locking), user sees "Submission updated" toast
- What happens when voting period ends but admin hasn't declared winners?
  - **Answer**: Hackathon remains in "voting" status indefinitely, admin can declare winners at any time, no automatic winner selection
- What happens when a Pro member's subscription expires during an active hackathon?
  - **Answer**: Existing registrations and submissions remain valid, user can view their submission but cannot create new ones or vote, if they win they still receive badge
- What happens when registration reaches max capacity?
  - **Answer**: Registration button changes to "Full" and becomes disabled, Pro members see "X/X spots filled" message, no late registrations possible even if spots become available
- What happens when user registered as "team" but submits solo?
  - **Answer**: Allowed - registration preference is advisory only, users can submit solo regardless of initial preference
- What happens when user registered as "solo" but tries to form team?
  - **Answer**: Allowed - registration preference is advisory only, users can form team regardless of initial preference
- What happens when a registered user tries to unregister after registration closes?
  - **Answer**: Unregister option is disabled after registration_end_at, user cannot unregister once submission phase begins

## Requirements *(mandatory)*

### Functional Requirements

**Event Management (Admin)**

- **FR-001**: System MUST allow admins to create hackathons with title, slug (URL-safe), theme, description, rules text, registration start/end dates, max participants (nullable), start date, submission deadline, voting start date, voting end date
- **FR-002**: System MUST allow admins to configure prizes as currency (USD) with separate amounts for 1st place, 2nd place, and 3rd place
- **FR-003**: System MUST enforce registration_start_at < registration_end_at < start_at < submission_deadline_at, and voting_start_at is at or after submission_deadline_at
- **FR-004**: System MUST support hackathon statuses: draft, upcoming (published but not started), registration (accepting registrations), active (accepting submissions from registered users), voting (submissions closed, voting open), completed (winners declared)
- **FR-005**: System MUST provide admin judging interface showing all submissions for a hackathon, sorted by vote count, with GitHub/demo links, team member lists, and vote totals
- **FR-006**: System MUST allow admin to select exactly one 1st place, one 2nd place, and one 3rd place winner (or fewer if insufficient quality submissions)
- **FR-007**: System MUST create badge records for each team member of winning teams when admin confirms winner selection
- **FR-008**: System MUST flag winning submissions for public gallery display when winners are declared
- **FR-009**: System MUST display current registration count vs max participants to admin in hackathon management interface

**Registration (Pro Members)**

- **FR-010**: System MUST allow Pro members to register for hackathons during registration period (registration_start_at to registration_end_at)
- **FR-011**: System MUST collect participation preference during registration: solo or team
- **FR-012**: System MUST enforce max_participants capacity limit - prevent registration when capacity reached
- **FR-013**: System MUST enforce one registration per user per hackathon (unique constraint on hackathon_id + user_id)
- **FR-014**: System MUST allow users to unregister only before registration_end_at timestamp
- **FR-015**: System MUST prevent unregistration after registration closes (even if submission phase hasn't started)
- **FR-016**: System MUST restrict submission creation to registered users only during active phase
- **FR-017**: System MUST display registration status (spots available, countdown to registration close) on hackathon cards and detail pages
- **FR-018**: System MUST treat participation preference as advisory only - users can form teams or work solo regardless of initial preference

**Team Formation (Pro Members)**

- **FR-019**: System MUST allow Pro members to create teams for a hackathon by inviting other registered Pro members via username or StackPass profile URL
- **FR-020**: System MUST support teams of 1-5 members (1 = solo, 2-5 = team)
- **FR-021**: System MUST send notification to invited members with accept/decline options
- **FR-022**: System MUST enforce one active team membership per user per hackathon (cannot be on multiple teams for same event)
- **FR-023**: System MUST allow team creator to remove members before submission is finalized
- **FR-024**: System MUST auto-assign team name from submission title if no custom team name provided

**Submissions (Pro Members)**

- **FR-025**: System MUST require submissions to include: project title, description (5000 char max), GitHub repository URL
- **FR-026**: System MUST allow optional fields: demo URL, video URL, tech stack tags (1-10 tags, each 2-30 characters)
- **FR-027**: System MUST enforce one submission per user (solo) or one submission per team per hackathon
- **FR-028**: System MUST allow submission edits (any field) until submission_deadline_at timestamp is reached
- **FR-029**: System MUST make submissions read-only after deadline, showing "Submissions closed" message
- **FR-030**: System MUST validate GitHub URLs are valid github.com repository links (format validation only)
- **FR-031**: System MUST allow users to save submissions as "draft" status before final submit

**Voting (Pro Members)**

- **FR-032**: System MUST allow Pro members to cast one vote per submission during voting period
- **FR-033**: System MUST prevent users from voting on their own team's submission
- **FR-034**: System MUST display current vote count for each submission (visible to all during and after voting)
- **FR-035**: System MUST enforce voting is only possible between voting_start_at and voting_end_at timestamps
- **FR-036**: System MUST allow users to change their vote on a submission (remove and re-vote elsewhere) during voting period

**Public Gallery (All Users)**

- **FR-037**: System MUST display public gallery page (/gallery) accessible to all users (logged in or not)
- **FR-038**: System MUST show all hackathons with at least one winning submission
- **FR-039**: System MUST display winning projects with: title, description, GitHub URL, demo URL, team members, placement (1st/2nd/3rd), tech stack
- **FR-040**: System MUST allow filtering gallery by hackathon name and tech stack tags
- **FR-041**: System MUST link team member names to their public StackPass profiles
- **FR-042**: System MUST show "Upgrade to Pro to participate" CTA for Free users viewing gallery

**Badges System**

- **FR-043**: System MUST create permanent badge records when winners are declared: Gold (1st), Silver (2nd), Bronze (3rd)
- **FR-044**: System MUST link badges to user accounts (all team members of winning team receive same badge)
- **FR-045**: System MUST display badges in "Achievements" section on public StackPass profiles
- **FR-046**: System MUST include badge summary in Apple Wallet pass generation (e.g., "2x Gold, 1x Silver")
- **FR-047**: System MUST allow users to accumulate multiple badges over time (winning multiple hackathons)

**Access Control**

- **FR-048**: System MUST restrict hackathon registration to Pro members only
- **FR-049**: System MUST restrict submission creation to registered Pro members only
- **FR-050**: System MUST restrict voting to Pro members only
- **FR-051**: System MUST allow Free users to view hackathon list, gallery, and submission details (read-only)
- **FR-052**: System MUST check Pro membership status at time of registration - expired members cannot register for new hackathons but existing registrations remain valid

### Key Entities

- **Hackathon**: A competition event with title, theme, description, rules, registration dates (start, end, capacity), submission dates (start, deadline), voting period, prize amounts, and status lifecycle
- **Registration**: A Pro member's intent to participate in a hackathon, includes participation preference (solo/team), registration timestamp, linked to user and hackathon
- **Team**: Group of 1-5 Pro members collaborating on a hackathon submission, with optional team name and creator/member roles
- **Submission**: A project entry for a hackathon linked to a team or solo user, including title, description, URLs (GitHub, demo, video), tech stack, submission timestamp, and edit history
- **Vote**: A Pro member's endorsement of a submission, limited to one vote per user per submission, with timestamp
- **Badge**: Permanent achievement awarded to winning team members, typed as Gold/Silver/Bronze, linked to user, hackathon, and winning submission

### Data Model

**hackathons table additions:**
- `registration_start_at`: timestamp (when registration opens)
- `registration_end_at`: timestamp (when registration closes)
- `max_participants`: integer nullable (capacity limit, null = unlimited)

**hackathon_registrations table (new):**
- `id`: UUID primary key
- `hackathon_id`: UUID foreign key to hackathons
- `user_id`: text foreign key to users
- `participation_type`: enum ('solo' | 'team')
- `registered_at`: timestamp
- `created_at`: timestamp
- Unique constraint on (hackathon_id, user_id)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create and publish a hackathon with registration phase in under 5 minutes
- **SC-002**: Pro members can register for a hackathon in under 30 seconds
- **SC-003**: Pro members can form a team and submit a project in under 10 minutes
- **SC-004**: System handles 100+ concurrent registrations and submissions for a single hackathon without performance degradation
- **SC-005**: 80% of registered Pro members successfully submit at least one project entry
- **SC-006**: Public gallery page loads in under 2 seconds with 50+ winning projects
- **SC-007**: Badge appears on StackPass profile and wallet pass within 1 minute of winner declaration
- **SC-008**: Voting period sees at least 50% participation rate from Pro members (voters / eligible Pro members)
- **SC-009**: Zero unauthorized access to admin judging interface (security validation)
- **SC-010**: Registration phase creates measurable urgency - 70%+ of spots fill within first 48 hours of registration opening

## Assumptions *(if applicable)*

1. **Pro Membership System Exists**: Assumes current $49/year Pro membership is functional and includes field/flag to check Pro status
2. **Badge Storage**: Assumes devcards table can be extended or badges can be queried by user_id for profile display
3. **Wallet Pass Regeneration**: Assumes existing wallet pass generation can be triggered/updated when badges change
4. **Team Invites**: Team invitation flow uses similar pattern to existing connection requests (notifications + accept/decline)
5. **Admin Role**: Assumes existing super-admin or role-based access control can identify admins for /app/admin routes
6. **Email Infrastructure**: Assumes Resend email service (already configured) will be used for hackathon notifications
7. **Tech Stack Tags**: Assumes reuse of existing tech_stack predefined list from StackPass profiles
8. **Timezone Handling**: All timestamps stored in UTC, displayed in user's local timezone
9. **Prize Payouts**: Out of scope for automation - admins manually pay winners via PayPal/Stripe after declaring winners in system
10. **Submission Validation**: GitHub URL validation checks format only, does not verify repo exists or has activity (trust-based for MVP)
11. **Registration Preference**: Participation type (solo/team) collected during registration is advisory only, not enforced at submission time

## Dependencies *(if applicable)*

### System Dependencies

- **Pro Membership System**: Requires ability to check if user has active Pro subscription
- **StackPass Profiles (devcards)**: Badge display and gallery require existing profile pages
- **Apple Wallet Pass Generation**: Badge integration requires updating existing `wallet-pass.ts` to include badges
- **Authentication**: Requires existing session/auth to identify users and check roles
- **File Storage**: Project thumbnails/images (future) would use existing S3/storage setup

### External Service Dependencies

- **GitHub API**: URL validation and optional future features (verify commits during event period)
- **Email Service (Resend)**: Notifications for team invites, deadline reminders, winner announcements
- **Payment Processing**: Manual for MVP, but future automation would use existing Stripe integration

## Constraints *(if applicable)*

### Business Constraints

- **Pro-Only Participation**: Only paid Pro members can register, submit, or vote (Free users read-only)
- **Manual Prize Distribution**: No automated payouts, admin records winner metadata and handles payment externally
- **One Registration Per User**: Each user can only register once per hackathon, first-come-first-served until capacity
- **One Submission Per User/Team**: Each user can only be part of one submission per hackathon (prevents gaming)

### Technical Constraints

- **Database Performance**: Registration, voting and gallery queries must remain performant with 1000+ registrations/submissions per hackathon
- **Real-time Updates**: Countdown timers, vote counts, and registration counts do not require WebSockets, polling or page refresh is acceptable
- **Image Hosting**: Project screenshots/thumbnails (if added) must fit within existing file upload limits
- **Wallet Pass Size**: Badge metadata in wallet pass must not exceed Apple's 200KB pass limit

### User Experience Constraints

- **Mobile-First**: Registration, team formation and submission flows must work on mobile (primary use case)
- **Editing Window**: Users must be able to edit submissions up until deadline (no "finalize" lock-in)
- **No Real-Time Judging**: Admin manual review is asynchronous, no live leaderboard during judging
- **Registration Urgency**: Limited spots create FOMO, registration must be frictionless and fast

### Security & Compliance Constraints

- **Admin Authorization**: Only designated admins can create/manage hackathons and declare winners
- **Vote Integrity**: One vote per user per submission enforced at database level (unique constraint)
- **Registration Integrity**: One registration per user per hackathon enforced at database level (unique constraint)
- **No Public Voting**: Free users cannot vote even though they can view submissions
- **Team Privacy**: Team member emails not exposed, only StackPass profiles

## Out of Scope *(if applicable)*

### Explicitly Excluded from This Iteration

- **Automated Prize Payouts**: No Stripe/PayPal integration for automatic winner payments
- **Live Chat/Discussions**: No commenting or discussion threads on submissions
- **Advanced Anti-Cheat**: No GitHub commit history analysis, code similarity detection, or fraud prevention beyond basic constraints
- **Team Matchmaking**: No algorithm to suggest team members or auto-form teams based on skills
- **Calendar Integration**: No .ics export or calendar sync for hackathon dates
- **Push Notifications**: Email only for notifications, no in-app push or SMS
- **Submission Versioning**: No git-style history of submission edits, only current state + last_edited timestamp
- **Multiple Tracks**: No categories/tracks within a single hackathon, all projects compete in one pool
- **Judges Panel**: Manual judging is admin-only, no separate judge roles or weighted voting
- **Leaderboards During Event**: No real-time rankings or public leaderboards during active hackathon, only final results
- **AI Code Review**: No automated code quality scoring or AI-assisted judging
- **Waitlist System**: No waitlist when capacity is reached, first-come-first-served only
- **Registration Transfers**: Cannot transfer registration to another user
- **Partial Refunds**: No refund/credit system for registered users who don't submit

### Future Enhancements (Post-MVP)

- Automated prize distribution via Stripe Connect
- Submission comments and Q&A
- GitHub commit verification (prove work was done during hackathon period)
- Multiple hackathon tracks/categories
- Judge roles with weighted scores
- Real-time leaderboards
- Team skill recommendations
- Submission screenshots/images gallery
- Project upvotes separate from formal voting
- Waitlist with automatic enrollment when spots open
- Registration transfer mechanism
- Team matchmaking based on tech stack and availability
