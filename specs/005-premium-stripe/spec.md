# Feature Specification: StackPass Premium Membership System

**Feature Branch**: `005-premium-stripe`
**Created**: 2025-11-23
**Status**: Draft
**Input**: User description: "StackPass Premium Membership System - Simplify to premium-only system using Stripe with dynamic pricing from database and enhanced subscription management"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subscribe to Premium (Priority: P1)

A free StackPass user wants to upgrade to premium to access exclusive features like custom themes, advanced analytics, and priority support. They browse available premium tiers, select one, complete payment, and immediately gain access to premium features.

**Why this priority**: This is the core revenue-generating flow. Without subscription capability, the entire premium system has no value. This represents the minimum viable product for monetization.

**Independent Test**: Can be fully tested by creating a test user account, navigating to the pricing page, completing a Stripe checkout session, and verifying premium status is activated upon successful payment. Delivers immediate value by converting free users to paying customers.

**Acceptance Scenarios**:

1. **Given** a logged-in free user, **When** they view the pricing page, **Then** they see all available premium tiers with current pricing pulled from the database
2. **Given** a user selects a premium tier, **When** they click "Subscribe", **Then** they are redirected to a Stripe checkout session with the correct price and billing frequency
3. **Given** a user completes Stripe checkout, **When** the payment is successful, **Then** their account is immediately upgraded to premium status
4. **Given** a newly premium user, **When** they return to the app, **Then** they can access all premium features for their tier
5. **Given** a user abandons checkout, **When** they return to the pricing page, **Then** they can retry subscription without any issues

---

### User Story 2 - Manage Existing Subscription (Priority: P2)

An existing premium subscriber wants to view their subscription details, upgrade/downgrade their tier, update payment methods, view invoice history, or cancel their subscription. They access a dedicated billing dashboard that provides full control over their subscription.

**Why this priority**: Critical for customer retention and satisfaction. Users need self-service tools to manage their subscriptions without support intervention. Reduces churn and support burden.

**Independent Test**: Can be tested independently with a pre-existing premium account. Test by accessing the billing dashboard, attempting upgrades/downgrades, updating payment methods through Stripe Customer Portal, and verifying changes are reflected correctly.

**Acceptance Scenarios**:

1. **Given** a premium subscriber, **When** they view the billing dashboard, **Then** they see their current tier, next billing date, payment method on file, and subscription status
2. **Given** a subscriber wants to upgrade, **When** they select a higher tier, **Then** the system prorates the charge and immediately grants access to the new tier's features
3. **Given** a subscriber wants to downgrade, **When** they select a lower tier, **Then** the change is scheduled for the next billing cycle and they retain current tier benefits until then
4. **Given** a subscriber clicks "Manage Subscription", **When** they are redirected to Stripe Customer Portal, **Then** they can update payment methods, view invoices, and cancel subscription
5. **Given** a subscriber cancels, **When** the cancellation is confirmed, **Then** they retain premium access until the end of their billing period, then revert to free tier

---

### User Story 3 - Receive Subscription Notifications (Priority: P3)

Premium subscribers receive timely email notifications about their subscription status, including welcome emails upon first subscription, renewal confirmations, payment failures, upcoming expiration warnings (7, 3, and 1 day before), and cancellation confirmations.

**Why this priority**: Enhances user experience and reduces involuntary churn by keeping users informed. While important, the subscription can function without these emails - they primarily improve communication and retention.

**Independent Test**: Can be tested by triggering specific subscription events (new subscription, upcoming expiry, payment failure) and verifying that the correct email template is sent with accurate information.

**Acceptance Scenarios**:

1. **Given** a user just subscribed, **When** payment is confirmed, **Then** they receive a welcome email with subscription details and feature access information
2. **Given** a subscription is expiring soon, **When** there are 7, 3, or 1 days remaining, **Then** the user receives a reminder email with a clear call-to-action to renew
3. **Given** a subscription payment fails, **When** Stripe notifies the system, **Then** the user receives an email explaining the issue and how to update payment information
4. **Given** a user cancels their subscription, **When** the cancellation is processed, **Then** they receive a confirmation email with the date when premium access ends

---

### User Story 4 - Dynamic Pricing Administration (Priority: P2)

System administrators need to manage premium tier pricing without code changes. They configure pricing tiers in the database (name, features, monthly/annual prices) which automatically sync with Stripe products and display on the pricing page.

**Why this priority**: Enables business flexibility to test pricing strategies, run promotions, and adapt to market conditions without developer intervention. Essential for a scalable SaaS business but can initially launch with fixed pricing.

**Independent Test**: Can be tested by updating a plan's pricing in the database and verifying that (1) the pricing page reflects the new price, and (2) new subscriptions use the updated Stripe price ID.

**Acceptance Scenarios**:

1. **Given** an admin updates a tier's monthly price in the database, **When** a user views the pricing page, **Then** the updated price is displayed
2. **Given** pricing changes are made, **When** the system detects the change, **Then** administrators are notified to update corresponding Stripe price IDs
3. **Given** a new premium tier is added to the database, **When** it's marked as active, **Then** it appears on the pricing page with all configured features

---

### Edge Cases

- What happens when a user's payment fails during renewal? (Retry logic, grace period, downgrade timing)
- How does the system handle users who subscribed before a tier was removed from offerings?
- What if a user attempts to subscribe to the same tier they already have?
- How are refunds handled if a user cancels immediately after subscribing?
- What happens if Stripe webhooks are delayed or fail to deliver?
- How does the system handle concurrent subscription changes (user upgrading while payment is processing)?
- What if a user's subscription expires while they're actively using premium features?
- How are timezone differences handled for expiration dates and billing cycles?

## Requirements *(mandatory)*

### Functional Requirements

**Database & Schema**
- **FR-001**: System MUST store premium tier information including tier code, name, features list, monthly price, annual price, and Stripe price IDs
- **FR-002**: System MUST track user premium status including is_premium flag, premium_tier code, premium_expires_at timestamp, Stripe customer ID, and Stripe subscription ID
- **FR-003**: System MUST remove plan management references (planId field) from the user schema while preserving credit system functionality

**Stripe Integration**
- **FR-004**: System MUST create Stripe checkout sessions with correct price ID, customer email, and success/cancel URLs
- **FR-005**: System MUST process Stripe webhooks for checkout completion, subscription updates, subscription cancellations, payment successes, and payment failures
- **FR-006**: System MUST verify webhook signatures to ensure requests originate from Stripe
- **FR-007**: System MUST update user premium status in the database immediately upon receiving successful payment webhooks
- **FR-008**: System MUST handle subscription tier upgrades with prorated billing through Stripe
- **FR-009**: System MUST schedule tier downgrades for the next billing cycle (no immediate effect)

**Pricing & Billing UI**
- **FR-010**: System MUST display a pricing page that dynamically loads tier information from the database
- **FR-011**: Pricing page MUST show tier name, features list, monthly price, annual price, and a clear call-to-action button
- **FR-012**: System MUST provide a billing dashboard showing current tier, subscription status, next billing date, and payment method
- **FR-013**: Billing dashboard MUST display subscription history including past invoices
- **FR-014**: System MUST provide a "Manage Subscription" button that redirects to Stripe Customer Portal
- **FR-015**: Billing dashboard MUST show a clear indication when subscription is expiring soon (within 7 days)

**Email Notifications**
- **FR-016**: System MUST send a welcome email when a user first subscribes to premium
- **FR-017**: System MUST send expiration reminder emails at 7 days, 3 days, and 1 day before subscription expires
- **FR-018**: System MUST send a payment failure notification when Stripe reports a failed payment
- **FR-019**: System MUST send a cancellation confirmation email when a user cancels their subscription
- **FR-020**: All subscription emails MUST include a link to the billing dashboard and relevant call-to-action

**Access Control**
- **FR-021**: System MUST gate premium features based on is_premium flag and premium_tier code
- **FR-022**: System MUST immediately revoke premium access when subscription expires (premium_expires_at is in the past)
- **FR-023**: System MUST allow users to retain premium access for the remainder of their billing period after cancellation
- **FR-024**: System MUST display appropriate upgrade prompts to free users when they attempt to access premium features

**Code Cleanup**
- **FR-025**: System MUST remove all Dodo Payments, PayPal, and LemonSqueezy integration code
- **FR-026**: System MUST remove legacy plan management webhook handlers and related functions
- **FR-027**: System MUST consolidate premium checking logic into a single, well-documented module

### Key Entities

- **Premium Tier**: Represents a subscription level (e.g., "Premium", "Premium Pro") with associated features, pricing (monthly/annual), and Stripe product/price IDs
- **User Premium Status**: Tracks whether a user has premium access, which tier they're on, when it expires, and their Stripe customer/subscription identifiers
- **Subscription Event**: Represents webhook events from Stripe (checkout completed, subscription updated, payment failed, etc.)
- **Invoice**: Historical record of subscription payments associated with a user's Stripe customer account
- **Email Notification**: Communication sent to users about subscription status changes (welcome, expiry warning, payment failure, cancellation)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Free users can complete the subscription flow from pricing page to premium activation in under 3 minutes
- **SC-002**: Webhook processing updates user premium status in the database within 5 seconds of Stripe event
- **SC-003**: Pricing page loads tier information from database without hardcoded values, allowing pricing updates without code deployment
- **SC-004**: 95% of subscription events (new, upgrade, downgrade, cancel) are processed successfully without manual intervention
- **SC-005**: Expiration reminder emails are sent within 1 hour of the scheduled time (7, 3, 1 day warnings)
- **SC-006**: Premium users can upgrade or downgrade tiers with changes reflected immediately (upgrades) or at next billing cycle (downgrades)
- **SC-007**: System handles payment failures gracefully with automatic retry logic and clear user communication
- **SC-008**: Billing dashboard displays accurate subscription information with invoice history within 2 seconds of page load
- **SC-009**: Codebase complexity reduces by 30% after removing unused payment providers and legacy plan management code
- **SC-010**: Zero unauthorized access to premium features by users with expired or cancelled subscriptions
