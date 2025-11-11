/**
 * GET /api/github/repos
 *
 * Retrieve user's GitHub repositories with stats
 * Requires authentication
 * Supports sorting and limiting results
 */

import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { fetchUserRepositories, simplifyRepositories } from '@/lib/github';

export const GET = withAuthRequired(async (req: NextRequest, context) => {
  const { session } = context;
  const userId = session.user.id;

  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const sortParam = searchParams.get('sort') || 'stars';
    const limitParam = searchParams.get('limit') || '30';

    // Validate sort parameter
    const validSorts = ['stars', 'updated', 'created'];
    const sort = validSorts.includes(sortParam) ? sortParam : 'stars';

    // Validate limit parameter
    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 30, 1), 100);

    // Fetch repositories from GitHub
    const repositories = await fetchUserRepositories(userId, {
      maxRepos: limit,
      includeForked: false,
      includePrivate: false,
    });

    // Sort repositories based on the sort parameter
    let sortedRepos = [...repositories];

    if (sort === 'stars') {
      // Already sorted by stars in fetchUserRepositories
      sortedRepos = repositories;
    } else if (sort === 'updated') {
      sortedRepos.sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA;
      });
    } else if (sort === 'created') {
      sortedRepos.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
    }

    // Simplify repository data for response
    const simplifiedRepos = simplifyRepositories(sortedRepos, limit);

    return NextResponse.json({
      repositories: simplifiedRepos,
    });
  } catch (error: any) {
    console.error('GitHub repos fetch error:', error);

    // Handle GitHub rate limit errors
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'GitHub API rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Handle GitHub authentication errors
    if (error.status === 401 || error.message?.includes('authentication')) {
      return NextResponse.json(
        {
          error: 'GitHub authentication failed',
          message: 'Failed to authenticate with GitHub. Please reconnect your account.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch repositories',
        message: error.message || 'An error occurred while fetching repositories',
      },
      { status: 500 }
    );
  }
});
