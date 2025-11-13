/**
 * Premium Feature Gating Middleware
 * T116: Implement feature gating middleware in src/lib/premium/check-premium.ts
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { plans } from '@/db/schema/plans';
import { eq } from 'drizzle-orm';

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: Date | null;
  features: {
    custom_themes: boolean;
    priority_support: boolean;
    organization_profiles: boolean;
  };
}

/**
 * Check if a user has premium access
 * @param userId - User ID to check
 * @returns Premium status object
 */
export async function checkPremium(userId: string): Promise<PremiumStatus> {
  try {
    // Get user with their plan
    const [user] = await db
      .select({
        id: users.id,
        is_premium: users.is_premium,
        premium_expires_at: users.premium_expires_at,
        planId: users.planId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return getDefaultPremiumStatus();
    }

    // Check if premium is active
    const isPremiumActive = user.is_premium &&
      (!user.premium_expires_at || user.premium_expires_at > new Date());

    // Get plan features if user has a plan
    let planFeatures = null;
    if (user.planId) {
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, user.planId))
        .limit(1);

      if (plan?.features) {
        planFeatures = plan.features;
      }
    }

    return {
      isPremium: isPremiumActive,
      expiresAt: user.premium_expires_at,
      features: {
        custom_themes: isPremiumActive && (planFeatures?.custom_themes ?? false),
        priority_support: isPremiumActive && (planFeatures?.priority_support ?? false),
        organization_profiles: isPremiumActive && (planFeatures?.organization_profiles ?? false),
      },
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    return getDefaultPremiumStatus();
  }
}

/**
 * Check if a user has access to a specific premium feature
 * @param userId - User ID to check
 * @param feature - Feature name to check
 * @returns Boolean indicating feature access
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof PremiumStatus['features']
): Promise<boolean> {
  const status = await checkPremium(userId);
  return status.features[feature];
}

/**
 * Require premium access for a feature
 * Throws an error if user doesn't have access
 * @param userId - User ID to check
 * @param feature - Optional specific feature to check
 */
export async function requirePremium(
  userId: string,
  feature?: keyof PremiumStatus['features']
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
    expiresAt: null,
    features: {
      custom_themes: false,
      priority_support: false,
      organization_profiles: false,
    },
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
