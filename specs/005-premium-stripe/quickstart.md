# Quickstart: StackPass Premium Membership System

**Feature**: 005-premium-stripe
**Audience**: Developers setting up the premium membership system
**Time to Complete**: 30-45 minutes

## Prerequisites

- ✅ Stripe account (https://stripe.com)
- ✅ PostgreSQL database running (Neon/local)
- ✅ Node.js 18+ and pnpm installed
- ✅ Resend API key for email delivery
- ✅ StackPass repository cloned

## Step 1: Stripe Account Setup (15 minutes)

### 1.1 Create Premium Products

1. Log into Stripe Dashboard → Products → Create Product
2. Create "Premium" product:
   - Name: `Premium`
   - Description: `StackPass Premium - Custom themes, analytics, priority support`
3. Add pricing:
   - Monthly: `$9.00 USD` → Note down price ID (starts with `price_`)
   - Annual: `$90.00 USD` → Note down price ID

4. Create "Premium Pro" product:
   - Name: `Premium Pro`
   - Description: `StackPass Premium Pro - All Premium features + custom domain, API access`
5. Add pricing:
   - Monthly: `$29.00 USD` → Note down price ID
   - Annual: `$290.00 USD` → Note down price ID

**Result**: You should have 4 price IDs total (2 products × 2 billing frequencies)

### 1.2 Configure Webhooks

1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - For local development: Use Stripe CLI (see Step 4)
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret (starts with `whsec_`)

### 1.3 Get API Keys

1. Go to Developers → API keys
2. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Environment Configuration (5 minutes)

Create or update `.env.local` with your Stripe credentials:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..." # or sk_live_ for production
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_ for production

# Database
DATABASE_URL="postgresql://..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@stackpass.dev"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000" # or your production URL
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000" # or your production URL
```

## Step 3: Database Migration (10 minutes)

### 3.1 Run Migrations

```bash
# Navigate to project root
cd /path/to/stackpass

# Generate migration
pnpm drizzle-kit generate:pg

# Apply migration
pnpm drizzle-kit push:pg
```

### 3.2 Seed Premium Tiers

Run this SQL in your database client or via `psql`:

```sql
-- Insert Premium tier
INSERT INTO plans (id, tier_code, name, features, monthlyPrice, monthlyStripePriceId, yearlyPrice, yearlyStripePriceId, active, "default")
VALUES (
  gen_random_uuid(),
  'premium',
  'Premium',
  '{"custom_themes": true, "advanced_analytics": true, "priority_support": true}'::jsonb,
  900,  -- $9/month in cents
  'price_YOUR_MONTHLY_PRICE_ID',  -- Replace with actual Stripe price ID
  9000, -- $90/year in cents
  'price_YOUR_ANNUAL_PRICE_ID',   -- Replace with actual Stripe price ID
  true,
  false
);

-- Insert Premium Pro tier
INSERT INTO plans (id, tier_code, name, features, monthlyPrice, monthlyStripePriceId, yearlyPrice, yearlyStripePriceId, active, "default")
VALUES (
  gen_random_uuid(),
  'premium_pro',
  'Premium Pro',
  '{"custom_themes": true, "advanced_analytics": true, "priority_support": true, "custom_domain": true, "api_access": true}'::jsonb,
  2900,  -- $29/month in cents
  'price_YOUR_MONTHLY_PRO_PRICE_ID',  -- Replace
  29000, -- $290/year in cents
  'price_YOUR_ANNUAL_PRO_PRICE_ID',   -- Replace
  true,
  false
);
```

**Important**: Replace `price_YOUR_*_PRICE_ID` with the actual Stripe price IDs from Step 1.1

### 3.3 Verify Migration

```sql
-- Check premium tiers
SELECT tier_code, name, monthlyPrice, yearlyPrice FROM plans WHERE tier_code IS NOT NULL;

-- Should show:
--  tier_code    |     name      | monthlyPrice | yearlyPrice
-- --------------+---------------+--------------+-------------
--  premium      | Premium       |          900 |        9000
--  premium_pro  | Premium Pro   |         2900 |       29000
```

## Step 4: Local Development Testing (10 minutes)

### 4.1 Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux/WSL
# Download from https://stripe.com/docs/stripe-cli
```

### 4.2 Forward Webhooks to Localhost

```bash
# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# You'll see output like:
# > Ready! Your webhook signing secret is whsec_... (^C to quit)
```

Copy the webhook signing secret and update `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."  # Use the secret from stripe listen
```

### 4.3 Start Development Server

```bash
# In a new terminal
pnpm dev

# Server should start on http://localhost:3000
```

### 4.4 Test Subscription Flow

1. Navigate to `http://localhost:3000/app/billing/plans`
2. Click "Subscribe" on Premium tier
3. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
4. Complete checkout
5. Verify:
   - Webhook received in Stripe CLI terminal
   - User premium status updated in database:
     ```sql
     SELECT email, is_premium, premium_tier, premium_expires_at FROM app_user WHERE email = 'your-test-email@example.com';
     ```
   - Welcome email sent (check Resend dashboard)

## Step 5: Email Template Testing (5 minutes)

### 5.1 Preview Email Templates

```bash
# Start React Email dev server (usually auto-starts with pnpm dev)
# If not, run manually:
npx react-email dev --dir ./src/emails --port 3001
```

Navigate to `http://localhost:3001` to preview:
- PremiumWelcomeEmail
- PremiumReminderEmail
- PaymentFailedEmail
- SubscriptionCancelledEmail

### 5.2 Test Email Delivery

```bash
# Trigger test email via Stripe CLI
stripe trigger checkout.session.completed

# Check:
# 1. Stripe CLI shows webhook sent
# 2. Resend dashboard shows email delivered
# 3. Inbox receives welcome email
```

## Step 6: Production Deployment

### 6.1 Update Environment Variables

In your hosting platform (Vercel, etc.), set:

```bash
# Use LIVE keys (not test keys)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Update webhook secret to production endpoint secret
STRIPE_WEBHOOK_SECRET="whsec_..."  # From production webhook endpoint

# Production URLs
NEXT_PUBLIC_APP_URL="https://stackpass.dev"
NEXTAUTH_URL="https://stackpass.dev"
```

### 6.2 Configure Production Webhook

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://stackpass.dev/api/webhooks/stripe`
3. Select same events as local (Step 1.2)
4. Copy signing secret and update production env vars

### 6.3 Update Database

```bash
# Run migration on production database
pnpm drizzle-kit push:pg --url="postgresql://production-db-url"

# Seed premium tiers with LIVE Stripe price IDs
```

## Common Issues & Solutions

### Issue: Webhook signature verification fails

**Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from the webhook endpoint you're using (local CLI vs. dashboard endpoint)

### Issue: User not upgraded after checkout

**Possible causes**:
1. Webhook not received → Check Stripe CLI or dashboard webhook logs
2. Event already processed → Check `subscription_events` table for duplicate `stripeEventId`
3. Database error → Check application logs for errors during webhook processing

**Debug**:
```sql
-- Check if webhook was received
SELECT * FROM subscription_events WHERE stripe_event_id = 'evt_...';

-- Check user premium status
SELECT is_premium, premium_tier, premium_expires_at FROM app_user WHERE email = '...';
```

### Issue: Pricing page shows hardcoded prices

**Solution**: Ensure database has tiers with `tier_code` and `active = true`

```sql
SELECT tier_code, active FROM plans WHERE tier_code IS NOT NULL;
```

### Issue: Email not sending

**Possible causes**:
1. Invalid Resend API key
2. FROM email not verified in Resend
3. Email template error

**Debug**:
- Check Resend dashboard for delivery logs
- Test email template preview on http://localhost:3001
- Check application logs for email send errors

## Testing Checklist

Before considering the setup complete, test:

- ✅ Pricing page displays database-driven tiers
- ✅ Checkout session creates successfully
- ✅ Successful payment upgrades user to premium
- ✅ Welcome email sends after subscription
- ✅ Billing dashboard shows subscription details
- ✅ Stripe Customer Portal accessible from dashboard
- ✅ Premium features are gated correctly
- ✅ Subscription cancellation works
- ✅ Webhook events logged in `subscription_events` table

## Next Steps

After quickstart is complete:

1. Run `/speckit.tasks` to generate implementation task breakdown
2. Implement missing email templates (PaymentFailed, SubscriptionCancelled)
3. Enhance billing dashboard with invoice history
4. Set up Inngest job for expiry reminders
5. Write E2E tests for subscription flow
6. Remove legacy payment provider code

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **Resend Documentation**: https://resend.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs

---

**Setup Complete!** You now have a fully functional premium membership system powered by Stripe. 🎉
