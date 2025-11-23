# Stripe Setup Guide for StackPass Premium

**Status**: ⚠️ PLACEHOLDERS IN USE - Replace with real values before testing

## Placeholder Price IDs (Current)

The following placeholder price ID is configured in `.env.local`:

| Tier | Frequency | Price | Placeholder ID | Real ID (TODO) |
|------|-----------|-------|----------------|----------------|
| Premium | Annual | $49.00/year | `price_premium_annual_placeholder` | `[CREATE IN STRIPE]` |

**Note**: StackPass uses a simple pricing model - Free or Premium ($49/year). No monthly billing option.

## How to Replace with Real Stripe Price IDs

### Step 1: Create Product in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"

**Premium Product**:
- Name: `StackPass Premium`
- Description: `StackPass Premium - Unlock all features: custom themes, analytics, priority support, custom domain`
- Click "Add pricing"
  - **Annual**: $49.00 USD, Recurring, Yearly billing
- Save product
- **Copy the annual price ID** (looks like `price_1ABcd...`)

### Step 2: Update Environment Variables

Replace the placeholder in `.env.local`:

```bash
STRIPE_PREMIUM_ANNUAL_PRICE_ID="price_ABC123..."  # Real annual price ID from Stripe
```

### Step 3: Update Database Seed

After getting the real price ID, run the seed script to create the Premium tier:

```bash
npx tsx scripts/seed-premium-tiers.ts
```

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
