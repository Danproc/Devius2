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
    // Insert Premium tier
    await db.insert(plans).values({
      id: crypto.randomUUID(),
      tier_code: 'premium',
      name: 'Premium',
      codename: 'premium', // For credit allocation compatibility
      active: true,
      default: false,
      hasMonthlyPricing: true,
      hasYearlyPricing: true,
      monthlyPrice: 900, // $9.00
      monthlyStripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly_placeholder',
      yearlyPrice: 9000, // $90.00
      yearlyStripePriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || 'price_premium_annual_placeholder',
      features: {
        custom_themes: true,
        advanced_analytics: true,
        priority_support: true,
      },
    }).onConflictDoNothing({ target: plans.tier_code });

    console.log('✓ Seeded Premium tier ($9/mo, $90/yr)');

    // Insert Premium Pro tier
    await db.insert(plans).values({
      id: crypto.randomUUID(),
      tier_code: 'premium_pro',
      name: 'Premium Pro',
      codename: 'premium_pro', // For credit allocation compatibility
      active: true,
      default: false,
      hasMonthlyPricing: true,
      hasYearlyPricing: true,
      monthlyPrice: 2900, // $29.00
      monthlyStripePriceId: process.env.STRIPE_PREMIUM_PRO_MONTHLY_PRICE_ID || 'price_premium_pro_monthly_placeholder',
      yearlyPrice: 29000, // $290.00
      yearlyStripePriceId: process.env.STRIPE_PREMIUM_PRO_ANNUAL_PRICE_ID || 'price_premium_pro_annual_placeholder',
      features: {
        custom_themes: true,
        advanced_analytics: true,
        priority_support: true,
        custom_domain: true,
        organization_profiles: true,
      } as any,
    }).onConflictDoNothing({ target: plans.tier_code });

    console.log('✓ Seeded Premium Pro tier ($29/mo, $290/yr)');

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
