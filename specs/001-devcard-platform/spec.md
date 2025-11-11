# Feature Specification: DevCard V2 - Developer Social Business Card Platform

**Feature Branch**: `001-devcard-platform`
**Created**: 2025-11-11
**Status**: Draft
**Input**: User description: "DevCard V2 - Developer social business card platform with GitHub integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GitHub OAuth and Instant Card Creation (Priority: P1)

A developer attends a tech conference and wants to quickly share their professional profile with other attendees. They connect their GitHub account and instantly get a beautiful digital card showcasing their work.

**Why this priority**: This is the core value proposition - eliminating the friction of developer networking by auto-generating cards from GitHub data. Without this, the entire platform has no purpose.

**Independent Test**: Can be fully tested by signing up with a GitHub account and verifying that a DevCard is automatically generated with GitHub profile data, stats, and shareable link.

**Acceptance Scenarios**:

1. **Given** a developer visits Devius, **When** they click "Connect with GitHub" and authorize OAuth, **Then** their DevCard is automatically created with username, avatar, bio, top repositories, and contribution stats
2. **Given** a new user with limited GitHub activity, **When** they complete OAuth, **Then** the system displays a basic card with available data and suggests ways to enhance their profile
3. **Given** a user with a private GitHub profile, **When** they attempt to connect, **Then** the system requests permission to access public profile data only
4. **Given** a user completes card creation, **When** they view their card, **Then** they receive a unique shareable URL (e.g., devius.io/username)

---

### User Story 2 - Card Sharing and Networking (Priority: P1)

A developer wants to share their DevCard with recruiters, collaborators, or conference attendees through multiple channels (QR code, link, social media).

**Why this priority**: Sharing capability is the second half of the core value proposition. A card that can't be easily shared defeats the networking purpose.

**Independent Test**: Can be fully tested by creating a card and verifying all sharing methods work - QR code generation, link copying, social media sharing, and wallet pass download.

**Acceptance Scenarios**:

1. **Given** a user has a DevCard, **When** they click "Share", **Then** they see options for QR code, copy link, download wallet pass, and social media sharing
2. **Given** a user generates a QR code, **When** someone scans it, **Then** they are directed to the user's DevCard landing page
3. **Given** a user downloads their wallet pass, **When** they add it to Apple Wallet or Google Pay, **Then** the pass displays their core profile information and QR code for quick access
4. **Given** someone receives a DevCard link, **When** they open it, **Then** they see the card holder's profile without needing to create an account

---

### User Story 3 - Profile Customization (Priority: P2)

A developer wants to personalize their DevCard beyond what GitHub provides - adding custom bio, social links, featured projects, tech stack, and availability status.

**Why this priority**: Customization increases the value and professionalism of cards, but the auto-generated GitHub data provides sufficient value for MVP. This enhances but doesn't enable the core functionality.

**Independent Test**: Can be fully tested by accessing card editor and verifying each customization option saves and displays correctly on the public card.

**Acceptance Scenarios**:

1. **Given** a user is viewing their card, **When** they click "Edit Profile", **Then** they can modify bio, add social links (Twitter, LinkedIn, personal website), and select featured repositories
2. **Given** a user is editing their profile, **When** they add technologies to their tech stack, **Then** the card displays these with appropriate icons or badges
3. **Given** a user wants to show availability, **When** they toggle availability status, **Then** their card displays "Open to opportunities", "Available for collaboration", or "Not available"
4. **Given** a user has a custom domain, **When** they configure it in settings, **Then** their card is accessible via their custom domain (requires DNS verification)

---

### User Story 4 - Connection Management (Priority: P2)

Two developers meet at a conference and want to connect. They can send connection requests through DevCard, view their network, and manage connections.

**Why this priority**: Networking features enhance value but aren't essential for initial card creation and sharing. Can be added after core functionality is proven.

**Independent Test**: Can be fully tested by creating two test accounts, sending connection requests, accepting/declining them, and viewing the connections list.

**Acceptance Scenarios**:

1. **Given** a user views another developer's card, **When** they click "Connect", **Then** a connection request is sent and the recipient receives a notification
2. **Given** a user receives a connection request, **When** they accept it, **Then** both users appear in each other's "My Network" section
3. **Given** a user has connections, **When** they view "My Network", **Then** they see all accepted connections with quick access to each person's card
4. **Given** a user wants to manage connections, **When** they decline or remove a connection, **Then** the connection is removed and no personal data is shared

---

### User Story 5 - Analytics Dashboard (Priority: P3)

A developer wants to understand how their DevCard is performing - views, shares, connection requests, and QR code scans.

**Why this priority**: Analytics provide valuable insights but aren't necessary for core networking functionality. This is a retention and engagement feature.

**Independent Test**: Can be fully tested by generating card activity (views, shares, scans) and verifying the analytics dashboard displays accurate metrics with appropriate visualizations.

**Acceptance Scenarios**:

1. **Given** a user's card has been viewed, **When** they access their analytics dashboard, **Then** they see total views, unique visitors, and view trends over time
2. **Given** a user's QR code has been scanned, **When** they check analytics, **Then** they see scan count, locations, and timestamps
3. **Given** a user has shared their card, **When** they view share analytics, **Then** they see which sharing methods were used most frequently
4. **Given** a user wants to understand engagement, **When** they view their dashboard, **Then** they see connection request acceptance rate and response times

---

### User Story 6 - Premium Features and Monetization (Priority: P3)

A developer wants advanced features like custom themes, priority support, advanced analytics, and team/organization profiles. They subscribe to premium tier.

**Why this priority**: Monetization is important for sustainability but not necessary for initial product validation. Free tier must prove value first.

**Independent Test**: Can be fully tested by subscribing to premium, verifying premium features are unlocked, and confirming billing processes correctly.

**Acceptance Scenarios**:

1. **Given** a free user wants premium features, **When** they click "Upgrade to Premium", **Then** they see pricing options and can subscribe via Stripe
2. **Given** a premium subscriber, **When** they access theme customization, **Then** they can choose from premium themes and customize colors, fonts, and layouts
3. **Given** a premium subscriber wants team features, **When** they create an organization profile, **Then** they can manage team members and create a company DevCard
4. **Given** a premium subscription approaches expiration, **When** the renewal date is 7 days away, **Then** the user receives reminder emails

---

### Edge Cases

- **User has no public repositories**: System displays profile information without repository section; suggests making repos public or highlights contributions to other projects
- **User has minimal GitHub activity**: Card shows basic profile data; system provides tips for building presence (contributing to open source, creating projects)
- **GitHub data fetch fails**: System displays cached data with "Last updated: [date]" notice and retry option
- **QR code cannot be generated**: System offers alternative sharing methods and logs error for debugging
- **Connection request spam**: Rate limiting enforced (max 20 requests per hour); users can block others from sending requests
- **Wallet pass generation fails**: System falls back to QR code download and notifies user of alternative
- **Premium subscription payment fails**: User receives payment failure notification with 3-day grace period before downgrade
- **User deletes GitHub account**: DevCard marked as inactive; data retained per privacy policy; user can reactivate by reconnecting
- **Custom domain verification fails**: System provides clear DNS configuration instructions and verification status
- **Concurrent profile edits**: Last-write-wins with auto-save and conflict resolution prompts

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**

- **FR-001**: System MUST authenticate users exclusively via GitHub OAuth
- **FR-002**: System MUST request only public profile, email, and public repository access scopes
- **FR-003**: System MUST create user accounts automatically upon first successful GitHub OAuth
- **FR-004**: System MUST maintain secure session management with automatic expiration after 30 days of inactivity

**Card Generation & Display**

- **FR-005**: System MUST automatically fetch and display user's GitHub username, avatar, bio, location, and public email
- **FR-006**: System MUST calculate and display GitHub statistics (total repos, stars received, followers, contribution streak)
- **FR-007**: System MUST identify and showcase top repositories based on stars, forks, and recent activity
- **FR-008**: System MUST generate unique, readable URLs for each card (format: devius.io/username)
- **FR-009**: System MUST update GitHub data within 5 minutes when user manually triggers refresh
- **FR-010**: System MUST cache GitHub data and refresh automatically every 24 hours

**Profile Customization**

- **FR-011**: Users MUST be able to edit custom bio (separate from GitHub bio, max 500 characters)
- **FR-012**: Users MUST be able to add social media links (Twitter, LinkedIn, personal website, portfolio)
- **FR-013**: Users MUST be able to select up to 6 featured repositories from their GitHub repos
- **FR-014**: Users MUST be able to add technologies to tech stack from predefined list
- **FR-015**: Users MUST be able to set availability status (Open to opportunities, Available for collaboration, Not available, Custom message)
- **FR-016**: Premium users MUST be able to customize card theme, colors, and layout
- **FR-017**: Premium users MUST be able to configure custom domains with DNS verification

**Sharing & Discovery**

- **FR-018**: System MUST generate QR codes for each DevCard containing the card URL
- **FR-019**: System MUST provide share buttons for Twitter, LinkedIn, email, and direct link copy
- **FR-020**: System MUST generate Apple Wallet and Google Pay passes with core profile info and QR code
- **FR-021**: System MUST allow public viewing of DevCards without authentication
- **FR-022**: System MUST provide embeddable widget code for displaying cards on external websites

**Networking & Connections**

- **FR-023**: Users MUST be able to send connection requests to other DevCard users
- **FR-024**: System MUST notify users of new connection requests via email and in-app notifications
- **FR-025**: Users MUST be able to accept or decline connection requests
- **FR-026**: Users MUST be able to view all accepted connections in "My Network" section
- **FR-027**: Users MUST be able to remove connections at any time
- **FR-028**: System MUST enforce rate limiting of 20 connection requests per hour per user
- **FR-029**: Users MUST be able to block other users from sending connection requests

**Analytics**

- **FR-030**: System MUST track card views, unique visitors, QR scans, and share actions
- **FR-031**: Users MUST be able to view analytics dashboard showing total views and trends
- **FR-032**: Premium users MUST see detailed analytics including geographic location, referral sources, and engagement metrics
- **FR-033**: System MUST not track personally identifiable information of card viewers

**Premium Features**

- **FR-034**: System MUST support subscription management via Stripe
- **FR-035**: System MUST offer monthly and annual subscription plans
- **FR-036**: Premium users MUST have access to custom themes, advanced analytics, and priority support
- **FR-037**: Premium users MUST be able to create organization/team profiles
- **FR-038**: System MUST automatically downgrade users to free tier when subscription expires
- **FR-039**: System MUST send payment reminders 7 days before subscription renewal

**Data & Privacy**

- **FR-040**: System MUST comply with GDPR and allow users to export all personal data
- **FR-041**: System MUST allow users to delete their account and all associated data
- **FR-042**: System MUST cache GitHub data to reduce API rate limit issues
- **FR-043**: System MUST display "Last updated" timestamp on cards
- **FR-044**: System MUST not share user email addresses publicly unless explicitly enabled by user

**Error Handling & Resilience**

- **FR-045**: System MUST gracefully handle GitHub API failures by displaying cached data
- **FR-046**: System MUST provide clear error messages when GitHub data cannot be fetched
- **FR-047**: System MUST handle users with minimal GitHub activity by adapting card layout
- **FR-048**: System MUST provide fallback sharing methods if wallet pass or QR generation fails

### Key Entities

- **User**: Represents a developer using the platform; attributes include GitHub ID, username, email, premium status, subscription details, preferences, created date
- **DevCard**: Represents a developer's digital card; attributes include unique URL, custom bio, social links, featured repositories, tech stack, availability status, theme settings, visibility status
- **Connection**: Represents relationship between two users; attributes include requester, recipient, status (pending/accepted/declined), request date, acceptance date
- **Analytics Event**: Represents tracking data for card interactions; attributes include event type (view/scan/share), timestamp, anonymous visitor ID, referral source, geographic data (country/city)
- **GitHub Data Cache**: Represents cached GitHub profile information; attributes include username, avatar URL, bio, public repos, stars count, followers, last fetched timestamp
- **Repository**: Represents a GitHub repository featured on card; attributes include repo name, description, language, stars, forks, last updated, URL
- **Subscription**: Represents premium subscription; attributes include user reference, plan type (monthly/annual), status (active/canceled/expired), start date, renewal date, payment method
- **Notification**: Represents system notifications; attributes include user reference, type (connection request/system update), content, read status, timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can create a complete DevCard in under 60 seconds from landing page to shareable link
- **SC-002**: Card viewers can access and view a DevCard in under 2 seconds on standard broadband connections
- **SC-003**: QR code generation completes in under 1 second for 95% of requests
- **SC-004**: System successfully generates wallet passes for 98% of requests
- **SC-005**: GitHub data syncs complete within 5 minutes for manual refresh requests
- **SC-006**: 80% of new users successfully share their card within first session
- **SC-007**: Connection request acceptance rate exceeds 60% among active users
- **SC-008**: Premium conversion rate reaches 5% within first 90 days of user signup
- **SC-009**: Users can customize their profile and save changes in under 3 minutes
- **SC-010**: Analytics dashboards load in under 2 seconds with up-to-date data
- **SC-011**: System handles 10,000 concurrent card views without performance degradation
- **SC-012**: User satisfaction score (measured via in-app survey) exceeds 4.2/5.0
- **SC-013**: 90% of users successfully complete their first connection request without support
- **SC-014**: Card share rate (shares per active user) exceeds 3 shares per month
- **SC-015**: Premium subscriber retention rate exceeds 75% after first renewal
