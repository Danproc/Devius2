/**
 * POST /api/hackathons/[id]/declare-winners - Declare hackathon winners (admin only)
 * Awards badges to winning team members and updates submission status
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathon_teams } from '@/db/schema/hackathon-teams';
import { hackathon_badges } from '@/db/schema/hackathon-badges';
import { user_achievements } from '@/db/schema/user-achievements';
import { users } from '@/db/schema/user';
import { requireAdmin } from '@/middleware/admin-auth';
import { eq, inArray } from 'drizzle-orm';
import type { DeclareWinnersInput } from '@/types/hackathons';
import { sendEmail } from '@/lib/email/client';
import WinnerAnnouncement from '@/emails/WinnerAnnouncement';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body: DeclareWinnersInput = await req.json();

    // Verify hackathon exists
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, id))
      .limit(1);

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    const badgesCreated: any[] = [];

    // Award 1st place
    if (body.first_place_submission_id) {
      await awardBadges(body.first_place_submission_id, 'gold', 1);
    }

    // Award 2nd place
    if (body.second_place_submission_id) {
      await awardBadges(body.second_place_submission_id, 'silver', 2);
    }

    // Award 3rd place
    if (body.third_place_submission_id) {
      await awardBadges(body.third_place_submission_id, 'bronze', 3);
    }

    // Helper function to award badges
    async function awardBadges(submissionId: string, badgeType: 'gold' | 'silver' | 'bronze', placement: number) {
      // Get submission
      const [submission] = await db
        .select()
        .from(hackathon_submissions)
        .where(eq(hackathon_submissions.id, submissionId))
        .limit(1);

      if (!submission) return;

      // Update submission status and placement
      await db
        .update(hackathon_submissions)
        .set({
          status: `winner_${badgeType === 'gold' ? 'first' : badgeType === 'silver' ? 'second' : 'third'}` as any,
          placement,
        })
        .where(eq(hackathon_submissions.id, submissionId));

      // Get team members (or just solo user)
      let userIds: string[] = [submission.user_id];

      if (submission.team_id) {
        const [team] = await db
          .select()
          .from(hackathon_teams)
          .where(eq(hackathon_teams.id, submission.team_id))
          .limit(1);

        if (team) {
          const members = team.members as Array<{ user_id: string; joined_at: string }>;
          userIds = members.map(m => m.user_id);
        }
      }

      // Create badge and achievements for each team member
      for (const userId of userIds) {
        // Award hackathon badge
        const [badge] = await db
          .insert(hackathon_badges)
          .values({
            user_id: userId,
            hackathon_id: id,
            submission_id: submissionId,
            badge_type: badgeType,
          })
          .returning();

        badgesCreated.push(badge);

        // Send winner announcement email
        try {
          const [user] = await db
            .select({ email: users.email, name: users.name })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: `🎉 Congratulations! You placed ${placement === 1 ? '1st' : placement === 2 ? '2nd' : '3rd'} in ${hackathon.title}`,
              react: WinnerAnnouncement({
                userName: user.name || 'Developer',
                hackathonTitle: hackathon.title,
                hackathonTheme: hackathon.theme,
                placement: badgeType === 'gold' ? 'first' : badgeType === 'silver' ? 'second' : 'third',
                prizeAmount: 0, // TODO: Get from hackathon prize pool
                projectTitle: submission.project_title || 'Your Project',
                profileUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${user.name}`,
                galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/hackathons/${hackathon.slug}`,
              }),
            });
            console.log(`✅ Winner email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send winner email to user ${userId}:`, emailError);
          // Don't fail the entire operation if email fails
        }

        // Award achievements
        const achievementsToAward: Array<'hackathon_champion' | 'solo_winner' | 'team_player'> = [
          'hackathon_champion', // First hackathon win
        ];

        // Add solo_winner or team_player based on participation type
        if (userIds.length === 1) {
          achievementsToAward.push('solo_winner');
        } else {
          achievementsToAward.push('team_player');
        }

        // Insert achievements (onConflictDoNothing prevents duplicates)
        for (const achievementType of achievementsToAward) {
          await db
            .insert(user_achievements)
            .values({
              user_id: userId,
              achievement_type: achievementType,
              is_displayed: true,
            })
            .onConflictDoNothing();
        }
      }
    }

    // Update hackathon status to completed
    await db
      .update(hackathons)
      .set({
        status: 'completed',
        updated_at: new Date(),
      })
      .where(eq(hackathons.id, id));

    return NextResponse.json({
      success: true,
      badges_created: badgesCreated.length,
      hackathon_status: 'completed',
    });
  } catch (error: any) {
    console.error('Error declaring winners:', error);

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to declare winners', message: error.message },
      { status: 500 }
    );
  }
}
