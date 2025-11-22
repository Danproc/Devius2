import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { searchMembers, getFilterOptions } from '@/db/queries/members';
import { MembersSearchResponse } from '@/lib/members/types';

/**
 * GET /api/members
 * Search and filter members with pagination
 * T008: Main member search API endpoint
 */
export const GET = withAuthRequired(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse and validate parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search')?.trim().slice(0, 100) || '';
    const location = searchParams.get('location')?.trim().slice(0, 100) || undefined;
    const tech_stack = searchParams.getAll('tech').slice(0, 10); // Max 10 technologies
    const achievement_types = searchParams.getAll('achievement');
    const winners_only = searchParams.get('winners') === 'true';
    const sort = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest';

    // Execute search
    const { membersList, totalCount } = await searchMembers({
      search: search || undefined,
      location,
      tech_stack: tech_stack.length > 0 ? tech_stack : undefined,
      achievement_types: achievement_types.length > 0 ? achievement_types : undefined,
      winners_only,
      page,
      limit,
      sort,
    });

    // Get filter options
    const filters = await getFilterOptions();

    // Build response
    const response: MembersSearchResponse = {
      members: membersList,
      pagination: {
        total: totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
        perPage: limit,
      },
      filters,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Member search error:', error);
    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    );
  }
});
