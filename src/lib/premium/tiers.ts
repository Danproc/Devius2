import { db } from '@/db';
import { plans } from '@/db/schema/plans';
import { eq, and, isNotNull } from 'drizzle-orm';

/**
 * Premium Tier Type
 */
export interface PremiumTier {
  id: string;
  tier_code: string;
  name: string;
  features: Record<string, boolean>;
  monthlyPrice: number;
  monthlyStripePriceId: string;
  yearlyPrice: number;
  yearlyStripePriceId: string;
}

/**
 * Fetch all active premium tiers from database
 * Used by pricing page to display available subscription options
 */
export async function getActivePremiumTiers(): Promise<PremiumTier[]> {
  const tiers = await db
    .select({
      id: plans.id,
      tier_code: plans.tier_code,
      name: plans.name,
      features: plans.features,
      monthlyPrice: plans.monthlyPrice,
      monthlyStripePriceId: plans.monthlyStripePriceId,
      yearlyPrice: plans.yearlyPrice,
      yearlyStripePriceId: plans.yearlyStripePriceId,
    })
    .from(plans)
    .where(
      and(
        eq(plans.active, true),
        isNotNull(plans.tier_code)
      )
    )
    .orderBy(plans.monthlyPrice);

  return tiers.map(tier => ({
    id: tier.id,
    tier_code: tier.tier_code!,
    name: tier.name!,
    features: (tier.features as Record<string, boolean>) || {},
    monthlyPrice: tier.monthlyPrice!,
    monthlyStripePriceId: tier.monthlyStripePriceId!,
    yearlyPrice: tier.yearlyPrice!,
    yearlyStripePriceId: tier.yearlyStripePriceId!,
  }));
}

/**
 * Get a specific premium tier by tier code
 */
export async function getPremiumTierByCode(tierCode: string): Promise<PremiumTier | null> {
  const tier = await db
    .select({
      id: plans.id,
      tier_code: plans.tier_code,
      name: plans.name,
      features: plans.features,
      monthlyPrice: plans.monthlyPrice,
      monthlyStripePriceId: plans.monthlyStripePriceId,
      yearlyPrice: plans.yearlyPrice,
      yearlyStripePriceId: plans.yearlyStripePriceId,
    })
    .from(plans)
    .where(eq(plans.tier_code, tierCode))
    .limit(1);

  if (tier.length === 0 || !tier[0].tier_code) {
    return null;
  }

  const t = tier[0];
  return {
    id: t.id,
    tier_code: t.tier_code!,
    name: t.name!,
    features: (t.features as Record<string, boolean>) || {},
    monthlyPrice: t.monthlyPrice!,
    monthlyStripePriceId: t.monthlyStripePriceId!,
    yearlyPrice: t.yearlyPrice!,
    yearlyStripePriceId: t.yearlyStripePriceId!,
  };
}

/**
 * Get Stripe price ID for a specific tier and billing frequency
 */
export async function getStripePriceId(
  tierCode: string,
  frequency: 'monthly' | 'annual'
): Promise<string | null> {
  const tier = await getPremiumTierByCode(tierCode);
  if (!tier) return null;

  const priceId = frequency === 'monthly'
    ? tier.monthlyStripePriceId
    : tier.yearlyStripePriceId;

  return priceId || null;
}
