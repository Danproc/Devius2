/**
 * Promotional Grants Service
 * Core service for managing time-limited promotional access to premium features
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { promotional_grants, type PromotionalGrant, type NewPromotionalGrant, type PromotionalGrantMetadata } from '@/db/schema/promotional-grants';
import { eq, and, lt, gt } from 'drizzle-orm';

/**
 * Grant Promotion Options
 */
export interface GrantPromotionOptions {
  userId: string;
  promotionType: string;
  promotionName: string;
  tier: string; // 'premium' or 'premium_pro'
  durationDays: number;
  metadata?: PromotionalGrantMetadata;
  grantedBy?: string; // Admin user ID
}

/**
 * Grant a promotional access to a user
 * Creates a new promotional grant and activates premium access
 */
export async function grantPromotion(options: GrantPromotionOptions): Promise<PromotionalGrant> {
  const { userId, promotionType, promotionName, tier, durationDays, metadata = {}, grantedBy } = options;

  // Calculate expiration date
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  // Create promotional grant record
  const [grant] = await db
    .insert(promotional_grants)
    .values({
      user_id: userId,
      promotion_type: promotionType,
      promotion_name: promotionName,
      granted_tier: tier,
      granted_duration_days: durationDays,
      status: 'active',
      granted_at: now,
      expires_at: expiresAt,
      activated_at: now,
      metadata,
      granted_by: grantedBy,
    })
    .returning();

  // Activate the grant (set user premium status)
  await activateGrant(grant.id);

  return grant;
}

/**
 * Activate a promotional grant
 * Sets user premium status based on the grant
 */
export async function activateGrant(grantId: string): Promise<void> {
  // Get the grant
  const [grant] = await db
    .select()
    .from(promotional_grants)
    .where(eq(promotional_grants.id, grantId))
    .limit(1);

  if (!grant) {
    throw new Error(`Promotional grant ${grantId} not found`);
  }

  if (grant.status !== 'active') {
    throw new Error(`Promotional grant ${grantId} is not active (status: ${grant.status})`);
  }

  // Update user premium status
  await db
    .update(users)
    .set({
      is_premium: true,
      premium_tier: grant.granted_tier,
      premium_expires_at: grant.expires_at,
      premium_source: 'promotional',
    })
    .where(eq(users.id, grant.user_id));

  // Update grant activation timestamp
  await db
    .update(promotional_grants)
    .set({
      activated_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(promotional_grants.id, grantId));
}

/**
 * Get user's active promotional grant
 * Returns the most recent active grant if one exists
 */
export async function getActiveGrant(userId: string): Promise<PromotionalGrant | null> {
  const now = new Date();

  const [grant] = await db
    .select()
    .from(promotional_grants)
    .where(
      and(
        eq(promotional_grants.user_id, userId),
        eq(promotional_grants.status, 'active'),
        gt(promotional_grants.expires_at, now)
      )
    )
    .orderBy(promotional_grants.expires_at)
    .limit(1);

  return grant || null;
}

/**
 * Check if user has received a specific promotion
 * Returns true if the user has ever received this promotion type
 */
export async function hasReceivedPromotion(userId: string, promotionType: string): Promise<boolean> {
  const [grant] = await db
    .select()
    .from(promotional_grants)
    .where(
      and(
        eq(promotional_grants.user_id, userId),
        eq(promotional_grants.promotion_type, promotionType)
      )
    )
    .limit(1);

  return !!grant;
}

/**
 * Revoke a promotional grant
 * Admin action to cancel an active grant before expiration
 */
export async function revokeGrant(grantId: string, reason: string, revokedBy?: string): Promise<void> {
  // Get the grant
  const [grant] = await db
    .select()
    .from(promotional_grants)
    .where(eq(promotional_grants.id, grantId))
    .limit(1);

  if (!grant) {
    throw new Error(`Promotional grant ${grantId} not found`);
  }

  if (grant.status !== 'active') {
    throw new Error(`Promotional grant ${grantId} is already ${grant.status}`);
  }

  // Update grant status
  await db
    .update(promotional_grants)
    .set({
      status: 'revoked',
      revoke_reason: reason,
      updated_at: new Date(),
    })
    .where(eq(promotional_grants.id, grantId));

  // Check if user has other active grants or premium sources
  const activeGrant = await getActiveGrant(grant.user_id);

  // If no other active grants, revoke premium access
  if (!activeGrant) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, grant.user_id))
      .limit(1);

    // Only revoke if premium source is promotional and no Stripe subscription
    if (user?.premium_source === 'promotional' && !user.stripeSubscriptionId) {
      await db
        .update(users)
        .set({
          is_premium: false,
          premium_tier: null,
          premium_source: null,
        })
        .where(eq(users.id, grant.user_id));
    }
  }
}

/**
 * Auto-expire promotional grants
 * Finds and expires all grants past their expiration date
 * Should be run daily via Inngest job
 */
export async function expireGrants(): Promise<number> {
  const now = new Date();

  // Find all active grants that have expired
  const expiredGrants = await db
    .select()
    .from(promotional_grants)
    .where(
      and(
        eq(promotional_grants.status, 'active'),
        lt(promotional_grants.expires_at, now)
      )
    );

  if (expiredGrants.length === 0) {
    return 0;
  }

  // Update grant status to expired
  await db
    .update(promotional_grants)
    .set({
      status: 'expired',
      updated_at: now,
    })
    .where(
      and(
        eq(promotional_grants.status, 'active'),
        lt(promotional_grants.expires_at, now)
      )
    );

  // For each expired grant, check if user should lose premium access
  for (const grant of expiredGrants) {
    // Check if user has other active grants
    const activeGrant = await getActiveGrant(grant.user_id);

    // If no other active grants, premium will be revoked by checkPremium()
    // We don't need to manually revoke here - let the premium check handle it
  }

  console.log(`✅ Expired ${expiredGrants.length} promotional grant(s)`);
  return expiredGrants.length;
}

/**
 * Get all promotional grants for a user
 * Returns grants in all statuses (active, expired, revoked)
 */
export async function getUserGrants(userId: string): Promise<PromotionalGrant[]> {
  return await db
    .select()
    .from(promotional_grants)
    .where(eq(promotional_grants.user_id, userId))
    .orderBy(promotional_grants.created_at);
}

/**
 * Get all active promotional grants
 * For admin dashboard
 */
export async function getAllActiveGrants(): Promise<PromotionalGrant[]> {
  const now = new Date();

  return await db
    .select()
    .from(promotional_grants)
    .where(
      and(
        eq(promotional_grants.status, 'active'),
        gt(promotional_grants.expires_at, now)
      )
    )
    .orderBy(promotional_grants.expires_at);
}

/**
 * Get promotional grants by type
 * For analytics and reporting
 */
export async function getGrantsByType(promotionType: string): Promise<PromotionalGrant[]> {
  return await db
    .select()
    .from(promotional_grants)
    .where(eq(promotional_grants.promotion_type, promotionType))
    .orderBy(promotional_grants.created_at);
}
