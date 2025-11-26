/**
 * Premium Feature Gating Middleware
 * T116: Implement feature gating middleware in src/lib/premium/check-premium.ts
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { plans } from '@/db/schema/plans';
import { eq } from 'drizzle-orm';
import { getActiveGrant } from '@/lib/promotions/grant-service';
import { getUserSubscription, isSubscriptionActive } from '@/lib/stripe/subscriptions';

export interface PremiumStatus {
  isPremium: boolean;
  tier: string | null;
  expiresAt: Date | null;
  isExpiringSoon: boolean;
  features: Record<string, boolean>;
  source: 'stripe' | 'promotional' | 'ltd' | null; // NEW: Source of premium access
  promotionType?: string; // NEW: Type of promotion if source is promotional
}

/**
 * Check if a user has premium access
 * Priority system: Stripe > Promotional > LTD > No access
 * @param userId - User ID to check
 * @returns Premium status object
 */
export async function checkPremium(userId: string): Promise<PremiumStatus> {
  try {
    // Get user with all premium-related fields
    const [user] = await db
      .select({
        id: users.id,
        is_premium: users.is_premium,
        premium_tier: users.premium_tier,
        premium_expires_at: users.premium_expires_at,
        premium_source: users.premium_source,
        stripeSubscriptionId: users.stripeSubscriptionId,
        planId: users.planId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return getDefaultPremiumStatus();
    }

    // Priority 1: Stripe subscription (paying customers get highest priority)
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await getUserSubscription(userId);
        if (subscription && isSubscriptionActive(subscription)) {
          const tierFeatures = await getTierFeatures(user.premium_tier);
          return {
            isPremium: true,
            tier: user.premium_tier,
            expiresAt: user.premium_expires_at,
            isExpiringSoon: isExpiringSoon(user.premium_expires_at),
            features: tierFeatures,
            source: 'stripe',
          };
        }
      } catch (error) {
        console.error('Error checking Stripe subscription:', error);
        // Fall through to check other sources
      }
    }

    // Priority 2: Promotional grant (time-limited free access)
    const activeGrant = await getActiveGrant(userId);
    if (activeGrant && activeGrant.status === 'active') {
      const now = new Date();
      if (activeGrant.expires_at > now) {
        const tierFeatures = await getTierFeatures(activeGrant.granted_tier);
        return {
          isPremium: true,
          tier: activeGrant.granted_tier,
          expiresAt: activeGrant.expires_at,
          isExpiringSoon: isExpiringSoon(activeGrant.expires_at),
          features: tierFeatures,
          source: 'promotional',
          promotionType: activeGrant.promotion_type,
        };
      } else {
        // Grant expired - will be cleaned up by expireGrants() job
        // But revoke access now
        await revokeExpiredPromotionalAccess(userId);
      }
    }

    // Priority 3: LTD plan (coupon-based permanent access)
    if (user.planId) {
      const [plan] = await db
        .select({
          tier_code: plans.tier_code,
          features: plans.features,
        })
        .from(plans)
        .where(eq(plans.id, user.planId))
        .limit(1);

      if (plan) {
        return {
          isPremium: true,
          tier: plan.tier_code,
          expiresAt: null, // LTD plans never expire
          isExpiringSoon: false,
          features: (plan.features as Record<string, boolean>) || {},
          source: 'ltd',
        };
      }
    }

    // No premium access - check if we need to revoke
    const now = new Date();
    if (user.premium_expires_at && user.premium_expires_at < now && user.is_premium) {
      await db
        .update(users)
        .set({
          is_premium: false,
          premium_tier: null,
          premium_source: null,
        })
        .where(eq(users.id, userId));
    }

    return {
      isPremium: false,
      tier: null,
      expiresAt: user.premium_expires_at,
      isExpiringSoon: false,
      features: {},
      source: null,
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    return getDefaultPremiumStatus();
  }
}

/**
 * Get tier features by tier code
 * @param tierCode - Tier code (e.g., 'premium', 'premium_pro')
 * @returns Feature map
 */
async function getTierFeatures(tierCode: string | null): Promise<Record<string, boolean>> {
  if (!tierCode) return {};

  const [tier] = await db
    .select({
      features: plans.features,
    })
    .from(plans)
    .where(eq(plans.tier_code, tierCode))
    .limit(1);

  return (tier?.features as Record<string, boolean>) || {};
}

/**
 * Revoke expired promotional access
 * @param userId - User ID
 */
async function revokeExpiredPromotionalAccess(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      is_premium: false,
      premium_tier: null,
      premium_source: null,
    })
    .where(eq(users.id, userId));
}

/**
 * Check if a user has access to a specific premium feature
 * @param userId - User ID to check
 * @param feature - Feature name to check (e.g., 'custom_themes', 'priority_support')
 * @returns Boolean indicating feature access
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  const status = await checkPremium(userId);
  return status.features[feature] === true;
}

/**
 * Require premium access for a feature
 * Throws an error if user doesn't have access
 * @param userId - User ID to check
 * @param feature - Optional specific feature to check (e.g., 'custom_themes')
 */
export async function requirePremium(
  userId: string,
  feature?: string
): Promise<void> {
  const status = await checkPremium(userId);

  if (feature) {
    if (!status.features[feature]) {
      throw new Error(`Premium feature '${feature}' is required for this action`);
    }
  } else {
    if (!status.isPremium) {
      throw new Error('Premium subscription is required for this action');
    }
  }
}

/**
 * Get default premium status (no access)
 */
function getDefaultPremiumStatus(): PremiumStatus {
  return {
    isPremium: false,
    tier: null,
    expiresAt: null,
    isExpiringSoon: false,
    features: {},
    source: null,
  };
}

/**
 * Format expiry date for display
 * @param expiresAt - Expiry date
 * @returns Formatted string
 */
export function formatExpiryDate(expiresAt: Date | null): string {
  if (!expiresAt) {
    return 'Never';
  }

  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`;
  } else {
    return expiresAt.toLocaleDateString();
  }
}

/**
 * Check if premium is expiring soon (within 7 days)
 * @param expiresAt - Expiry date
 * @returns Boolean indicating if expiring soon
 */
export function isExpiringSoon(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 && diffDays <= 7;
}
