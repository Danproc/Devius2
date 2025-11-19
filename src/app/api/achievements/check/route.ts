import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcard';
import { user_achievements } from '@/db/schema/user-achievements';
import { hackathon_badges } from '@/db/schema/hackathon-badges';
import { eq, count, and, inArray } from 'drizzle-orm';
import { checkEarnedAchievements, awardAchievements } from '@/lib/achievements/check-achievements';

/**
 * POST /api/achievements/check
 * Check and award achievements for the current user
 * Called after profile updates or significant actions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch devcard
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.user_id, session.user.id));

    // Fetch connections count
    const connectionsResult = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/connections/count?userId=${session.user.id}`
    ).then((res) => (res.ok ? res.json() : { count: 0 }));

    // Fetch hackathon wins
    const badgesResult = await db
      .select()
      .from(hackathon_badges)
      .where(eq(hackathon_badges.user_id, session.user.id));

    const hackathonWins = {
      total: badgesResult.length,
      first: badgesResult.filter((b) => b.badge_type === 'gold').length,
      second: badgesResult.filter((b) => b.badge_type === 'silver').length,
      third: badgesResult.filter((b) => b.badge_type === 'bronze').length,
      team_wins: 0, // TODO: Track team vs solo wins
      solo_wins: 0,
    };

    // Build user data object
    const userData = {
      user_id: session.user.id,
      member_number: (user as any).member_number || null,
      is_premium: user.is_premium || false,
      premium_started_at: (user as any).premium_started_at || null,
      created_at: user.createdAt,
      devcard: devcard
        ? {
            custom_bio: devcard.custom_bio,
            tech_stack: devcard.tech_stack as string[] | null,
            social_links: devcard.social_links,
            custom_projects: devcard.custom_projects,
            theme: devcard.theme,
            view_count: devcard.view_count || 0,
            avatar_url: devcard.avatar_url,
          }
        : undefined,
      connections_count: connectionsResult.count || 0,
      hackathon_wins: hackathonWins,
    };

    // Check which achievements should be earned
    const earnedTypes = await checkEarnedAchievements(userData);

    // Award new achievements
    const newAchievementsCount = await awardAchievements(session.user.id, earnedTypes);

    // Get all current achievements
    const allAchievements = await db
      .select()
      .from(user_achievements)
      .where(eq(user_achievements.user_id, session.user.id));

    return NextResponse.json({
      success: true,
      new_achievements: newAchievementsCount,
      total_achievements: allAchievements.length,
      achievements: allAchievements,
    });
  } catch (error: any) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/achievements/check
 * Get current user's achievements (without awarding new ones)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const achievements = await db
      .select()
      .from(user_achievements)
      .where(eq(user_achievements.user_id, session.user.id))
      .orderBy(user_achievements.display_order, user_achievements.earned_at);

    return NextResponse.json({ achievements });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
