/**
 * POST /api/github/sync
 *
 * Manually trigger GitHub profile and repository data sync
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { syncDevCard, hasDevCard } from '@/lib/devcard';

export const POST = withAuthRequired(async (req: NextRequest, context) => {
  const { session } = context;
  const userId = session.user.id;

  try {
    // Check if user has a DevCard
    const cardExists = await hasDevCard(userId);

    if (!cardExists) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: 'You need to create a DevCard before syncing GitHub data',
        },
        { status: 404 }
      );
    }

    // Sync GitHub data
    const updatedCard = await syncDevCard(userId);

    // Revalidate the public profile page and GitHub stats cache
    try {
      revalidatePath(`/${updatedCard.url_slug}`, 'page');
      revalidateTag('github-stats', 'max');
      revalidateTag('devcards', 'max');
    } catch (error) {
      console.error('Failed to revalidate cache:', error);
    }

    return NextResponse.json({
      message: 'GitHub sync initiated',
      devcard: {
        id: updatedCard.id,
        last_sync: updatedCard.last_github_sync,
        updated_at: updatedCard.updated_at,
      },
    });
  } catch (error: any) {
    console.error('GitHub sync error:', error);

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
        error: 'Sync failed',
        message: error.message || 'Failed to sync GitHub data',
      },
      { status: 500 }
    );
  }
});
