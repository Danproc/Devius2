#!/usr/bin/env node
/**
 * CLI Script to Grant Founding Member Promotions
 * Run with: node --require dotenv/config --env-file=.env.local scripts/grant-founding-members-cli.ts
 * Or simpler: node -r dotenv/config scripts/grant-founding-members-cli.ts
 */

// Ensure environment is loaded before any imports
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please run with: node -r dotenv/config scripts/grant-founding-members-cli.ts');
  process.exit(1);
}

// Dynamic import after env check
async function main() {
  console.log('🚀 Starting Founding Member Grant Process...\n');
  console.log('This will grant the first 100 members a free year of premium access.\n');

  try {
    // Import after env is confirmed loaded
    const { grantFoundingMemberPromotion } = await import('../src/lib/promotions/founding-member.js');

    const result = await grantFoundingMemberPromotion();

    console.log('\n' + '='.repeat(60));
    console.log('✅ FOUNDING MEMBER GRANT COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Total eligible users: ${result.total}`);
    console.log(`👑 Grants issued: ${result.granted}`);
    console.log(`⏭️  Skipped: ${result.skipped}`);
    console.log(`📅 Grants expire on: ${result.expiresAt.toLocaleDateString()}`);
    console.log(`⏰ Duration: 365 days (1 year)`);
    console.log('='.repeat(60));

    if (result.skippedReasons.length > 0) {
      console.log('\n📋 Skipped Users:');
      result.skippedReasons.forEach(({ memberNumber, reason }) => {
        console.log(`  #${memberNumber}: ${reason}`);
      });
    }

    console.log('\n✨ Next Steps:');
    console.log('  1. Check your database - users should now have premium access');
    console.log('  2. Verify users have the Pioneer achievement badge');
    console.log('  3. Expiration reminders will be sent automatically at 7, 3, and 1 day marks');
    console.log('  4. After 1 year, premium will auto-expire and users will be prompted to subscribe\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error granting founding member promotions:', error);
    process.exit(1);
  }
}

main();
