/**
 * Pro membership status checker for StackPass Hackathons
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';

/**
 * Check if user has active Pro membership
 * @param userId - User's ID (text type)
 * @returns true if user is Pro member
 */
export async function isProMember(userId: string): Promise<boolean> {
  const [user] = await db
    .select({
      is_premium: users.is_premium,
      premium_expires_at: users.premium_expires_at,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return false;

  // Check if premium and not expired
  if (!user.is_premium) return false;

  if (user.premium_expires_at) {
    const now = new Date();
    if (now > user.premium_expires_at) {
      return false; // Expired
    }
  }

  return true;
}

/**
 * Require Pro membership or throw error
 */
export async function requireProMembership(userId: string): Promise<void> {
  const isPro = await isProMember(userId);

  if (!isPro) {
    throw new Error('Pro membership required to participate in hackathons');
  }
}
