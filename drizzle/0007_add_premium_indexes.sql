-- Create indexes for premium tier queries
-- Run this manually via psql or your database client

-- Index for finding expiring premium subscriptions
CREATE INDEX IF NOT EXISTS idx_users_premium_expires
ON app_user(premium_expires_at)
WHERE is_premium = true;

-- Index for querying users by premium tier
CREATE INDEX IF NOT EXISTS idx_users_premium_tier
ON app_user(premium_tier)
WHERE premium_tier IS NOT NULL;

-- Index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
ON app_user("stripeCustomerId")
WHERE "stripeCustomerId" IS NOT NULL;

-- Index for active premium tiers
CREATE INDEX IF NOT EXISTS idx_plans_tier_code
ON plans(tier_code)
WHERE tier_code IS NOT NULL;

-- Composite index for pricing page queries
CREATE INDEX IF NOT EXISTS idx_plans_active
ON plans(active, tier_code)
WHERE tier_code IS NOT NULL;

-- Unique index for webhook event idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_events_stripe_id
ON subscription_events("stripeEventId");

-- Index for user subscription event history
CREATE INDEX IF NOT EXISTS idx_subscription_events_user
ON subscription_events("userId", "processedAt" DESC);
