import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { user_achievements } from '@/db/schema/user-achievements';
import { sql } from 'drizzle-orm';

/**
 * POST /api/admin/achievements/clean-duplicates
 * Remove duplicate achievements (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Delete duplicates, keeping the earliest one
    const result = await db.execute(sql`
      DELETE FROM user_achievements a
      USING user_achievements b
      WHERE a.id > b.id
        AND a.user_id = b.user_id
        AND a.achievement_type = b.achievement_type
    `);

    return NextResponse.json({
      success: true,
      message: 'Duplicates removed',
    });
  } catch (error: any) {
    console.error('Error cleaning duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to clean duplicates' },
      { status: 500 }
    );
  }
}
