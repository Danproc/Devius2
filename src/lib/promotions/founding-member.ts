/**
 * Founding Member Promotional Grant
 * Service for granting the first 100 members a free year of premium access
 */

import { db } from '@/db';
import { users } from '@/db/schema/user';
import { devcards } from '@/db/schema/devcard';
import { grantPromotion, hasReceivedPromotion } from './grant-service';
import { awardAchievements } from '@/lib/achievements/check-achievements';
import { PROMOTION_TYPES } from '@/db/schema/promotional-grants';
import { eq, lte, and, isNotNull } from 'drizzle-orm';

/**
 * Constants
 */
const FOUNDING_MEMBER_COUNT = 100;
const GRANT_DURATION_DAYS = 365; // 1 year
const GRANT_TIER = 'premium'; // Grant 'premium' tier
const PROMOTION_TYPE = PROMOTION_TYPES.FOUNDING_MEMBER_YEAR;
const PROMOTION_NAME = 'Founding Member Free Year';

/**
 * Grant Result
 */
export interface FoundingGrantResult {
  total: number; // Total first 100 users
  granted: number; // Number of grants issued
  skipped: number; // Number of users skipped
  expiresAt: Date; // When grants expire
  skippedReasons: Array<{ userId: string; memberNumber: number; reason: string }>;
}

/**
 * Grant founding member promotion to first 100 users
 * Idempotent - can be run multiple times safely
 */
export async function grantFoundingMemberPromotion(grantedBy?: string): Promise<FoundingGrantResult> {
  console.log(`🚀 Starting founding member grant process...`);
  console.log(`📊 Targeting first ${FOUNDING_MEMBER_COUNT} members`);

  // Get first 100 users by member_number
  const first100 = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      memberNumber: devcards.member_number,
      stripeSubscriptionId: users.stripeSubscriptionId,
      planId: users.planId,
    })
    .from(devcards)
    .innerJoin(users, eq(devcards.user_id, users.id))
    .where(lte(devcards.member_number, FOUNDING_MEMBER_COUNT))
    .orderBy(devcards.member_number);

  console.log(`✅ Found ${first100.length} users in first ${FOUNDING_MEMBER_COUNT}`);

  let granted = 0;
  let skipped = 0;
  const skippedReasons: Array<{ userId: string; memberNumber: number; reason: string }> = [];

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + GRANT_DURATION_DAYS);

  for (const user of first100) {
    // Skip if user already has Stripe subscription (per user requirement)
    if (user.stripeSubscriptionId) {
      skipped++;
      skippedReasons.push({
        userId: user.userId,
        memberNumber: user.memberNumber,
        reason: 'Already has active Stripe subscription',
      });
      console.log(`⏭️  Skipped #${user.memberNumber} (${user.email}): Already has Stripe subscription`);
      continue;
    }

    // Skip if user already received this promotion
    const alreadyReceived = await hasReceivedPromotion(user.userId, PROMOTION_TYPE);
    if (alreadyReceived) {
      skipped++;
      skippedReasons.push({
        userId: user.userId,
        memberNumber: user.memberNumber,
        reason: 'Already received founding member promotion',
      });
      console.log(`⏭️  Skipped #${user.memberNumber} (${user.email}): Already received promotion`);
      continue;
    }

    try {
      // Grant promotional access
      await grantPromotion({
        userId: user.userId,
        promotionType: PROMOTION_TYPE,
        promotionName: PROMOTION_NAME,
        tier: GRANT_TIER,
        durationDays: GRANT_DURATION_DAYS,
        metadata: {
          badge: 'pioneer', // Award pioneer achievement
          member_number: user.memberNumber,
        },
        grantedBy,
      });

      // Award pioneer achievement badge
      await awardAchievements(user.userId, ['pioneer']);

      granted++;
      console.log(`✅ Granted to #${user.memberNumber}: ${user.email} (expires ${expiresAt.toISOString()})`);

      // TODO: Send welcome email
      // await sendFoundingMemberWelcomeEmail(user);
    } catch (error) {
      skipped++;
      skippedReasons.push({
        userId: user.userId,
        memberNumber: user.memberNumber,
        reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      console.error(`❌ Failed to grant to #${user.memberNumber} (${user.email}):`, error);
    }
  }

  const result: FoundingGrantResult = {
    total: first100.length,
    granted,
    skipped,
    expiresAt,
    skippedReasons,
  };

  console.log(`\n✅ FOUNDING MEMBER GRANT COMPLETE`);
  console.log(`📊 Total eligible: ${result.total}`);
  console.log(`👑 Grants issued: ${result.granted}`);
  console.log(`⏭️  Skipped: ${result.skipped}`);
  console.log(`📅 Expires: ${result.expiresAt.toISOString()}`);
  console.log(`⏰ Duration: ${GRANT_DURATION_DAYS} days`);

  return result;
}

/**
 * Check if a user is a founding member (first 100)
 */
export async function isFoundingMember(userId: string): Promise<boolean> {
  const [devcard] = await db
    .select({
      memberNumber: devcards.member_number,
    })
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  return devcard?.memberNumber ? devcard.memberNumber <= FOUNDING_MEMBER_COUNT : false;
}

/**
 * Get founding member details
 */
export async function getFoundingMemberDetails(userId: string) {
  const [devcard] = await db
    .select({
      memberNumber: devcards.member_number,
      createdAt: devcards.created_at,
    })
    .from(devcards)
    .where(eq(devcards.user_id, userId))
    .limit(1);

  if (!devcard || devcard.memberNumber > FOUNDING_MEMBER_COUNT) {
    return null;
  }

  // Check if they have the founding grant
  const hasGrant = await hasReceivedPromotion(userId, PROMOTION_TYPE);

  return {
    memberNumber: devcard.memberNumber,
    joinedAt: devcard.createdAt,
    hasFoundingGrant: hasGrant,
  };
}
