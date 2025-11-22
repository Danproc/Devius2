import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { devcards } from '@/db/schema/devcard';
import { eq, inArray } from 'drizzle-orm';

/**
 * Get all hackathons for sitemap generation
 * Includes only public-facing hackathon statuses
 */
export async function getAllHackathons() {
  return db.select({
    id: hackathons.id,
    slug: hackathons.slug,
    updated_at: hackathons.updated_at
  })
  .from(hackathons)
  .where(
    inArray(hackathons.status, [
      'upcoming',
      'registration',
      'active',
      'voting',
      'completed'
    ])
  );
}

/**
 * Get all public profiles for sitemap generation
 * Includes only profiles marked as public
 */
export async function getPublicProfiles() {
  return db.select({
    url_slug: devcards.url_slug,
    updated_at: devcards.updated_at
  })
  .from(devcards)
  .where(eq(devcards.is_public, true));
}
