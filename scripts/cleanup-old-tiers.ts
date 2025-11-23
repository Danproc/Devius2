import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { plans } from '../src/db/schema/plans';
import { isNotNull, eq, and } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

// Create database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function cleanupOldTiers() {
  console.log('Cleaning up old premium tiers...');

  try {
    // Delete all existing premium tiers (tier_code IS NOT NULL)
    const deleted = await db
      .delete(plans)
      .where(isNotNull(plans.tier_code))
      .returning({ tier_code: plans.tier_code, name: plans.name });

    if (deleted.length > 0) {
      console.log(`✓ Deleted ${deleted.length} old tier(s):`);
      deleted.forEach(tier => console.log(`  - ${tier.name} (${tier.tier_code})`));
    } else {
      console.log('✓ No old tiers found');
    }

    console.log('\n✅ Cleanup complete! Now run seed-premium-tiers.ts to add the correct Premium tier.');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up tiers:', error);
    await client.end();
    process.exit(1);
  }
}

cleanupOldTiers();
