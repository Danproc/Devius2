/**
 * Founding Member Promotion Status API
 * GET /api/promotions/founding-status
 *
 * Returns how many founding member spots are left (out of 100)
 */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { promotional_grants } from '@/db/schema/promotional-grants';
import { users } from '@/db/schema/user';
import { lte, eq, and } from 'drizzle-orm';
import { PROMOTION_TYPES } from '@/db/schema/promotional-grants';

const FOUNDING_MEMBER_LIMIT = 100;

export async function GET() {
  try {
    // Count total members in first 100
    const totalFirstHundred = await db
      .select()
      .from(devcards)
      .where(lte(devcards.member_number, FOUNDING_MEMBER_LIMIT));

    // Count how many have received the founding grant
    const grantedCount = await db
      .select()
      .from(promotional_grants)
      .where(eq(promotional_grants.promotion_type, PROMOTION_TYPES.FOUNDING_MEMBER_YEAR));

    const spotsLeft = FOUNDING_MEMBER_LIMIT - grantedCount.length;
    const percentageClaimed = Math.round((grantedCount.length / FOUNDING_MEMBER_LIMIT) * 100);

    return NextResponse.json({
      total: FOUNDING_MEMBER_LIMIT,
      claimed: grantedCount.length,
      remaining: spotsLeft,
      percentageClaimed,
      isActive: spotsLeft > 0, // Promotion is active if spots remain
    });
  } catch (error) {
    console.error('Error checking founding member status:', error);
    return NextResponse.json(
      { error: 'Failed to check founding member status' },
      { status: 500 }
    );
  }
}
