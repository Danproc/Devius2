import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { plans } from '../src/db/schema/plans';

// Load environment variables
config({ path: '.env.local' });

// Create database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seedPremiumTiers() {
  console.log('Seeding premium tiers...');

  try {
    // Insert Premium tier - $49/year (annual only)
    await db.insert(plans).values({
      id: crypto.randomUUID(),
      tier_code: 'premium',
      name: 'Premium',
      codename: 'premium', // For credit allocation compatibility
      active: true,
      default: false,
      hasMonthlyPricing: false,
      hasYearlyPricing: true,
      monthlyPrice: null,
      monthlyStripePriceId: null,
      yearlyPrice: 4900, // $49.00/year
      yearlyStripePriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || 'price_premium_annual_placeholder',
      features: {
        custom_themes: true,
        advanced_analytics: true,
        priority_support: true,
        custom_domain: true,
        organization_profiles: true,
      },
    }).onConflictDoNothing({ target: plans.tier_code });

    console.log('✓ Seeded Premium tier ($49/year - annual only)');

    console.log('\n✅ Premium tiers seeded successfully!');
    console.log('\n⚠️  NOTE: Update Stripe price IDs in .env.local with real IDs from Stripe Dashboard');
    console.log('See specs/005-premium-stripe/STRIPE_SETUP.md for instructions');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding premium tiers:', error);
    await client.end();
    process.exit(1);
  }
}

seedPremiumTiers();
