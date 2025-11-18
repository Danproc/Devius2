/**
 * Pro Membership Check Middleware
 * Reusable helpers for validating Pro membership status
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';

export interface ProStatus {
  isPro: boolean;
  expiresAt: Date | null;
  isExpired: boolean;
}

/**
 * Check if a user has active Pro membership
 */
export async function checkProStatus(userId: string): Promise<ProStatus> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { isPro: false, expiresAt: null, isExpired: false };
  }

  const isPro = user.is_premium || false;
  const expiresAt = user.premium_expires_at ? new Date(user.premium_expires_at) : null;
  const isExpired = expiresAt ? new Date() > expiresAt : false;

  return {
    isPro: isPro && !isExpired,
    expiresAt,
    isExpired,
  };
}

/**
 * Require Pro membership - throws error if not Pro
 * Use this in API routes or server components
 */
export async function requireProAccess(userId: string): Promise<void> {
  const status = await checkProStatus(userId);

  if (!status.isPro) {
    throw new Error('Pro membership required');
  }
}

/**
 * Check if user is Pro (returns boolean)
 * Convenience function for conditional rendering
 */
export async function isProMember(userId: string): Promise<boolean> {
  const status = await checkProStatus(userId);
  return status.isPro;
}
