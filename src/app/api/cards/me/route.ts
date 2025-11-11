/**
 * GET/PATCH /api/cards/me
 *
 * Get and update authenticated user's DevCard
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { getDevCard } from '@/lib/devcard';
import { getCachedGitHubUserData } from '@/lib/github';
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

    // Validate and extract allowed fields
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
    ];

    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate custom_bio length
    if (updateData.custom_bio && updateData.custom_bio.length > 500) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Custom bio must be 500 characters or less',
        },
        { status: 400 }
      );
    }

    // Validate availability_status
    if (updateData.availability_status) {
      const validStatuses = ['open', 'available', 'not-available', 'custom'];
      if (!validStatuses.includes(updateData.availability_status)) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid availability status',
          },
          { status: 400 }
        );
      }
    }

    // Validate featured_repos array length
    if (updateData.featured_repos && updateData.featured_repos.length > 6) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'You can feature a maximum of 6 repositories',
        },
        { status: 400 }
      );
    }

    // Validate tech_stack array length
    if (updateData.tech_stack && updateData.tech_stack.length > 20) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Tech stack can contain a maximum of 20 items',
        },
        { status: 400 }
      );
    }

    // Check if there's anything to update
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

    return NextResponse.json(
      {
        error: 'Failed to update DevCard',
        message: error.message || 'An error occurred while updating your DevCard',
      },
      { status: 500 }
    );
  }
});
