/**
 * Achievement Checking Service
 * Automatically checks and awards achievements based on user data
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcard';
import { user_achievements, type AchievementType } from '@/db/schema/user-achievements';
import { hackathon_badges } from '@/db/schema/hackathon-badges';
import { eq, and, count, sql } from 'drizzle-orm';

interface UserData {
  user_id: string;
  member_number: number | null;
  is_premium: boolean;
  premium_started_at: Date | null;
  created_at: Date | null;
  devcard?: {
    custom_bio: string | null;
    tech_stack: string[] | null;
    social_links: any;
    custom_projects: any;
    theme: any;
    view_count: number;
    avatar_url: string;
  };
  github_stats?: {
    public_repos?: number;
    total_stars?: number;
    contribution_streak?: number;
    organizations?: any[];
    top_languages?: any[];
  };
  connections_count?: number;
  hackathon_wins?: {
    total: number;
    first: number;
    second: number;
    third: number;
    team_wins: number;
    solo_wins: number;
  };
}

/**
 * Check which achievements a user has earned
 * Returns array of achievement types to award
 */
export async function checkEarnedAchievements(userData: UserData): Promise<AchievementType[]> {
  const achievements: AchievementType[] = [];

  // MEMBERSHIP MILESTONES
  if (userData.member_number && userData.member_number <= 100) {
    achievements.push('pioneer');
  } else if (userData.member_number && userData.member_number <= 500) {
    achievements.push('founding_member');
  } else if (userData.member_number && userData.member_number <= 1000) {
    achievements.push('early_adopter');
  }

  // Launch day (Nov 18, 2025)
  if (userData.created_at) {
    const launchDay = new Date('2025-11-18');
    const joinedDate = new Date(userData.created_at);
    const isSameDay =
      joinedDate.getFullYear() === launchDay.getFullYear() &&
      joinedDate.getMonth() === launchDay.getMonth() &&
      joinedDate.getDate() === launchDay.getDate();

    if (isSameDay) {
      achievements.push('launch_day');
    }

    // Charter member (joined in Nov 2025)
    if (joinedDate.getFullYear() === 2025 && joinedDate.getMonth() === 10) {
      achievements.push('charter_member');
    }

    // Early bird (updated profile within 24h)
    if (userData.devcard && userData.created_at) {
      const timeDiff = new Date().getTime() - new Date(userData.created_at).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff <= 24) {
        achievements.push('early_bird');
      }
    }
  }

  // SOCIAL & COMMUNITY
  if (userData.connections_count) {
    if (userData.connections_count >= 100) {
      achievements.push('network_king');
    } else if (userData.connections_count >= 50) {
      achievements.push('super_connector');
    } else if (userData.connections_count >= 10) {
      achievements.push('well_connected');
    }
  }

  if (userData.devcard?.view_count) {
    if (userData.devcard.view_count >= 10000) {
      achievements.push('viral');
    } else if (userData.devcard.view_count >= 1000) {
      achievements.push('popular_profile');
    }
  }

  // GITHUB ACTIVITY
  if (userData.github_stats) {
    if (userData.github_stats.public_repos) {
      if (userData.github_stats.public_repos >= 100) {
        achievements.push('code_master');
      } else if (userData.github_stats.public_repos >= 50) {
        achievements.push('open_source_hero');
      }
    }

    if (userData.github_stats.total_stars && userData.github_stats.total_stars >= 1000) {
      achievements.push('star_collector');
    }

    if (userData.github_stats.contribution_streak && userData.github_stats.contribution_streak >= 100) {
      achievements.push('commit_streak');
    }

    if (userData.github_stats.top_languages && userData.github_stats.top_languages.length >= 5) {
      achievements.push('polyglot');
    }

    if (userData.github_stats.organizations && userData.github_stats.organizations.length >= 3) {
      achievements.push('organization_member');
    }
  }

  // HACKATHON ACHIEVEMENTS
  if (userData.hackathon_wins) {
    const total = userData.hackathon_wins.total;

    if (total >= 10) {
      achievements.push('hackathon_legend');
    } else if (total >= 5) {
      achievements.push('serial_winner');
    } else if (total >= 3) {
      achievements.push('hat_trick');
    } else if (total >= 1) {
      achievements.push('hackathon_champion');
    }

    if (userData.hackathon_wins.team_wins > 0) {
      achievements.push('team_player');
    }

    if (userData.hackathon_wins.solo_wins > 0) {
      achievements.push('solo_winner');
    }
  }

  // CONTENT & CUSTOMIZATION
  if (userData.devcard) {
    if (userData.devcard.custom_bio && userData.devcard.custom_bio.length >= 200) {
      achievements.push('storyteller');
    }

    if (userData.devcard.avatar_url && !userData.devcard.avatar_url.includes('avatars.githubusercontent.com')) {
      achievements.push('designer');
    }

    if (userData.devcard.tech_stack && userData.devcard.tech_stack.length >= 10) {
      achievements.push('tech_stack_expert');
    }

    if (userData.devcard.custom_projects && Array.isArray(userData.devcard.custom_projects)) {
      if (userData.devcard.custom_projects.length >= 5) {
        achievements.push('project_showcase');
      }
    }

    if (userData.devcard.social_links) {
      const linkCount = Object.keys(userData.devcard.social_links).filter(
        (key) => userData.devcard!.social_links[key]
      ).length;
      if (linkCount >= 5) {
        achievements.push('link_master');
      }
    }

    if (userData.devcard.theme && userData.devcard.theme.name !== 'default') {
      achievements.push('theme_customizer');
    }

    // Profile completeness check
    const hasAllFields =
      userData.devcard.custom_bio &&
      userData.devcard.tech_stack &&
      userData.devcard.tech_stack.length > 0 &&
      userData.devcard.social_links &&
      Object.keys(userData.devcard.social_links).length >= 3 &&
      userData.devcard.custom_projects &&
      Array.isArray(userData.devcard.custom_projects) &&
      userData.devcard.custom_projects.length > 0;

    if (hasAllFields) {
      achievements.push('profile_perfectionist');
    }
  }

  // PREMIUM & LOYALTY
  if (userData.is_premium) {
    achievements.push('pro_member');

    if (userData.premium_started_at) {
      const monthsAsPro = (new Date().getTime() - new Date(userData.premium_started_at).getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsAsPro >= 24) {
        achievements.push('premium_supporter');
      } else if (monthsAsPro >= 12) {
        achievements.push('pro_veteran');
      } else if (monthsAsPro >= 6) {
        achievements.push('loyal_pro');
      }
    }
  }

  return achievements;
}

/**
 * Award achievements to a user
 * Only awards new achievements (checks for duplicates)
 */
export async function awardAchievements(
  userId: string,
  achievementTypes: AchievementType[]
): Promise<number> {
  if (achievementTypes.length === 0) return 0;

  // Get existing achievements
  const existing = await db
    .select()
    .from(user_achievements)
    .where(eq(user_achievements.user_id, userId));

  const existingTypes = new Set(existing.map((a) => a.achievement_type));

  // Filter out already awarded achievements
  const newAchievements = achievementTypes.filter((type) => !existingTypes.has(type));

  if (newAchievements.length === 0) return 0;

  // Insert new achievements with ON CONFLICT DO NOTHING to handle duplicates
  if (newAchievements.length > 0) {
    await db
      .insert(user_achievements)
      .values(
        newAchievements.map((type) => ({
          user_id: userId,
          achievement_type: type,
          is_displayed: true,
          display_order: 0,
        }))
      )
      .onConflictDoNothing();
  }

  return newAchievements.length;
}
