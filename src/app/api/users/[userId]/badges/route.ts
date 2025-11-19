import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathon_badges } from '@/db/schema/hackathon-badges';
import { hackathons } from '@/db/schema/hackathons';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/users/[userId]/badges
 * Get all hackathon badges for a user (public)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get all badges for the user with hackathon details
    const badges = await db
      .select({
        badge: hackathon_badges,
        hackathon: {
          id: hackathons.id,
          title: hackathons.title,
          slug: hackathons.slug,
          theme: hackathons.theme,
        },
      })
      .from(hackathon_badges)
      .innerJoin(hackathons, eq(hackathon_badges.hackathon_id, hackathons.id))
      .where(eq(hackathon_badges.user_id, userId))
      .orderBy(desc(hackathon_badges.awarded_at));

    // Group by badge_type
    const firstPlace = badges.filter((b) => b.badge.badge_type === 'gold');
    const secondPlace = badges.filter((b) => b.badge.badge_type === 'silver');
    const thirdPlace = badges.filter((b) => b.badge.badge_type === 'bronze');

    return NextResponse.json({
      badges,
      stats: {
        total: badges.length,
        first: firstPlace.length,
        second: secondPlace.length,
        third: thirdPlace.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
