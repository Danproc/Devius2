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

  console.log('Admin check - Session user:', session?.user?.email);

  if (!session?.user?.email) {
    console.log('No session or email found');
    return false;
  }

  // Admin check - currently email-based
  const adminEmails = ['dan@stackpass.dev', 'hello@thenorthern-web.co.uk'];
  const isAdminUser = adminEmails.includes(session.user.email);

  console.log('Is admin?', isAdminUser);
  return isAdminUser;
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
