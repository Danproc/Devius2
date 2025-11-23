# Research: StackPass Premium Membership System

**Feature**: 005-premium-stripe
**Date**: 2025-11-23
**Purpose**: Document technology decisions, architectural patterns, and best practices for implementing the premium membership system

## Technology Stack Research

### 1. Stripe Integration (v17.7.0)

**Decision**: Use existing Stripe SDK v17.7.0 for all subscription management

**Rationale**:
- Already integrated and configured in the codebase
- Comprehensive TypeScript support with API version '2025-02-24.acacia'
- Industry-standard for SaaS subscriptions
- Robust webhook system with signature verification
- Stripe Customer Portal provides PCI-compliant payment management UI

**Alternatives Considered**:
- **PayPal Subscriptions**: Limited customization, less developer-friendly API, poor TypeScript support
- **LemonSqueezy**: Newer platform, less proven at scale, higher merchant fees
- **Paddle**: Good for global payments but higher fees (5% + payment processing)
- **Custom payment processor**: Massive compliance burden, reinventing the wheel

**Best Practices Found**:
- Always verify webhook signatures using `stripe.webhooks.constructEvent()`
- Use idempotency keys for subscription operations to prevent duplicate charges
- Implement retry logic for failed webhooks (Stripe retries for 3 days)
- Store Stripe customer ID and subscription ID on user record for quick lookups
- Use metadata fields to track application-specific data (e.g., `tier_code`, `user_id`)

### 2. Database Schema with Drizzle ORM (v0.38.4)

**Decision**: Extend existing user and plans tables with Drizzle ORM schema definitions

**Rationale**:
- Type-safe schema management already in place
- PostgreSQL via Neon serverless provides scalability
- Drizzle migrations ensure schema version control
- Excellent TypeScript inference for queries

**Schema Design Pattern**:
```typescript
// Users table additions:
premium_tier: text (e.g., 'premium', 'premium_pro')
is_premium: boolean (flag for quick access checks)
premium_expires_at: timestamp (for expiry monitoring)

// Plans table repurposing:
- Keep for pricing configuration
- Add tier_code for mapping to user.premium_tier
- Remove quota-related fields
- Add active flag to hide/show tiers
```

**Migration Strategy**:
1. Add new fields to users table (nullable initially)
2. Backfill existing premium users with tier codes
3. Remove planId foreign key constraint
4. Drop unused plan management tables
5. Update plans table to focus on tier configuration

**Best Practices Found**:
- Use database transactions for subscription state changes
- Index premium_expires_at for efficient expiry queries
- Use JSONB for flexible feature lists per tier
- Implement database-level constraints for data integrity

### 3. Email System: React Email + Resend

**Decision**: React Email v4.0.16 for templates, Resend v6.4.2 for delivery

**Rationale**:
- Component-based email templates (reusable, testable)
- Live preview server on port 3001 during development
- Resend provides excellent deliverability rates
- Already configured with RESEND_API_KEY

**Email Templates Pattern**:
```typescript
interface EmailProps {
  userName: string;
  tierName: string;
  expiresAt: Date;
  billingPortalUrl: string;
}

// Consistent branding across all subscription emails
// Include clear CTAs
// Mobile-responsive design
// Plain text fallback for accessibility
```

**Alternatives Considered**:
- **SendGrid**: Complex pricing tiers, outdated API design
- **AWS SES**: Requires AWS account setup, more configuration
- **Mailgun**: Less modern developer experience
- **Plain HTML**: No component reuse, harder to maintain

**Best Practices Found**:
- Use preview text to summarize email content (50-100 chars)
- Test emails across major email clients (Gmail, Outlook, Apple Mail)
- Include unsubscribe link for transactional emails (legal requirement in some jurisdictions)
- Use UTM parameters in links for email campaign tracking
- Implement email delivery monitoring and retry logic

### 4. Background Jobs: Inngest (v3.34.5)

**Decision**: Use existing Inngest setup for subscription expiry checks and reminder emails

**Rationale**:
- Already integrated for daily GitHub sync and credit expiry
- Built-in retry logic and error handling
- Cron-like scheduling with `inngest.createScheduledFunction()`
- Development server on port 8288 for local testing

**Job Patterns**:
```typescript
// Daily expiry checker at 9 AM UTC
inngest.createScheduledFunction(
  { id: "check-subscription-expiry", name: "Check Subscription Expiry" },
  { cron: "0 9 * * *" },
  async ({ step }) => {
    // Find subscriptions expiring in 7, 3, 1 days
    // Send reminder emails via Resend
    // Log reminder sent to prevent duplicates
  }
);
```

**Alternatives Considered**:
- **BullMQ**: Requires Redis dependency, overkill for simple cron jobs
- **node-cron**: No retry logic, no visibility into job history
- **Vercel Cron**: Limited to Pro plan, less flexible scheduling
- **Custom implementation**: Reinventing the wheel

**Best Practices Found**:
- Use step functions for better observability (`step.run()`, `step.sendEvent()`)
- Implement idempotency by checking if reminder already sent
- Log all email sends for debugging and compliance
- Use separate jobs for different reminder intervals (7d, 3d, 1d)

### 5. Testing Strategy: Vitest + Playwright

**Decision**: Unit tests with Vitest v4.0.8, E2E tests with Playwright v1.56.1

**Rationale**:
- Vitest provides fast, modern testing with excellent TypeScript support
- Playwright covers critical subscription flows in real browsers
- Both already configured in the project
- @testing-library/react for component testing

**Critical Test Scenarios**:
1. **Unit Tests (Vitest)**:
   - Premium access check logic
   - Subscription state transitions
   - Webhook signature verification
   - Email template rendering

2. **E2E Tests (Playwright)**:
   - Complete subscription flow (pricing page → checkout → activation)
   - Billing dashboard access and display
   - Upgrade/downgrade flows
   - Cancellation process

**Stripe Test Mode**:
- Use Stripe test mode with test credit cards (4242 4242 4242 4242)
- Use Stripe CLI to forward webhooks to localhost
- Test all webhook events (checkout.session.completed, subscription.updated, etc.)

**Best Practices Found**:
- Mock Stripe API calls in unit tests, use real Stripe test mode in E2E
- Test webhook retry scenarios (simulate failures)
- Verify email sends in test environment (use Resend test mode)
- Test subscription edge cases (payment failures, concurrent updates)

---

## Architectural Patterns

### Pattern 1: Premium Access Control

**Pattern**: Middleware-based access control with database-backed premium checks

**Implementation**:
```typescript
// Consolidated in /src/lib/premium/check-premium.ts
export async function checkPremium(userId: string): Promise<PremiumStatus> {
  const user = await db.select().from(users).where(eq(users.id, userId));

  if (!user.is_premium) return { isPremium: false };

  const now = new Date();
  const expiresAt = new Date(user.premium_expires_at);

  if (now > expiresAt) {
    // Auto-revoke expired premium
    await revokeExpiredPremium(userId);
    return { isPremium: false, expired: true };
  }

  return {
    isPremium: true,
    tier: user.premium_tier,
    expiresAt,
    isExpiringSoon: (expiresAt.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000
  };
}
```

**Benefits**:
- Single source of truth for premium status
- Automatic expiry handling
- Expiry warnings for UI indicators
- Type-safe return values

### Pattern 2: Webhook Event Processing

**Pattern**: Event-driven architecture with idempotent webhook handlers

**Implementation**:
```typescript
// Stripe webhook handler structure
export async function handleWebhook(req: Request) {
  // 1. Verify signature
  const signature = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, signature, secret);

  // 2. Route to handler
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event);
      break;
    // ... other events
  }

  // 3. Return 200 to acknowledge receipt
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

**Benefits**:
- Signature verification prevents spoofed webhooks
- Fast acknowledgment prevents Stripe retries
- Event routing keeps handlers focused
- Idempotency through database constraints

### Pattern 3: Dynamic Pricing Configuration

**Pattern**: Database-driven pricing with Stripe product mapping

**Implementation**:
```typescript
// Pricing API endpoint
export async function GET() {
  const tiers = await db
    .select()
    .from(plans)
    .where(and(
      eq(plans.active, true),
      isNotNull(plans.tier_code)
    ));

  return Response.json({
    tiers: tiers.map(tier => ({
      code: tier.tier_code,
      name: tier.name,
      features: tier.features, // JSONB array
      pricing: {
        monthly: {
          amount: tier.monthlyPrice,
          priceId: tier.monthlyStripePriceId
        },
        annual: {
          amount: tier.yearlyPrice,
          priceId: tier.yearlyStripePriceId
        }
      }
    }))
  });
}
```

**Benefits**:
- Pricing changes without code deployment
- A/B testing different price points
- Easy tier addition/removal
- Audit trail of pricing changes

---

## Code Cleanup Strategy

### Removal Checklist

**Payment Provider Integrations to Remove**:
- ✅ `/src/lib/dodopayments/` (entire directory)
- ✅ `/src/app/api/webhooks/dodo/route.ts`
- ✅ `/src/app/api/webhooks/paypal/route.ts`
- ✅ `/src/lib/lemonsqueezy/` (entire directory)
- ✅ Remove from package.json: dodopayments, @aws-sdk/client-ses

**Legacy Plan Management to Remove**:
- ✅ `/src/lib/plans/` (entire directory except types that are reused)
- ✅ Plan-related API routes in `/src/app/api/plans/`
- ✅ Plan management components in `/src/components/admin/plans/`
- ✅ Quota system references

**Database Schema Cleanup**:
- ✅ Remove `planId` field from users table
- ✅ Remove `quotas` field from plans table
- ✅ Drop paypal_context table (if not used elsewhere)

**Expected Impact**:
- ~3,000 lines of code removed
- ~5 npm packages removed
- ~30% reduction in payment-related code complexity
- Simplified webhook handler (from ~500 to ~200 lines)

---

## Security Considerations

### 1. Webhook Security
- ✅ Signature verification using Stripe-Signature header
- ✅ Replay attack prevention (Stripe includes timestamp in signature)
- ✅ HTTPS-only endpoints (enforced by Next.js in production)

### 2. Payment Data Handling
- ✅ Never store credit card numbers (handled by Stripe)
- ✅ Use Stripe Customer Portal for payment method updates (PCI compliance)
- ✅ Store only Stripe customer/subscription IDs

### 3. Access Control
- ✅ Premium feature gates check both `is_premium` and `premium_expires_at`
- ✅ Automatic expiry enforcement on every premium check
- ✅ Session-based authentication via NextAuth

### 4. Data Privacy
- ✅ Subscription data only accessible to authenticated user
- ✅ Email notifications sent only to user's registered email
- ✅ Invoice data fetched from Stripe (not stored in database)

---

## Performance Optimization

### Database Indexes
```sql
-- Required indexes for premium system
CREATE INDEX idx_users_premium_expires ON users(premium_expires_at)
  WHERE is_premium = true;

CREATE INDEX idx_plans_active_tier ON plans(active, tier_code)
  WHERE tier_code IS NOT NULL;

CREATE INDEX idx_users_stripe_customer ON users(stripeCustomerId)
  WHERE stripeCustomerId IS NOT NULL;
```

### Caching Strategy
- ✅ Pricing data cached via Next.js ISR (revalidate: 3600s)
- ✅ User premium status cached in session (revalidate on login)
- ✅ Stripe subscription data cached with short TTL (60s)

### Webhook Performance
- ✅ Acknowledge webhook immediately (return 200)
- ✅ Process events asynchronously if needed
- ✅ Use database transactions for atomic updates
- ✅ Log webhook processing time for monitoring

---

## Deployment Checklist

### Stripe Configuration
- [ ] Create premium tier products in Stripe Dashboard
- [ ] Generate monthly and annual price IDs for each tier
- [ ] Configure webhook endpoint URL: `https://stackpass.dev/api/webhooks/stripe`
- [ ] Copy webhook signing secret to environment variables
- [ ] Test webhook delivery with Stripe CLI

### Environment Variables
```bash
# Stripe (REQUIRED)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email (REQUIRED)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@stackpass.dev"

# Database (REQUIRED)
DATABASE_URL="postgresql://..."
```

### Database Migration
- [ ] Run migration to add `premium_tier` field
- [ ] Run migration to remove `planId` field
- [ ] Seed initial premium tiers (Premium, Premium Pro)
- [ ] Backfill existing premium users with tier codes

### Testing Before Launch
- [ ] Test complete subscription flow in Stripe test mode
- [ ] Verify all webhook events process correctly
- [ ] Test email delivery for all templates
- [ ] Run E2E tests in staging environment
- [ ] Verify Stripe Customer Portal configuration
- [ ] Test upgrade, downgrade, and cancellation flows

---

## Open Questions & Future Enhancements

### Open Questions
- ✅ **Resolved**: Use Stripe-only (no other payment providers)
- ✅ **Resolved**: Dynamic pricing from database (yes)
- ✅ **Resolved**: Premium-only model (deprecate plan management)

### Future Enhancements (Out of Scope)
- Team/organization billing (multiple users per subscription)
- Usage-based pricing (metered billing)
- Free trial periods (requires additional Stripe configuration)
- Referral program integration
- Annual billing discount automation
- Multi-currency support
- Tax handling (Stripe Tax)

---

## Conclusion

The research phase has confirmed that StackPass has a strong foundation for implementing the premium membership system:

1. **Existing Infrastructure**: Stripe SDK, Drizzle ORM, React Email, and Inngest are all production-ready
2. **Proven Patterns**: Webhook handling, email delivery, and background jobs already working in production
3. **Clear Path Forward**: Remove legacy code, enhance existing components, add missing email templates
4. **Minimal Risk**: Building on established patterns reduces implementation risk
5. **Scalable Design**: Database-driven pricing and Stripe's infrastructure support growth

**Next Phase**: Generate data model, API contracts, and quickstart documentation (Phase 1)
