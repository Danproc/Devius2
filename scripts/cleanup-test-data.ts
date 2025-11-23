import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hackathons } from '../src/db/schema/hackathons';
import { hackathon_registrations } from '../src/db/schema/hackathon-registrations';
import { hackathon_submissions } from '../src/db/schema/hackathon-submissions';
import { hackathon_votes } from '../src/db/schema/hackathon-votes';
import { hackathon_teams } from '../src/db/schema/hackathon-teams';
import { hackathon_team_invites } from '../src/db/schema/hackathon-team-invites';
import { hackathon_badges } from '../src/db/schema/hackathon-badges';
import { user_achievements } from '../src/db/schema/user-achievements';
import { users } from '../src/db/schema/user';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

// Create database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function cleanupTestData() {
  console.log('Cleaning up test hackathons and achievements...\n');

  try {
    // List all hackathons
    const allHackathons = await db
      .select({ id: hackathons.id, title: hackathons.title, slug: hackathons.slug })
      .from(hackathons);

    console.log('Found hackathons:');
    allHackathons.forEach((h, i) => console.log(`${i + 1}. ${h.title} (${h.slug})`));
    console.log('');

    // Delete ALL hackathon-related data (cascading deletes will handle most)
    for (const hackathon of allHackathons) {
      console.log(`Deleting hackathon: ${hackathon.title}...`);

      // Delete votes
      await db.delete(hackathon_votes).where(eq(hackathon_votes.hackathon_id, hackathon.id));

      // Delete team invites
      await db.delete(hackathon_team_invites).where(eq(hackathon_team_invites.hackathon_id, hackathon.id));

      // Delete teams
      await db.delete(hackathon_teams).where(eq(hackathon_teams.hackathon_id, hackathon.id));

      // Delete submissions
      await db.delete(hackathon_submissions).where(eq(hackathon_submissions.hackathon_id, hackathon.id));

      // Delete registrations
      await db.delete(hackathon_registrations).where(eq(hackathon_registrations.hackathon_id, hackathon.id));

      // Delete badges
      await db.delete(hackathon_badges).where(eq(hackathon_badges.hackathon_id, hackathon.id));

      // Delete the hackathon itself
      await db.delete(hackathons).where(eq(hackathons.id, hackathon.id));

      console.log(`✓ Deleted ${hackathon.title}`);
    }

    console.log('');

    // Get your user ID (you can update this)
    const yourEmail = 'dan@stackpass.dev'; // Update with your email
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, yourEmail))
      .limit(1);

    if (user) {
      console.log(`Found user: ${user.email} (${user.id})`);

      // Delete all achievements for this user
      const deletedAchievements = await db
        .delete(user_achievements)
        .where(eq(user_achievements.user_id, user.id))
        .returning({ type: user_achievements.achievement_type });

      if (deletedAchievements.length > 0) {
        console.log(`✓ Deleted ${deletedAchievements.length} achievements:`);
        deletedAchievements.forEach(a => console.log(`  - ${a.type}`));
      } else {
        console.log('✓ No achievements found for this user');
      }
    } else {
      console.log(`⚠️  User not found with email: ${yourEmail}`);
    }

    console.log('\n✅ Cleanup complete!');
    console.log('All hackathons and your achievements have been removed.');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    await client.end();
    process.exit(1);
  }
}

cleanupTestData();
