import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { user_achievements } from '@/db/schema/user-achievements';
import { eq, and } from 'drizzle-orm';

/**
 * PATCH /api/achievements/[id]/toggle
 * Toggle achievement visibility (is_displayed)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get achievement
    const [achievement] = await db
      .select()
      .from(user_achievements)
      .where(eq(user_achievements.id, id));

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // Check ownership
    if (achievement.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Not your achievement' }, { status: 403 });
    }

    // Toggle is_displayed
    const [updated] = await db
      .update(user_achievements)
      .set({ is_displayed: !achievement.is_displayed })
      .where(eq(user_achievements.id, id))
      .returning();

    return NextResponse.json({ achievement: updated });
  } catch (error: any) {
    console.error('Error toggling achievement:', error);
    return NextResponse.json(
      { error: 'Failed to toggle achievement' },
      { status: 500 }
    );
  }
}
