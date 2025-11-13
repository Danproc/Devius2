/**
 * GET /api/cards/{username}
 *
 * Retrieve a public DevCard profile by username slug
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDevCardBySlug } from '@/lib/devcard';
import { getCachedGitHubUserData } from '@/lib/github';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;

    if (!username) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Username parameter is required',
        },
        { status: 400 }
      );
    }

    // Fetch DevCard by URL slug
    const devcard = await getDevCardBySlug(username);

    if (!devcard) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: `No DevCard found for username: ${username}`,
        },
        { status: 404 }
      );
    }

    // Check if the DevCard is public
    if (!devcard.is_public) {
      return NextResponse.json(
        {
          error: 'DevCard not found',
          message: `No DevCard found for username: ${username}`,
        },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .update(devcards)
      .set({
        view_count: devcard.view_count + 1,
      })
      .where(eq(devcards.id, devcard.id));

    // Fetch cached GitHub stats if available (use devcard.id, not user_id!)
    const cachedData = await getCachedGitHubUserData(devcard.id);

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
            public_repos: cachedData.stats?.public_repos || cachedData.profile?.public_repos || 0,
            followers: cachedData.stats?.followers || cachedData.profile?.followers || 0,
            following: cachedData.stats?.following || cachedData.profile?.following || 0,
            total_stars: cachedData.stats?.total_stars || 0,
            contribution_streak: cachedData.stats?.contribution_streak || 0,
            public_gists: cachedData.profile?.public_gists || cachedData.stats?.public_gists || 0,
            contributions: cachedData.contributions,
            organizations: cachedData.organizations,
            most_starred_repo: cachedData.most_starred_repo,
            top_languages: cachedData.top_languages,
          }
        : null,
      social_links: devcard.social_links,
      featured_repos: devcard.featured_repos,
      tech_stack: devcard.tech_stack,
      availability_status: devcard.availability_status,
      availability_message: devcard.availability_message,
      theme: devcard.theme,
      view_count: devcard.view_count + 1, // Return updated count
      created_at: devcard.created_at,
      updated_at: devcard.updated_at,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('DevCard fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch DevCard',
        message: error.message || 'An error occurred while fetching the DevCard',
      },
      { status: 500 }
    );
  }
}
