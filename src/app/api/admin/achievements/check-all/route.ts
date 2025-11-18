import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { checkEarnedAchievements, awardAchievements } from '@/lib/achievements/check-achievements';

/**
 * POST /api/admin/achievements/check-all
 * Check and award achievements for ALL users (admin only)
 * Use this to backfill achievements for existing users
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

    // Get all users
    const allUsers = await db.select().from(users);

    let totalAwarded = 0;
    let usersProcessed = 0;

    // Process each user
    for (const user of allUsers) {
      try {
        // For simplicity, just check membership-based achievements
        const userData = {
          user_id: user.id,
          member_number: (user as any).member_number || null,
          is_premium: user.is_premium || false,
          premium_started_at: (user as any).premium_started_at || null,
          created_at: user.createdAt,
        };

        const earnedTypes = await checkEarnedAchievements(userData);
        const awarded = await awardAchievements(user.id, earnedTypes);

        totalAwarded += awarded;
        usersProcessed++;
      } catch (error) {
        console.error(`Failed to process user ${user.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      users_processed: usersProcessed,
      achievements_awarded: totalAwarded,
    });
  } catch (error: any) {
    console.error('Error checking achievements for all users:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
