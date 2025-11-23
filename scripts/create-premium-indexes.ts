import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function createIndexes() {
  console.log('Creating premium tier indexes...');

  try {
    // Index for finding expiring premium subscriptions
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_premium_expires
      ON app_user(premium_expires_at)
      WHERE is_premium = true;
    `);
    console.log('✓ Created idx_users_premium_expires');

    // Index for querying users by premium tier
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_premium_tier
      ON app_user(premium_tier)
      WHERE premium_tier IS NOT NULL;
    `);
    console.log('✓ Created idx_users_premium_tier');

    // Index for Stripe customer lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
      ON app_user("stripeCustomerId")
      WHERE "stripeCustomerId" IS NOT NULL;
    `);
    console.log('✓ Created idx_users_stripe_customer');

    // Index for active premium tiers
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_plans_tier_code
      ON plans(tier_code)
      WHERE tier_code IS NOT NULL;
    `);
    console.log('✓ Created idx_plans_tier_code');

    // Composite index for pricing page queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_plans_active
      ON plans(active, tier_code)
      WHERE tier_code IS NOT NULL;
    `);
    console.log('✓ Created idx_plans_active');

    // Unique index for webhook event idempotency
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_events_stripe_id
      ON subscription_events("stripeEventId");
    `);
    console.log('✓ Created idx_subscription_events_stripe_id');

    // Index for user subscription event history
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_subscription_events_user
      ON subscription_events("userId", "processedAt" DESC);
    `);
    console.log('✓ Created idx_subscription_events_user');

    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
