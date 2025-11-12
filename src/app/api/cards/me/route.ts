/**
 * GET/PATCH /api/cards/me
 *
 * Get and update authenticated user's DevCard
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getDevCard } from '@/lib/devcard';
import { getCachedGitHubUserData } from '@/lib/github';
import { validateDevCardUpdate } from '@/lib/devcard/customize';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';

/**
 * GET /api/cards/me
 * Retrieve authenticated user's DevCard
 */
export const GET = withAuthRequired(async (req: NextRequest, context) => {
  const { session } = context;
  const userId = session.user.id;

  try {
    // Fetch user's DevCard
    const devcard = await getDevCard(userId);

    if (!devcard) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: 'You have not created a DevCard yet',
        },
        { status: 404 }
      );
    }

    // Fetch cached GitHub stats if available
    const cachedData = await getCachedGitHubUserData(userId);

    // Build response with DevCard data
    const response = {
      id: devcard.id,
      user_id: devcard.user_id,
      url_slug: devcard.url_slug,
      is_public: devcard.is_public,
      display_name: devcard.display_name,
      custom_bio: devcard.custom_bio,
      location: devcard.location,
      avatar_url: devcard.avatar_url,
      github_username: devcard.github_username,
      github_stats: cachedData
        ? {
            public_repos: cachedData.stats.public_repos,
            followers: cachedData.stats.followers,
            following: cachedData.stats.following,
            total_stars: cachedData.stats.total_stars,
            contribution_streak: cachedData.stats.contribution_streak,
          }
        : null,
      social_links: devcard.social_links,
      featured_repos: devcard.featured_repos,
      tech_stack: devcard.tech_stack,
      availability_status: devcard.availability_status,
      availability_message: devcard.availability_message,
      theme: devcard.theme,
      view_count: devcard.view_count,
      created_at: devcard.created_at,
      updated_at: devcard.updated_at,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('DevCard fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch DevCard',
        message: error.message || 'An error occurred while fetching your DevCard',
      },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/cards/me
 * Update authenticated user's DevCard profile
 */
export const PATCH = withAuthRequired(async (req: NextRequest, context) => {
  const { session } = context;
  const userId = session.user.id;

  try {
    // Check if user has a DevCard
    const existingCard = await getDevCard(userId);

    if (!existingCard) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: 'You need to create a DevCard before updating it',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate update data using Zod schema
    const validation = validateDevCardUpdate(body);

    if (!validation.success) {
      // Extract validation errors
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: 'Validation failed',
          message: errors[0]?.message || 'Invalid input data',
          errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Check if there's anything to update
    const updateData: any = {};
    const allowedFields = [
      'display_name',
      'custom_bio',
      'location',
      'social_links',
      'featured_repos',
      'tech_stack',
      'availability_status',
      'availability_message',
      'theme',
    ] as const;

    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        updateData[field] = validatedData[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'No valid fields to update',
        },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date();

    // Update the DevCard
    const [updatedCard] = await db
      .update(devcards)
      .set(updateData)
      .where(eq(devcards.user_id, userId))
      .returning();

    // Revalidate the public profile page cache
    try {
      revalidatePath(`/${updatedCard.url_slug}`);
      revalidateTag('devcards');
    } catch (error) {
      console.error('Failed to revalidate cache:', error);
      // Don't fail the request if revalidation fails
    }

    // Fetch cached GitHub stats if available
    const cachedData = await getCachedGitHubUserData(userId);

    // Build response
    const response = {
      id: updatedCard.id,
      user_id: updatedCard.user_id,
      url_slug: updatedCard.url_slug,
      is_public: updatedCard.is_public,
      display_name: updatedCard.display_name,
      custom_bio: updatedCard.custom_bio,
      location: updatedCard.location,
      avatar_url: updatedCard.avatar_url,
      github_username: updatedCard.github_username,
      github_stats: cachedData
        ? {
            public_repos: cachedData.stats.public_repos,
            followers: cachedData.stats.followers,
            following: cachedData.stats.following,
            total_stars: cachedData.stats.total_stars,
            contribution_streak: cachedData.stats.contribution_streak,
          }
        : null,
      social_links: updatedCard.social_links,
      featured_repos: updatedCard.featured_repos,
      tech_stack: updatedCard.tech_stack,
      availability_status: updatedCard.availability_status,
      availability_message: updatedCard.availability_message,
      theme: updatedCard.theme,
      view_count: updatedCard.view_count,
      created_at: updatedCard.created_at,
      updated_at: updatedCard.updated_at,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('DevCard update error:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update DevCard',
        message: error.message || 'An error occurred while updating your DevCard',
      },
      { status: 500 }
    );
  }
});
