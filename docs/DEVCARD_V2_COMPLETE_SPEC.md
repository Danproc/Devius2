# DevCard V2 - Complete SpecKit Input

**Use this with**: `/speckit.specify` in fresh Indie Kit instance

---

## Project Overview

**Project Name**: Devius DevCard V2

**Purpose**: A developer social business card platform that auto-generates beautiful, shareable digital cards from GitHub profiles. Enables easy networking at tech events, conferences, and online communities.

**Core Concept**: "GitHub OAuth → Instant professional card → Easy networking"

## Vision Statement

Devius eliminates the friction of developer networking by:
1. **Instant creation**: Connect GitHub → Profile ready in 10 seconds
2. **Auto-populated**: 90% of data from GitHub (languages, repos, activity)
3. **Beautiful design**: Dark theme with bright green accent, modern animations
4. **Easy sharing**: Mobile wallet, QR codes, direct links
5. **Social networking**: Connect with developers, build your network
6. **Premium value**: Advanced themes, analytics, exclusive hackathon access

**Target Users**:
- Indie developers and freelancers
- Tech professionals attending conferences/meetups
- Open source contributors
- Developers looking to network and collaborate

---

## Core Features (MVP Phase 1)

### Feature 1: GitHub OAuth & Auto-Profile Creation

**User Flow**:
1. User lands on homepage
2. Clicks "Connect with GitHub" (ONLY auth method - no email/password)
3. GitHub OAuth authorization
4. System fetches and analyzes GitHub data:
   - Username, avatar, bio, location from profile
   - All public repositories
   - Calculate top 5 languages with percentages (e.g., "TypeScript 65.5%, JavaScript 12.2%")
   - Detect frameworks from package.json, requirements.txt, etc.
   - Identify 3-5 featured repositories (by stars, forks, activity)
   - Extract activity stats (total commits, current streak, PRs, issues)
5. Create profile in database with ALL GitHub data
6. Assign sequential member number (first user = #1, I am #1)
7. Redirect to dashboard

**CRITICAL**: Must sync ALL GitHub data or BLOCK SIGNUP
- If user has 0 public repos → Show error: "DevCard requires public GitHub activity"
- If GitHub API fails → Show error: "Unable to connect. Please try again"
- No empty/incomplete profiles allowed

**Auto-Populated Fields** (no user input):
- Avatar
- Username
- GitHub username and link
- Top languages (5 max) with percentages (auto-detected from all public repos)
- ALL public repositories fetched (user chooses which to feature)
- Activity highlights (commits, streak, contributions)
- Member number (e.g., #1)

**User Customization** (the 10%):
- **Featured repositories**: CRITICAL - User selects 3-5 repos to showcase
  - Show list of all their public repos (with stars, description)
  - User picks which ones to feature (checkboxes or drag-to-add)
  - Can reorder featured repos (drag-and-drop or up/down arrows)
  - Use this as portfolio/showcase their best work
- Headline (160 char max)
- Bio (160 char max, displays as 1-2 lines)
- Social links (Twitter, LinkedIn, Portfolio, Blog)
- Theme selection (from presets)
- Privacy (public/private toggle)

### Feature 2: Public Profile Card

**URL**: `https://devius.app/[username]` (e.g., `/danproc`)

**Design** (from screenshots):

**Visual Spec**:
- Background: Very dark (#0a0a0a or #111111)
- Accent color: Bright green (#00FF88)
- Text: White for primary, gray for secondary
- Card container: Rounded corners, subtle border
- Typography: Clean sans-serif (Inter or similar)

**Layout** (top to bottom):
1. **Header**:
   - Premium badge (top-right corner, green pill if premium user)
   - Large circular avatar (120-150px diameter, centered)
   - Name + Member ID ("Dan Proctor #1")
   - Headline/tagline (gray text, 1-2 lines)

2. **Metadata Row**:
   - 📍 Location (if available)
   - 🐙 @githubUsername (clickable link)
   - 🌐 Website (if available)

3. **Primary CTA**:
   - BIG green button: "Connect with [Name]"
   - Full width, prominent, rounded

4. **Social Proof**:
   - "Connected with X developers" (gray text)
   - Overlapping avatar circles (5 visible, more hidden)

5. **Divider Line**

6. **GitHub Section**:
   - GitHub username + icon
   - "GitHub Profile →" button (green, secondary)

7. **Languages Section**:
   - Heading: "Top Languages" (white text)
   - Subheading: "Detected from repositories" (gray)
   - Language badges with colored dots:
     - 🔵 TypeScript 65.5%
     - 🟡 JavaScript 12.2%
     - 🟢 Shell 6.1%
     - 🟣 Python 5.6%
     - 🔴 C++ 4.8%
   - Inline badges, color-coded

8. **Repositories Section**:
   - Heading: "Featured Repositories" (white)
   - Subheading: "GitHub Projects" (gray)
   - Repository cards:
     - Repo name (bold, white)
     - 🌐 URL + ⭐ Star count
     - Description (gray, 2-3 lines)
     - "View Project" button (green)
   - Show top 3-5 repos

9. **Social Links** (if added):
   - Icons for Twitter, LinkedIn, Portfolio, Blog
   - Clickable, open in new tab
   - Horizontal row, green accent on hover

10. **Hackathons Placeholder** (Phase 2):
    - 🏆 Hackathons heading
    - "Dan attended Devius AI Hackathons" text
    - Grayed out or "Coming Soon"

**Animations**:
- Fade in on page load (0.5s)
- Stagger child elements (0.1s delay each)
- Hover effects on buttons (lift, glow)
- Language badges scale on hover
- Smooth transitions (200-300ms)

### Feature 3: Dashboard

**URL**: `/app`

**Layout**: Centered, single column

**Components**:
1. **Header**:
   - "Your DevCard Dashboard"
   - Username + member number

2. **Card Preview** (Medium size):
   - Mini version of public card
   - Shows current theme/design
   - Not interactive, just visual

3. **Action Buttons** (3 large buttons):
   - 👁 **View Public Card** → Opens `/[username]` in new tab
   - ⚙️ **Customize Card** → Navigate to `/app/customize`
   - 📤 **Share & Add to Wallet** → Opens share modal

**Keep it minimal** - this is just a hub, not feature-rich

### Feature 4: Customization Page

**URL**: `/app/customize`

**Layout**: Split screen (desktop), stacked (mobile)

**Left Side**: Live Card Preview
- Real-time updates as user edits
- Exact design as public card
- Scrollable if content long

**Right Side**: Settings Panel

**Theme Section**:
- **Mode Toggle**: Dark / Light (pills or toggle switch)
- **Color Presets**: 8-10 theme options
  - Green (default, #00FF88)
  - Blue (#3b82f6)
  - Purple (#a855f7)
  - Orange (#f97316)
  - Red (#ef4444)
  - Pink (#ec4899)
  - Teal (#14b8a6)
  - Yellow (#eab308)
- Click preset → Updates preview instantly
- Premium users see all, free users see 3

**Bio Section**:
- Headline input (text field, 160 char max)
- Bio textarea (160 char max, shows X/160 counter)
- Character limit enforced
- Preview updates as they type

**Social Links Section**:
- Add link button
- For each link: Platform dropdown + URL input
- Platforms: Twitter, LinkedIn, GitHub (auto), Portfolio, Blog, Custom
- Can add multiple, reorder, remove
- Validates URLs (must be valid https://)

**Privacy Section**:
- "Make profile public" toggle
- "Show on discovery" toggle
- "Allow search indexing" toggle

**Save Button**:
- Large, green, bottom of panel
- "Save Changes"
- Shows loading state
- Success toast on save
- Updates profile in database

### Feature 5: Connection System (Request/Accept Model)

**Connection Request Flow**:

**Sender Side** (User A visits User B's card):
1. Clicks "Connect with [Name]" button
2. If not logged in:
   - Button changes to "Sign in with GitHub to connect"
   - Click → GitHub OAuth
   - After auth → Profile creates → Auto-sends request
3. If logged in:
   - Button changes to "Request sent" (gray, disabled)
   - Notification sent to User B
   - Can cancel request

**Recipient Side** (User B receives request):
1. Notification: "User A wants to connect"
2. Go to `/app/connections` → "Requests" tab
3. See pending requests with:
   - User's avatar + name
   - Their headline
   - "Accept" and "Decline" buttons
4. Click Accept → Connection created
5. Both users see each other in "Connections" list

**Connections Display**:
- Count: "Connected with X developers"
- Avatar row: Overlapping circles (up to 5 shown, "+X more")
- Full list: `/app/connections` page
- Can click avatar → View their card

**Database**:
- `connection_request` table (pending requests)
- `connection` table (accepted connections)
- Real-time updates (Supabase Realtime)

### Feature 6: Discovery & Browse

**URL**: `/explore` or `/browse`

**Features**:
- **Search bar**: Search by name or username
- **Filters**:
  - Language (dropdown: TypeScript, Python, JavaScript, etc.)
  - Location (text input or dropdown)
  - Skills/Frameworks (React, Node.js, etc.)
  - Premium only (toggle)
- **Results**: Grid or list of cards
  - Mini card previews
  - Click → View full profile
- **Sorting**: By member ID, connections, recent activity

**Also appears on**:
- Homepage: Featured developers carousel
- Dashboard: "Suggested connections" widget
- After connecting: "More developers like [Name]"

### Feature 7: Wallet Passes (CRITICAL)

**Apple Wallet**:
- Generate .pkpass file
- Embedded QR code
- Contact info (vCard format)
- User's theme colors
- Updates when profile changes

**Google Wallet**:
- Generate add-to-wallet URL
- Same content as Apple
- JWT-based

**Access**:
- Dashboard → "Share" → "Add to Apple Wallet" / "Add to Google Wallet"
- Download pass file or open Wallet app
- Pass stored on phone
- Can show to others at events

**Pass Content**:
- Front: Avatar, name, headline, member ID
- Back: QR code (links to public profile)
- Barcode: QR code format

**Technical**:
- Use passkit-generator for Apple
- Use Google Wallet API for Google
- Store pass URLs in profile table
- Regenerate when profile updates

### Feature 8: Share Modal

**Triggered from**: Dashboard "Share" button

**Modal Content**:
1. **QR Code**:
   - Large QR (256px)
   - Scannable
   - Links to `/[username]`
   - Download as PNG button

2. **Share Link**:
   - Input field with full URL
   - Copy button
   - Toast on copy success

3. **Wallet Buttons**:
   - "Add to Apple Wallet" (big button)
   - "Add to Google Wallet" (big button)
   - Download pass files

4. **Social Share** (optional):
   - Twitter share
   - LinkedIn share
   - Copy link

### Feature 9: Notifications

**Notification Types**:
1. **Connection Request**: "X wants to connect with you"
2. **Connection Accepted**: "X accepted your request"
3. **Profile View**: "X viewed your card" (daily digest)
4. **Hackathon Update**: "New hackathon available" (Phase 2)

**Delivery**:
- In-app: Bell icon with count badge
- `/app/notifications` page
- Real-time: Supabase Realtime subscriptions
- Toast notifications for immediate actions

**Settings**:
- User can toggle notification types
- Email notifications (optional, use Resend)

### Feature 10: Premium Membership & Payments

**Tiers**:
1. **Free**:
   - Basic profile
   - 3 theme presets
   - Wallet passes (basic)
   - Limited connections (50 max)
   - No analytics
   - No hackathons

2. **Premium** (Monthly: £4.99/month or Yearly: £49/year):
   - All themes unlocked
   - Analytics (views, scans, top referrers)
   - Unlimited connections
   - Hackathon participation
   - Priority support
   - Premium badge on card

3. **Lifetime** (£99 one-time):
   - Everything in Premium
   - Lifetime access
   - Exclusive "Founding Member" badge
   - Limited to first 100 users

**Payment Flow**:
- User clicks "Upgrade to Premium"
- Stripe Checkout (redirect)
- Select plan (Monthly, Yearly, Lifetime)
- Payment success → Membership activates instantly
- Premium badge appears on card
- Features unlock immediately

**Tech**:
- Stripe Checkout
- Webhook for payment events
- Store membership in `membership` table
- Feature flags based on tier

### Feature 11: Member ID System

**Implementation**:
- `memberNumber` column (SERIAL, auto-increment)
- First signup after me = #2, then #3, etc.
- Dan Proctor = #1 (manually set)

**Display**:
- Next to name: "Dan Proctor #1" (gray text)
- Prominent on public card
- Shows in avatar row on connections

**Purpose**:
- Scarcity/exclusivity for early adopters
- Social proof (low numbers = early member)
- Conversation starter

### Feature 12: Real-Time Features

**Use Supabase Realtime for**:
- Connection requests (appear instantly)
- Notifications (live bell icon updates)
- Profile view tracking
- Connection count updates

**Technical**:
- Subscribe to `connection_request` table changes
- Subscribe to notifications for user
- Update UI without refresh
- Graceful fallback if realtime unavailable

---

## User Journeys (Complete Flows)

### Journey 1: First-Time Sign Up

**Steps**:
1. Visit https://devius.app
2. See landing page with value prop + "Connect with GitHub"
3. Click button → GitHub OAuth screen
4. Authorize Devius (scopes: read:user, user:email, repo)
5. **Behind the scenes**:
   - Fetch GitHub repos
   - Calculate language percentages
   - Detect frameworks
   - Find featured repos (by stars)
   - Extract activity stats
   - Generate developer fingerprint
6. Create profile in database
7. Assign member number (incrementing from #1)
8. **Redirect to /app (Dashboard)**

**Dashboard shows**:
- "Welcome! Your DevCard is ready"
- Card preview (with all GitHub data)
- 3 action buttons
- Prompt: "Customize your card to stand out"

**User clicks "Customize"**:
- Add headline/bio
- Pick theme (green, blue, purple, etc.)
- Add social links (Twitter, LinkedIn)
- Click "Save"
- Toast: "Profile updated!"

**User clicks "Share"**:
- Modal opens
- Shows QR code
- "Add to Apple Wallet" button
- "Add to Google Wallet" button
- Copy share link

**User shares link** → Others can view card at `/danproc`

### Journey 2: Viewing Someone's Card & Connecting

**User B** (has DevCard) **views User A's card**:

1. Clicks link or scans QR → `/danproc`
2. Sees User A's full card (design from screenshot)
3. Scrolls to "Connect with Dan" button
4. Clicks button
5. **If logged in**:
   - Button shows loading spinner
   - Request sent
   - Button changes to "Request sent" (gray)
   - User A gets notification
6. **If NOT logged in**:
   - Button changes to "Sign in with GitHub to connect"
   - Click → OAuth
   - After auth → Profile creates → Request auto-sent

**User A** (receives request):
1. Bell icon shows notification badge
2. Goes to `/app/connections` → "Requests" tab
3. Sees User B's request (avatar, name, headline)
4. Clicks "Accept"
5. Connection created in database
6. Both users' connection count increments
7. Toast: "You're now connected with User B"

### Journey 3: Discovering New Developers

**User visits `/explore`**:
1. See search bar + filters
2. Filter by:
   - Language: "TypeScript"
   - Location: "United Arab Emirates"
   - Click "Apply Filters"
3. See grid of matching cards (paginated)
4. Click a card → View full profile
5. Connect with them

**Alternative discovery paths**:
- Homepage: "Featured Developers" carousel
- After connecting: "More like [Name]" suggestions
- Public card: "Similar Developers" section

### Journey 4: Upgrading to Premium

**User on dashboard**:
1. Sees "Upgrade to Premium" prompt or button
2. Clicks → `/pricing` page
3. Sees 3 tiers:
   - Free (current)
   - Premium (£4.99/mo or £49/year)
   - Lifetime (£99)
4. Clicks "Choose Premium"
5. Stripe Checkout opens
6. Enters payment details
7. Payment success → Redirect to dashboard
8. **Premium activated**:
   - Green "Premium" badge appears on card
   - All themes unlocked in customization
   - Analytics tab appears
   - Can join hackathons

---

## Data Model

### Profile Table

```sql
CREATE TABLE profile (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL UNIQUE REFERENCES auth.users(id),
  memberNumber SERIAL UNIQUE, -- #1, #2, #3...

  -- Basic Info (from GitHub)
  username TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly
  avatarUrl TEXT,
  githubUsername TEXT,
  githubId TEXT,

  -- User Customization
  headline TEXT, -- Max 160 chars
  bio TEXT, -- Max 160 chars
  location TEXT,
  website TEXT,

  -- GitHub Data (Auto-synced)
  topLanguages JSONB DEFAULT '[]', -- [{name, percentage, color}]
  featuredRepositories JSONB DEFAULT '[]', -- [{name, stars, url, description}]
  activityHighlights JSONB, -- {commits, streak, prs, issues}
  frameworks JSONB DEFAULT '[]', -- ['react', 'nextjs', etc.]
  developerFingerprint TEXT, -- "TypeScript Developer • React, Next.js"

  -- Customization
  theme JSONB DEFAULT '{"mode":"dark","accent":"#00FF88"}',
  socialLinks JSONB DEFAULT '{}', -- {twitter, linkedin, portfolio, blog}

  -- Social
  connectionCount INTEGER DEFAULT 0,
  profileViews INTEGER DEFAULT 0,

  -- Premium
  isPremium BOOLEAN DEFAULT false,
  premiumTier TEXT, -- 'monthly', 'yearly', 'lifetime'

  -- Wallet
  qrCodeUrl TEXT,
  applePassUrl TEXT,
  googlePassUrl TEXT,

  -- Privacy
  isPublic BOOLEAN DEFAULT true,

  -- Timestamps
  githubSyncedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Connection Request Table

```sql
CREATE TABLE connection_request (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fromUserId TEXT NOT NULL REFERENCES auth.users(id),
  toUserId TEXT NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(fromUserId, toUserId)
);
```

### Connection Table

```sql
CREATE TABLE connection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1Id TEXT NOT NULL REFERENCES auth.users(id),
  user2Id TEXT NOT NULL REFERENCES auth.users(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1Id, user2Id),
  CHECK (user1Id < user2Id) -- Prevent duplicates
);
```

### Membership Table

```sql
CREATE TABLE membership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL UNIQUE REFERENCES auth.users(id),
  tier TEXT NOT NULL, -- 'free', 'premium', 'lifetime'
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Notification Table

```sql
CREATE TABLE notification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'connection_request', 'connection_accepted', 'profile_view'
  fromUserId TEXT REFERENCES auth.users(id),
  message TEXT,
  read BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## Technical Requirements

### Tech Stack (Required)

**Frontend**:
- Next.js 15+ (App Router)
- React 19
- TypeScript
- TailwindCSS
- ShadCN UI components
- Framer Motion (animations)

**Backend**:
- Supabase Postgres (database)
- Supabase Auth (GitHub OAuth only)
- Supabase Realtime (notifications, live updates)
- Supabase Storage (wallet passes, QR codes)

**Integrations**:
- GitHub API (Octokit) - fetch repos, calculate stats
- Stripe - payments (simple checkout)
- Apple Wallet (passkit-generator)
- Google Wallet (JWT API)

**Infrastructure**:
- Vercel (hosting)
- Supabase (backend)
- GitHub OAuth app
- Stripe account

### Performance Requirements

- **Page Load**: <1s for public profiles
- **GitHub Sync**: <10s on signup (with loading indicator)
- **Real-time**: <200ms latency for notifications
- **Animations**: 60fps, smooth
- **Mobile**: Responsive, works on iOS Safari and Chrome Android
- **Offline**: Wallet passes work offline

### Security Requirements

- RLS policies on all tables
- GitHub OAuth scopes minimal (read:user, user:email, repo)
- Stripe webhook signature verification
- Rate limiting on API endpoints
- Input validation (prevent XSS, SQL injection)
- Secure wallet pass generation

---

## Success Criteria

**MVP is successful when**:

**Profile Creation**:
- ✅ User with GitHub account signs up in <30 seconds
- ✅ Profile auto-populates with languages, repos, activity
- ✅ Member number assigned (#1 for me)
- ✅ All GitHub data accurate and complete

**Customization**:
- ✅ Can change theme and see live preview
- ✅ Can add headline, bio, social links
- ✅ Save works, data persists
- ✅ Public card reflects changes instantly

**Public Card**:
- ✅ Matches design screenshots exactly
- ✅ Dark theme, green accent
- ✅ Smooth animations (fade-in, hover effects)
- ✅ All sections display correctly
- ✅ Mobile responsive

**Connections**:
- ✅ Can send connection request
- ✅ Recipient gets notification
- ✅ Can accept/decline
- ✅ Connection count updates
- ✅ Shows in connections list

**Discovery**:
- ✅ Can search by name/username
- ✅ Can filter by language, location
- ✅ Results display correctly
- ✅ Can click to view profiles

**Wallet**:
- ✅ Can generate Apple Wallet pass
- ✅ Can generate Google Wallet pass
- ✅ QR code embedded in pass
- ✅ Pass displays correctly on phone

**Payments**:
- ✅ Can view pricing page
- ✅ Stripe checkout works
- ✅ Premium activates instantly
- ✅ Premium badge shows on card
- ✅ Premium features unlock

**Performance**:
- ✅ Public card loads in <1s
- ✅ Animations smooth at 60fps
- ✅ Mobile responsive
- ✅ Works on iOS and Android

---

## Out of Scope (Phase 2)

**Do NOT build these yet**:
- ❌ Full hackathon system (just show placeholder on card)
- ❌ Teams for hackathons
- ❌ Direct messaging
- ❌ Activity feed
- ❌ Advanced analytics (Phase 1 has basic)
- ❌ Custom domain for cards
- ❌ API for third-party integrations
- ❌ Mobile apps (native iOS/Android)

---

## Design System

### Colors

**Dark Theme** (default):
- Background: `#0a0a0a`
- Card background: `#1a1a1a`
- Border: `#2a2a2a`
- Text primary: `#ffffff`
- Text secondary: `#a1a1a1`
- Accent: `#00FF88` (bright green)

**Light Theme**:
- Background: `#ffffff`
- Card background: `#f9f9f9`
- Border: `#e5e5e5`
- Text primary: `#0a0a0a`
- Text secondary: `#666666`
- Accent: `#00DD77`

### Typography

- Font: Inter or similar clean sans-serif
- Name: 32px, bold
- Headline: 16px, regular, gray
- Bio: 14px, regular, gray
- Section headings: 18px, semibold
- Stats/metadata: 13px, medium

### Spacing

- Card padding: 32px
- Section gaps: 24px
- Element gaps: 12px
- Button padding: 12px 24px

### Components

- Buttons: Rounded (8px), green accent, hover lift
- Badges: Rounded pill, colored dot + text
- Avatar: Circular, border (2px)
- Cards: Rounded (12px), subtle shadow
- Inputs: Rounded (6px), border on focus

### Animations

- Page load: Fade in 500ms
- Stagger: 100ms between elements
- Hover: Scale 1.05, duration 200ms
- Button click: Scale 0.95
- Transitions: ease-out

---

## Acceptance Criteria

### AC-1: GitHub Integration

**Given**: User with active GitHub account and 10+ public repos
**When**: They sign up with GitHub OAuth
**Then**:
- Profile created with username, avatar
- Top 5 languages calculated with accurate percentages
- Featured 3-5 repos identified (by stars/activity)
- Activity stats show commits, streak, PRs
- All data visible on public card within 10 seconds

### AC-2: Customization

**Given**: User on customization page
**When**: They change theme to "Purple", add Twitter link, update bio
**Then**:
- Live preview updates in real-time
- Click Save → Profile updates in database
- Public card reflects new theme/bio/links
- Changes persist after page refresh

### AC-3: Connections

**Given**: User A views User B's public card
**When**: User A clicks "Connect with [Name]"
**Then**:
- If logged in: Request sent, User B notified
- If not logged in: Button changes to "Sign in with GitHub to connect"
- User B can accept/decline in `/app/connections`
- After accept: Both see updated connection count
- Both see each other in connections list

### AC-4: Discovery

**Given**: User on `/explore` page
**When**: They filter by "Language: TypeScript" and "Location: UAE"
**Then**:
- Results show only matching profiles
- Can click to view full card
- Filters persist during session
- Pagination works for >20 results

### AC-5: Wallet Passes

**Given**: User on dashboard
**When**: They click "Share" → "Add to Apple Wallet"
**Then**:
- .pkpass file downloads
- Opens in Wallet app
- Pass shows avatar, name, headline, member ID
- QR code embedded (scannable)
- Pass updates when profile changes

### AC-6: Premium

**Given**: Free user clicks "Upgrade to Premium"
**When**: They complete Stripe checkout for Yearly plan
**Then**:
- Premium activates instantly
- Green "Premium" badge appears on card
- All themes unlock
- Analytics tab appears
- Membership record created in database

---

## Non-Functional Requirements

### Performance

- Public card load: <1 second
- GitHub sync on signup: <10 seconds
- Search/filter: <500ms response
- Real-time notifications: <200ms latency
- Support 1000 concurrent users

### Reliability

- 99.9% uptime target
- Graceful degradation if GitHub API down
- Retry logic for failed syncs
- Error boundaries for React errors

### Scalability

- Database: Handle 100K+ users
- GitHub API: Respect rate limits (5000/hour)
- Stripe: Handle payment webhooks reliably
- Realtime: Scale to 10K concurrent connections

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus indicators

### Mobile

- Responsive breakpoints (mobile, tablet, desktop)
- Touch-friendly buttons (44px min)
- Optimized for iOS Safari and Chrome Android
- PWA manifest for "Add to Home Screen"

---

## Technical Constraints

- Use Supabase pooler in Transaction mode (port 6543) - avoid connection limits
- GitHub API rate limits - cache data, use conditional requests
- Wallet pass certificates - need Apple Developer account ($99/year)
- Stripe test mode for development
- Dark mode default (light mode optional)

---

## Implementation Phases

**Phase 1** (MVP - Build This):
1. Setup & Auth (GitHub OAuth)
2. Profile auto-generation (GitHub sync)
3. Public card page (design from screenshots)
4. Dashboard (3 buttons)
5. Customization (themes, bio, links)
6. Connections (request/accept)
7. Discovery/browse (search + filters)
8. Wallet passes (Apple + Google)
9. Share modal (QR + wallet buttons)
10. Notifications (real-time)
11. Payments (Stripe + 3 tiers)
12. Member ID system

**Phase 2** (Post-Launch):
- Hackathons (full system)
- Teams (for hackathons)
- Advanced analytics
- Mobile native apps
- API for integrations

---

## Design Reference

**See screenshots for**:
- Exact card layout
- Color scheme (dark + green)
- Typography hierarchy
- Spacing/padding
- Button styles
- Badge designs
- Language display
- Repository cards

**Match these designs exactly** - users expect this visual quality.

---

## Edge Cases & Error Handling

**GitHub Sync Fails**:
- Show error: "Unable to sync GitHub data"
- Provide retry button
- Block signup if persistent failure

**User has no public repos**:
- Show error: "DevCard requires public GitHub activity"
- Suggest making repos public
- Block signup

**Connection request spam**:
- Rate limit: Max 20 requests per hour
- Prevent duplicate requests
- Can block users

**Premium expires**:
- Downgrade to free tier
- Remove premium badge
- Lock premium features
- Reminder emails before expiry

**Wallet pass generation fails**:
- Show error message
- Offer QR code download instead
- Log error for debugging

---

**This is the COMPLETE specification for DevCard V2.**

Ready to hand this to SpecKit?
