/**
 * POST /api/analytics/track
 *
 * Internal endpoint for tracking analytics events from client-side
 * Used for share actions, QR scans, and other client-initiated events
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  trackCardView,
  trackQRScan,
  trackShare,
  trackConnectionRequest,
  ShareMethod,
} from '@/lib/analytics/track';

export const runtime = 'edge';

/**
 * POST /api/analytics/track
 *
 * Request body:
 * - eventType: "card_view" | "qr_scan" | "share" | "connection_request"
 * - username: string (target username)
 * - devcardId: string (optional)
 * - shareMethod: string (required for "share" events)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, username, devcardId, shareMethod } = body;

    // Validate required fields
    if (!eventType || !username) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'eventType and username are required',
        },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes = ['card_view', 'qr_scan', 'share', 'connection_request'];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        {
          error: 'Invalid event type',
          message: `eventType must be one of: ${validEventTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // For share events, validate shareMethod
    if (eventType === 'share') {
      const validShareMethods: ShareMethod[] = [
        'qr',
        'wallet',
        'link',
        'twitter',
        'linkedin',
        'email',
      ];

      if (!shareMethod || !validShareMethods.includes(shareMethod)) {
        return NextResponse.json(
          {
            error: 'Invalid share method',
            message: `shareMethod is required for share events and must be one of: ${validShareMethods.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Get headers for tracking
    const headers = req.headers;

    // Track the appropriate event
    switch (eventType) {
      case 'card_view':
        await trackCardView(username, devcardId || null, headers);
        break;

      case 'qr_scan':
        await trackQRScan(username, devcardId || null, headers);
        break;

      case 'share':
        await trackShare(username, devcardId || null, shareMethod as ShareMethod, headers);
        break;

      case 'connection_request':
        await trackConnectionRequest(username, devcardId || null, headers);
        break;

      default:
        return NextResponse.json(
          {
            error: 'Unsupported event type',
            message: 'This event type is not yet supported',
          },
          { status: 400 }
        );
    }

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Event tracked successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Analytics tracking error:', error);

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
        error: 'Failed to track event',
        message: error.message || 'An error occurred while tracking the event',
      },
      { status: 500 }
    );
  }
}
