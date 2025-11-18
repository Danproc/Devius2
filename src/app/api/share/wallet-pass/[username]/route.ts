/**
 * GET /api/share/wallet-pass/{username}?platform=apple|google
 *
 * Generate Apple Wallet or Google Pay pass for a DevCard profile
 * Returns binary .pkpass file for Apple or JSON with JWT for Google
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateWalletPass,
  isAppleWalletConfigured,
  isGooglePayConfigured,
  type WalletPlatform,
  type ApplePassResult,
  type GooglePassResult,
} from '@/lib/sharing/wallet-pass';
import { getDevCardBySlug } from '@/lib/devcard';
import { getUserBadges } from '@/lib/hackathons/queries';

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

    // Get platform from query parameter (required)
    const searchParams = req.nextUrl.searchParams;
    const platform = searchParams.get('platform') as WalletPlatform | null;

    if (!platform) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Platform parameter is required (apple or google)',
        },
        { status: 400 }
      );
    }

    if (platform !== 'apple' && platform !== 'google') {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Platform parameter must be either "apple" or "google"',
        },
        { status: 400 }
      );
    }

    // Check platform configuration
    if (platform === 'apple' && !isAppleWalletConfigured()) {
      return NextResponse.json(
        {
          error: 'Service unavailable',
          message: 'Apple Wallet pass generation is not configured',
        },
        { status: 503 }
      );
    }

    if (platform === 'google' && !isGooglePayConfigured()) {
      return NextResponse.json(
        {
          error: 'Service unavailable',
          message: 'Google Pay pass generation is not configured',
        },
        { status: 503 }
      );
    }

    // Check if DevCard exists and is public
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

    // Fetch hackathon badges
    const badges = await getUserBadges(devcard.user_id);

    // Calculate badge stats
    const firstPlace = badges.filter((b) => b.placement === 1).length;
    const secondPlace = badges.filter((b) => b.placement === 2).length;
    const thirdPlace = badges.filter((b) => b.placement === 3).length;

    // Prepare DevCard data for wallet pass generation
    const devCardData = {
      username: devcard.url_slug,
      display_name: devcard.display_name,
      custom_bio: devcard.custom_bio || undefined,
      location: devcard.location || undefined,
      avatar_url: devcard.avatar_url || undefined,
      github_username: devcard.github_username || undefined,
      member_number: devcard.member_number || undefined,
      social_links: devcard.social_links
        ? {
            twitter: (devcard.social_links as any).twitter || undefined,
            linkedin: (devcard.social_links as any).linkedin || undefined,
            website: (devcard.social_links as any).website || undefined,
          }
        : undefined,
      hackathon_wins:
        firstPlace + secondPlace + thirdPlace > 0
          ? {
              first: firstPlace,
              second: secondPlace,
              third: thirdPlace,
            }
          : undefined,
    };

    // Generate wallet pass
    const result = await generateWalletPass(platform, devCardData);

    // Return based on platform
    if (platform === 'apple') {
      const appleResult = result as ApplePassResult;
      return new NextResponse(new Uint8Array(appleResult.pass), {
        status: 200,
        headers: {
          'Content-Type': appleResult.mimeType,
          'Content-Disposition': `attachment; filename="${username}-devcard.pkpass"`,
        },
      });
    } else {
      // Google Pay
      const googleResult = result as GooglePassResult;
      return NextResponse.json({
        jwt: googleResult.jwt,
        save_url: googleResult.save_url,
      });
    }
  } catch (error: any) {
    console.error('Wallet pass generation error:', error);

    // Check if this is a configuration error
    if (error.message?.includes('requires') || error.message?.includes('environment variables')) {
      return NextResponse.json(
        {
          error: 'Service unavailable',
          message: 'Wallet pass generation is not properly configured',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate wallet pass',
        message: error.message || 'An error occurred while generating the wallet pass',
      },
      { status: 500 }
    );
  }
}
