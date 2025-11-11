/**
 * GET /api/share/qr/{username}
 *
 * Generate QR code for a DevCard profile
 * Returns base64 data URL with 7-day caching via Vercel KV
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQRWithCache } from '@/lib/sharing/qr-generator';
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

    // Get size from query parameter (default: 400, min: 200, max: 1000)
    const searchParams = req.nextUrl.searchParams;
    const sizeParam = searchParams.get('size');
    let size = 400;

    if (sizeParam) {
      const parsedSize = parseInt(sizeParam, 10);
      if (isNaN(parsedSize)) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'Size parameter must be a number',
          },
          { status: 400 }
        );
      }
      if (parsedSize < 200 || parsedSize > 1000) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'Size parameter must be between 200 and 1000',
          },
          { status: 400 }
        );
      }
      size = parsedSize;
    }

    // Check if DevCard exists and is public
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.url_slug, username))
      .limit(1);

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

    // Generate QR code with caching (7-day TTL)
    const result = await generateQRWithCache(username, { size });

    // Return QR code result
    return NextResponse.json({
      qr_code: result.qr_code,
      url: result.url,
    });
  } catch (error: any) {
    console.error('QR code generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate QR code',
        message: error.message || 'An error occurred while generating the QR code',
      },
      { status: 500 }
    );
  }
}
