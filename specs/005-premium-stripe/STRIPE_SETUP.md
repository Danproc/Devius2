# Stripe Setup Guide for StackPass Premium

**Status**: ⚠️ PLACEHOLDERS IN USE - Replace with real values before testing

## Placeholder Price IDs (Current)

The following placeholder price IDs are configured in `.env.local`:

| Tier | Frequency | Price | Placeholder ID | Real ID (TODO) |
|------|-----------|-------|----------------|----------------|
| Premium | Monthly | $9.00 | `price_premium_monthly_placeholder` | `[CREATE IN STRIPE]` |
| Premium | Annual | $90.00 | `price_premium_annual_placeholder` | `[CREATE IN STRIPE]` |
| Premium Pro | Monthly | $29.00 | `price_premium_pro_monthly_placeholder` | `[CREATE IN STRIPE]` |
| Premium Pro | Annual | $290.00 | `price_premium_pro_annual_placeholder` | `[CREATE IN STRIPE]` |

## How to Replace with Real Stripe Price IDs

### Step 1: Create Products in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"

**Premium Product**:
- Name: `Premium`
- Description: `StackPass Premium - Custom themes, analytics, priority support`
- Click "Add pricing"
  - **Monthly**: $9.00 USD, Recurring, Monthly billing
  - **Annual**: $90.00 USD, Recurring, Yearly billing
- Save product
- **Copy the price IDs** (they look like `price_1ABcd...`)

**Premium Pro Product**:
- Name: `Premium Pro`
- Description: `StackPass Premium Pro - All Premium features + custom domain, API access`
- Click "Add pricing"
  - **Monthly**: $29.00 USD, Recurring, Monthly billing
  - **Annual**: $290.00 USD, Recurring, Yearly billing
- Save product
- **Copy the price IDs**

### Step 2: Update Environment Variables

Replace the placeholders in `.env.local`:

```bash
STRIPE_PREMIUM_MONTHLY_PRICE_ID="price_ABC123..."  # Real ID from Stripe
STRIPE_PREMIUM_ANNUAL_PRICE_ID="price_DEF456..."   # Real ID from Stripe
STRIPE_PREMIUM_PRO_MONTHLY_PRICE_ID="price_GHI789..."  # Real ID from Stripe
STRIPE_PREMIUM_PRO_ANNUAL_PRICE_ID="price_JKL012..."   # Real ID from Stripe
```

### Step 3: Update Database Seed

After getting real price IDs, update the database seed in Phase 2 (T010) to use real Stripe price IDs.

### Step 4: Configure Webhook

1. Go to Developers → Webhooks → Add endpoint
2. **Local Development**: Use Stripe CLI
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. **Production**: Add endpoint URL: `https://stackpass.dev/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret and update:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_REAL_SECRET_HERE"
   ```

### Step 5: Update API Keys

1. Go to Developers → API keys
2. Copy Publishable and Secret keys:
   ```bash
   STRIPE_SECRET_KEY="sk_test_..." # or sk_live_ for production
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_ for production
   ```

## Testing Checklist

Once real Stripe configuration is complete:

- [ ] Pricing page loads with correct prices from Stripe
- [ ] Checkout creates valid Stripe session
- [ ] Test card (4242 4242 4242 4242) completes successfully
- [ ] Webhook processes and upgrades user to premium
- [ ] Welcome email sends after subscription
- [ ] Stripe Customer Portal accessible from billing dashboard

## Notes

- **Current Status**: System will work with placeholders but won't process real payments
- **Database seeding** (T010) uses these placeholder IDs - update after Stripe setup
- **Testing**: Use Stripe test mode with test cards until production ready
- **Production**: Switch to live keys and update webhook endpoints
