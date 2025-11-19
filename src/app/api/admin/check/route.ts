import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * GET /api/admin/check
 * Check if current user is an admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
    const isAdmin = adminEmails.includes(session.user.email);

    return NextResponse.json({ isAdmin });
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
