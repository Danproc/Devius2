import { pgTable, text, timestamp, integer, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';
import { users } from './user';

/**
 * Promotional Grants Table
 * Time-limited promotional access to premium features
 * Used for founding members, Black Friday deals, referral rewards, contest prizes, etc.
 */
export const promotional_grants = pgTable(
  'promotional_grants',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Promotion identification
    promotion_type: text('promotion_type').notNull(), // 'founding_member_year', 'black_friday_2026', etc.
    promotion_name: text('promotion_name').notNull(), // Human-readable: "Founding Member Free Year"

    // Access configuration
    granted_tier: text('granted_tier').notNull(), // References plans.tier_code ('premium', 'premium_pro')
    granted_duration_days: integer('granted_duration_days').notNull(), // 365 for founding members

    // Status tracking
    status: text('status', { enum: ['active', 'expired', 'revoked'] }).notNull(),
    granted_at: timestamp('granted_at', { mode: 'date' }).notNull().defaultNow(),
    expires_at: timestamp('expires_at', { mode: 'date' }).notNull(),
    activated_at: timestamp('activated_at', { mode: 'date' }),

    // Extensible metadata (promotion-specific data)
    metadata: jsonb('metadata').$type<PromotionalGrantMetadata>().default({}),

    // Admin audit trail
    granted_by: text('granted_by'), // Admin user ID who granted
    revoke_reason: text('revoke_reason'), // Explanation if revoked

    // Timestamps
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one promotion type per user
    unique_user_promotion: unique().on(table.user_id, table.promotion_type),
    // Indexes for efficient querying
    user_idx: index('idx_promotional_grants_user').on(table.user_id),
    status_idx: index('idx_promotional_grants_status').on(table.status),
    type_idx: index('idx_promotional_grants_type').on(table.promotion_type),
    // Partial index for active grants (most common query)
    expires_idx: index('idx_promotional_grants_expires')
      .on(table.expires_at)
      .where(sql`status = 'active'`),
  })
);

/**
 * Promotional Grant Metadata
 * Extensible JSONB field for promotion-specific data
 */
export interface PromotionalGrantMetadata {
  badge?: string; // Achievement badge to award (e.g., 'founding_member')
  campaign?: string; // Marketing campaign ID
  note?: string; // Admin notes
  referred_user?: string; // For referral rewards
  hackathon_id?: string; // For contest prizes
  placement?: number; // Contest placement (1st, 2nd, 3rd)
  [key: string]: any; // Allow arbitrary metadata
}

/**
 * Type exports
 */
export type PromotionalGrant = typeof promotional_grants.$inferSelect;
export type NewPromotionalGrant = typeof promotional_grants.$inferInsert;

/**
 * Promotion Status Enum
 */
export type PromotionStatus = 'active' | 'expired' | 'revoked';

/**
 * Common promotion type constants
 */
export const PROMOTION_TYPES = {
  FOUNDING_MEMBER_YEAR: 'founding_member_year',
  BLACK_FRIDAY: 'black_friday',
  REFERRAL_REWARD: 'referral_reward',
  HACKATHON_WINNER: 'hackathon_winner',
  CONTEST_PRIZE: 'contest_prize',
} as const;

export type PromotionType = (typeof PROMOTION_TYPES)[keyof typeof PROMOTION_TYPES];
