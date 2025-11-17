/**
 * Admin authorization middleware for StackPass Hackathons
 * Protects admin routes from unauthorized access
 */

import { auth } from '@/auth';

/**
 * Check if current user is a super admin
 * For now, checks if email matches dan@stackpass.dev
 * TODO: Add is_super_admin column to app_user table for multiple admins
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.email) {
    return false;
  }

  // Admin check - currently email-based
  const adminEmails = ['dan@stackpass.dev'];
  return adminEmails.includes(session.user.email);
}

/**
 * Require admin access or throw error
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
