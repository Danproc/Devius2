/**
 * Admin API: Grant Founding Member Promotions
 * POST /api/super-admin/promotions/grant-founding
 *
 * Grants the first 100 members a free year of premium access
 */

import { NextResponse } from 'next/server';
import withSuperAdminAuthRequired from '@/lib/auth/withSuperAdminAuthRequired';
import { grantFoundingMemberPromotion } from '@/lib/promotions/founding-member';

export const POST = withSuperAdminAuthRequired(async (req, context) => {
  try {
    const session = await context.session;
    const adminUserId = session?.user?.id;

    console.log('🚀 Founding Member Grant API called by admin:', adminUserId);

    // Execute the founding member grant
    const result = await grantFoundingMemberPromotion(adminUserId);

    console.log('✅ Founding member grant completed:', result);

    return NextResponse.json({
      success: true,
      result: {
        total: result.total,
        granted: result.granted,
        skipped: result.skipped,
        expiresAt: result.expiresAt.toISOString(),
        skippedReasons: result.skippedReasons,
      },
      message: `Successfully granted founding member premium to ${result.granted} out of ${result.total} eligible users`,
    });
  } catch (error) {
    console.error('❌ Error granting founding member premium:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grant founding member premium',
      },
      { status: 500 }
    );
  }
});
