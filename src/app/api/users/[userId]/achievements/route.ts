import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user_achievements } from '@/db/schema/user-achievements';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/users/[userId]/achievements
 * Get all achievements for a user (public)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get all achievements for the user
    const achievements = await db
      .select()
      .from(user_achievements)
      .where(eq(user_achievements.user_id, userId))
      .orderBy(
        user_achievements.display_order,
        desc(user_achievements.earned_at)
      );

    console.log(`📊 Fetched ${achievements.length} achievements for user ${userId}:`,
      achievements.map(a => ({ type: a.achievement_type, displayed: a.is_displayed }))
    );

    return NextResponse.json({ achievements });
  } catch (error: any) {
    console.error('Error fetching user achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
