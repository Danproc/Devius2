/**
 * Analytics Tracking Functions
 *
 * Privacy-first analytics tracking for DevCard platform
 * Tracks card views, QR scans, shares, and connection requests
 */

import { db } from '@/db';
import { analytics_events } from '@/db/schema/analytics';
import {
  hashVisitorId,
  generateVisitorId,
  getGeoLocation,
  extractReferrerDomain,
  shouldTrackRequest,
} from './privacy';

export type EventType = 'card_view' | 'qr_scan' | 'share' | 'connection_request' | 'profile_edit';
export type ShareMethod = 'qr' | 'wallet' | 'link' | 'twitter' | 'linkedin' | 'email';

interface TrackEventParams {
  eventType: EventType;
  username: string;
  devcardId?: string | null;
  headers: Headers;
  shareMethod?: ShareMethod;
}

/**
 * Core function to track an analytics event
 *
 * @param params - Event tracking parameters
 * @returns Promise<void>
 */
async function trackEvent(params: TrackEventParams): Promise<void> {
  const { eventType, username, devcardId, headers, shareMethod } = params;

  // Check if we should track this request (filters bots, respects DNT)
  if (!shouldTrackRequest(headers)) {
    return;
  }

  try {
    // Generate and hash visitor ID
    const rawVisitorId = generateVisitorId(headers);
    const hashedVisitorId = hashVisitorId(rawVisitorId);

    // Get geographic data
    const geo = getGeoLocation(headers);

    // Get referrer
    const referrer = headers.get('referer') || headers.get('referrer');
    const referrerDomain = extractReferrerDomain(referrer);

    // Insert event into database
    await db.insert(analytics_events).values({
      event_type: eventType,
      devcard_id: devcardId || null,
      username,
      visitor_id: hashedVisitorId,
      referrer: referrerDomain,
      country: geo.country,
      share_method: shareMethod || null,
      timestamp: new Date(),
    });
  } catch (error) {
    // Log error but don't throw - analytics should never break the app
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Track a DevCard view
 *
 * @param username - Username of the DevCard being viewed
 * @param devcardId - ID of the DevCard (optional)
 * @param headers - Request headers for visitor tracking
 */
export async function trackCardView(
  username: string,
  devcardId: string | null,
  headers: Headers
): Promise<void> {
  await trackEvent({
    eventType: 'card_view',
    username,
    devcardId,
    headers,
  });
}

/**
 * Track a QR code scan
 *
 * @param username - Username of the DevCard QR code
 * @param devcardId - ID of the DevCard (optional)
 * @param headers - Request headers for visitor tracking
 */
export async function trackQRScan(
  username: string,
  devcardId: string | null,
  headers: Headers
): Promise<void> {
  await trackEvent({
    eventType: 'qr_scan',
    username,
    devcardId,
    headers,
  });
}

/**
 * Track a share action
 *
 * @param username - Username of the DevCard being shared
 * @param devcardId - ID of the DevCard (optional)
 * @param shareMethod - Method used to share (qr, wallet, link, twitter, etc.)
 * @param headers - Request headers for visitor tracking
 */
export async function trackShare(
  username: string,
  devcardId: string | null,
  shareMethod: ShareMethod,
  headers: Headers
): Promise<void> {
  await trackEvent({
    eventType: 'share',
    username,
    devcardId,
    headers,
    shareMethod,
  });
}

/**
 * Track a connection request sent
 *
 * @param username - Username of the DevCard receiving the connection request
 * @param devcardId - ID of the DevCard (optional)
 * @param headers - Request headers for visitor tracking
 */
export async function trackConnectionRequest(
  username: string,
  devcardId: string | null,
  headers: Headers
): Promise<void> {
  await trackEvent({
    eventType: 'connection_request',
    username,
    devcardId,
    headers,
  });
}

/**
 * Track a profile edit
 *
 * @param username - Username of the DevCard being edited
 * @param devcardId - ID of the DevCard
 * @param headers - Request headers for visitor tracking
 */
export async function trackProfileEdit(
  username: string,
  devcardId: string,
  headers: Headers
): Promise<void> {
  await trackEvent({
    eventType: 'profile_edit',
    username,
    devcardId,
    headers,
  });
}
