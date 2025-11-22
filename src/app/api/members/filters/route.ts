import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getFilterOptions } from '@/db/queries/members';

/**
 * GET /api/members/filters
 * Get available filter options for the member directory
 * T009: Filter options API endpoint
 */
export const GET = withAuthRequired(async (req: NextRequest) => {
  try {
    const filters = await getFilterOptions();

    return NextResponse.json(filters);
  } catch (error) {
    console.error('Filter options error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
});
