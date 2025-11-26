/**
 * Grant Founding Member Promotions
 * Run with: pnpm script scripts/grant-founding-members.ts
 */

import { grantFoundingMemberPromotion } from '../src/lib/promotions/founding-member';

async function main() {
  console.log('🚀 Starting Founding Member Grant Process...\n');
  console.log('This will grant the first 100 members a free year of premium access.\n');

  try {
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
    console.error('\nFull error details:', error);
    process.exit(1);
  }
}

main();
