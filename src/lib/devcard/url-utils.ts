/**
 * DevCard URL Utilities
 *
 * Functions to generate and manage DevCard URL slugs.
 * Handles username conflicts by appending nanoid when needed.
 */

import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Generates a unique URL slug for a DevCard
 *
 * Takes a GitHub username and ensures uniqueness by checking existing slugs.
 * If the username is already taken, appends a short nanoid (6 characters).
 *
 * @param githubUsername - GitHub username to use as base
 * @returns Unique URL slug for the DevCard
 *
 * @example
 * generateCardUrl("johndoe") // Returns "johndoe" if available
 * generateCardUrl("johndoe") // Returns "johndoe-a1b2c3" if "johndoe" is taken
 */
export async function generateCardUrl(githubUsername: string): Promise<string> {
  // Normalize the username: lowercase and remove special characters
  const baseSlug = githubUsername.toLowerCase().replace(/[^a-z0-9-_]/g, '');

  // Check if the base slug is available
  const [existing] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.url_slug, baseSlug))
    .limit(1);

  // If available, return the base slug
  if (!existing) {
    return baseSlug;
  }

  // If taken, generate a unique slug with nanoid
  // Keep trying until we find a unique one (unlikely to loop more than once)
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const uniqueSlug = `${baseSlug}-${nanoid(6)}`;

    const [conflict] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.url_slug, uniqueSlug))
      .limit(1);

    if (!conflict) {
      return uniqueSlug;
    }

    attempts++;
  }

  // Fallback: use a longer nanoid if we couldn't find a unique one
  return `${baseSlug}-${nanoid(10)}`;
}

/**
 * Validates that a URL slug is available
 *
 * @param urlSlug - The URL slug to check
 * @returns True if available, false if taken
 */
export async function isUrlSlugAvailable(urlSlug: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(devcards)
    .where(eq(devcards.url_slug, urlSlug))
    .limit(1);

  return !existing;
}

/**
 * Normalizes a username for use as a URL slug
 *
 * @param username - Username to normalize
 * @returns Normalized slug (lowercase, alphanumeric + hyphens/underscores only)
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9-_]/g, '');
}
