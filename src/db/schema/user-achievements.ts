import { pgTable, uuid, text, timestamp, pgEnum, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './user';

/**
 * Achievement Type Enum
 * All available achievement badges on StackPass
 */
export const achievementTypeEnum = pgEnum('achievement_type', [
  // Membership Milestones
  'founding_member',      // First 500 users (member_number <= 500)
  'early_adopter',        // First 1,000 users
  'pioneer',              // First 100 users
  'charter_member',       // Joined in launch month (Nov 2025)
  'pro_pioneer',          // First 100 Pro subscribers

  // Social & Community
  'well_connected',       // 10+ connections
  'super_connector',      // 50+ connections
  'network_king',         // 100+ connections
  'popular_profile',      // 1,000+ profile views
  'viral',                // 10,000+ profile views

  // GitHub Activity
  'code_master',          // 100+ public repos
  'star_collector',       // 1,000+ total stars
  'polyglot',             // 5+ programming languages
  'open_source_hero',     // 50+ public repos
  'commit_streak',        // 100+ day contribution streak
  'organization_member',  // Part of 3+ GitHub organizations

  // Hackathon Achievements
  'hackathon_champion',   // First hackathon win (any place)
  'hat_trick',            // 3+ hackathon wins
  'serial_winner',        // 5+ hackathon wins
  'hackathon_legend',     // 10+ hackathon wins
  'team_player',          // Won as part of a team
  'solo_winner',          // Won as solo participant

  // Engagement & Activity
  'profile_perfectionist', // All profile fields completed (100%)
  'theme_customizer',     // Created/applied custom theme
  'early_bird',           // Updated profile within 24h of joining

  // Content & Customization
  'project_showcase',     // 5+ featured projects
  'designer',             // Custom avatar uploaded
  'storyteller',          // Bio over 200 characters
  'link_master',          // All social links filled (5+)
  'tech_stack_expert',    // 10+ technologies listed

  // Special & Limited Edition
  'launch_day',           // Joined on Nov 18, 2025
  'beta_tester',          // Joined during beta period

  // Premium & Loyalty
  'pro_member',           // Active Pro subscription
  'loyal_pro',            // Pro for 6+ months
  'pro_veteran',          // Pro for 1+ year
  'premium_supporter',    // Pro for 2+ years
]);

/**
 * User Achievements Table
 * Tracks all achievements earned by users
 */
export const user_achievements = pgTable('user_achievements', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign Key
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Achievement Info
  achievement_type: achievementTypeEnum('achievement_type').notNull(),

  // Display on profile (user can toggle)
  is_displayed: boolean('is_displayed').notNull().default(true),

  // Display order (for custom sorting)
  display_order: integer('display_order').default(0),

  // Metadata (for achievements that have variable data)
  metadata: text('metadata'), // JSON string for extra info (e.g., streak count, date achieved)

  // Timestamps
  earned_at: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserAchievement = typeof user_achievements.$inferSelect;
export type NewUserAchievement = typeof user_achievements.$inferInsert;

/**
 * Achievement Definitions
 * Metadata for each achievement type including display info and unlock criteria
 */
export const ACHIEVEMENT_DEFINITIONS = {
  // Membership Milestones
  founding_member: {
    name: 'Founding Member',
    description: 'One of the first 500 members to join StackPass',
    icon: 'Crown',
    rarity: 'legendary',
    category: 'membership',
  },
  early_adopter: {
    name: 'Early Adopter',
    description: 'Joined in the first 1,000 members',
    icon: 'Sparkles',
    rarity: 'epic',
    category: 'membership',
  },
  pioneer: {
    name: 'Pioneer',
    description: 'One of the first 100 StackPass members',
    icon: 'Rocket',
    rarity: 'mythic',
    category: 'membership',
  },
  charter_member: {
    name: 'Charter Member',
    description: 'Joined during launch month',
    icon: 'Scroll',
    rarity: 'rare',
    category: 'membership',
  },
  pro_pioneer: {
    name: 'Pro Pioneer',
    description: 'One of the first 100 Pro subscribers',
    icon: 'Gem',
    rarity: 'legendary',
    category: 'membership',
  },

  // Social & Community
  well_connected: {
    name: 'Well Connected',
    description: 'Made 10+ connections',
    icon: 'Handshake',
    rarity: 'common',
    category: 'social',
  },
  super_connector: {
    name: 'Super Connector',
    description: 'Made 50+ connections',
    icon: 'Network',
    rarity: 'rare',
    category: 'social',
  },
  network_king: {
    name: 'Network King',
    description: 'Made 100+ connections',
    icon: 'Users',
    rarity: 'epic',
    category: 'social',
  },
  popular_profile: {
    name: 'Popular Profile',
    description: 'Received 1,000+ profile views',
    icon: 'Eye',
    rarity: 'rare',
    category: 'social',
  },
  viral: {
    name: 'Viral',
    description: 'Received 10,000+ profile views',
    icon: 'Flame',
    rarity: 'legendary',
    category: 'social',
  },

  // GitHub Activity
  code_master: {
    name: 'Code Master',
    description: '100+ public repositories',
    icon: 'Code',
    rarity: 'epic',
    category: 'github',
  },
  star_collector: {
    name: 'Star Collector',
    description: 'Received 1,000+ GitHub stars',
    icon: 'Star',
    rarity: 'legendary',
    category: 'github',
  },
  polyglot: {
    name: 'Polyglot',
    description: 'Code in 5+ programming languages',
    icon: 'Languages',
    rarity: 'rare',
    category: 'github',
  },
  open_source_hero: {
    name: 'Open Source Hero',
    description: '50+ public repositories',
    icon: 'Heart',
    rarity: 'rare',
    category: 'github',
  },
  commit_streak: {
    name: 'Commit Streak',
    description: '100+ day contribution streak',
    icon: 'Zap',
    rarity: 'epic',
    category: 'github',
  },
  organization_member: {
    name: 'Organization Member',
    description: 'Member of 3+ GitHub organizations',
    icon: 'Building',
    rarity: 'uncommon',
    category: 'github',
  },

  // Hackathon Achievements
  hackathon_champion: {
    name: 'Hackathon Champion',
    description: 'Won your first hackathon',
    icon: 'Trophy',
    rarity: 'epic',
    category: 'hackathon',
  },
  hat_trick: {
    name: 'Hat Trick',
    description: 'Won 3+ hackathons',
    icon: 'Award',
    rarity: 'legendary',
    category: 'hackathon',
  },
  serial_winner: {
    name: 'Serial Winner',
    description: 'Won 5+ hackathons',
    icon: 'Medal',
    rarity: 'mythic',
    category: 'hackathon',
  },
  hackathon_legend: {
    name: 'Hackathon Legend',
    description: 'Won 10+ hackathons',
    icon: 'Crown',
    rarity: 'mythic',
    category: 'hackathon',
  },
  team_player: {
    name: 'Team Player',
    description: 'Won a hackathon as part of a team',
    icon: 'Users',
    rarity: 'rare',
    category: 'hackathon',
  },
  solo_winner: {
    name: 'Solo Winner',
    description: 'Won a hackathon as a solo participant',
    icon: 'Target',
    rarity: 'rare',
    category: 'hackathon',
  },

  // Engagement & Activity
  profile_perfectionist: {
    name: 'Profile Perfectionist',
    description: 'Completed 100% of profile fields',
    icon: 'CheckCircle',
    rarity: 'uncommon',
    category: 'engagement',
  },
  theme_customizer: {
    name: 'Theme Customizer',
    description: 'Applied a custom theme',
    icon: 'Palette',
    rarity: 'uncommon',
    category: 'engagement',
  },
  early_bird: {
    name: 'Early Bird',
    description: 'Updated profile within 24 hours of joining',
    icon: 'Bird',
    rarity: 'uncommon',
    category: 'engagement',
  },

  // Content & Customization
  project_showcase: {
    name: 'Project Showcase',
    description: 'Featured 5+ projects on profile',
    icon: 'FolderOpen',
    rarity: 'uncommon',
    category: 'content',
  },
  designer: {
    name: 'Designer',
    description: 'Uploaded a custom avatar',
    icon: 'Image',
    rarity: 'common',
    category: 'content',
  },
  storyteller: {
    name: 'Storyteller',
    description: 'Wrote a bio over 200 characters',
    icon: 'BookOpen',
    rarity: 'common',
    category: 'content',
  },
  link_master: {
    name: 'Link Master',
    description: 'Added 5+ social links',
    icon: 'Link',
    rarity: 'uncommon',
    category: 'content',
  },
  tech_stack_expert: {
    name: 'Tech Stack Expert',
    description: 'Listed 10+ technologies',
    icon: 'Layers',
    rarity: 'uncommon',
    category: 'content',
  },

  // Special & Limited Edition
  launch_day: {
    name: 'Launch Day',
    description: 'Joined on official launch day (Nov 18, 2025)',
    icon: 'PartyPopper',
    rarity: 'legendary',
    category: 'special',
  },
  beta_tester: {
    name: 'Beta Tester',
    description: 'Joined during beta period',
    icon: 'FlaskConical',
    rarity: 'epic',
    category: 'special',
  },

  // Premium & Loyalty
  pro_member: {
    name: 'Pro Member',
    description: 'Active Pro subscription',
    icon: 'Gem',
    rarity: 'rare',
    category: 'premium',
  },
  loyal_pro: {
    name: 'Loyal Pro',
    description: 'Pro member for 6+ months',
    icon: 'Shield',
    rarity: 'epic',
    category: 'premium',
  },
  pro_veteran: {
    name: 'Pro Veteran',
    description: 'Pro member for 1+ year',
    icon: 'ShieldCheck',
    rarity: 'legendary',
    category: 'premium',
  },
  premium_supporter: {
    name: 'Premium Supporter',
    description: 'Pro member for 2+ years',
    icon: 'Crown',
    rarity: 'mythic',
    category: 'premium',
  },
} as const;

export type AchievementType = keyof typeof ACHIEVEMENT_DEFINITIONS;

/**
 * Rarity levels for achievements
 */
export const RARITY_CONFIG = {
  common: {
    color: 'bg-gray-500',
    borderColor: 'border-gray-500/50',
    textColor: 'text-gray-500',
  },
  uncommon: {
    color: 'bg-green-600',
    borderColor: 'border-green-600/50',
    textColor: 'text-green-600',
  },
  rare: {
    color: 'bg-blue-600',
    borderColor: 'border-blue-600/50',
    textColor: 'text-blue-600',
  },
  epic: {
    color: 'bg-purple-600',
    borderColor: 'border-purple-600/50',
    textColor: 'text-purple-600',
  },
  legendary: {
    color: 'bg-yellow-600',
    borderColor: 'border-yellow-600/50',
    textColor: 'text-yellow-600',
  },
  mythic: {
    color: 'bg-red-600',
    borderColor: 'border-red-600/50',
    textColor: 'text-red-600',
  },
} as const;
