/**
 * List all users with their member numbers
 * Run with: npx tsx scripts/list-users.ts
 */

import { db } from '../src/db';
import { devcards } from '../src/db/schema/devcard';
import { users } from '../src/db/schema/user';
import { eq } from 'drizzle-orm';

async function listUsers() {
  try {
    console.log('📋 Fetching all StackPass users...\n');

    const allDevcards = await db
      .select({
        devcard_id: devcards.id,
        user_id: devcards.user_id,
        github_username: devcards.github_username,
        url_slug: devcards.url_slug,
        member_number: devcards.member_number,
        is_public: devcards.is_public,
      })
      .from(devcards)
      .orderBy(devcards.member_number);

    console.log('┌─────────────┬──────────────────┬──────────────────┬────────┐');
    console.log('│ Member #    │ GitHub Username  │ URL Slug         │ Public │');
    console.log('├─────────────┼──────────────────┼──────────────────┼────────┤');

    for (const devcard of allDevcards) {
      const memberNum = String(devcard.member_number).padEnd(11);
      const githubUser = (devcard.github_username || '').padEnd(16).substring(0, 16);
      const slug = (devcard.url_slug || '').padEnd(16).substring(0, 16);
      const isPublic = devcard.is_public ? '✓' : '✗';

      console.log(`│ ${memberNum} │ ${githubUser} │ ${slug} │ ${isPublic.padEnd(6)} │`);
    }

    console.log('└─────────────┴──────────────────┴──────────────────┴────────┘');
    console.log(`\nTotal: ${allDevcards.length} users\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
