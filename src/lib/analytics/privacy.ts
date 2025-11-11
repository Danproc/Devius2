/**
 * Analytics Privacy Utilities
 *
 * Implements privacy-first analytics with hashed visitor IDs
 * to comply with GDPR and privacy regulations.
 */

import crypto from 'crypto';

/**
 * Hash a visitor ID using SHA-256 with a salt
 *
 * @param visitorId - Raw visitor ID (IP address, user agent, or session ID)
 * @returns Hashed visitor ID for privacy-preserving analytics
 */
export function hashVisitorId(visitorId: string): string {
  const salt = process.env.ANALYTICS_SALT || 'devcard-analytics-default-salt';

  if (!process.env.ANALYTICS_SALT) {
    console.warn('ANALYTICS_SALT not set in environment variables. Using default salt (not recommended for production).');
  }

  // Create SHA-256 hash with salt
  const hash = crypto
    .createHash('sha256')
    .update(`${salt}:${visitorId}`)
    .digest('hex');

  return hash;
}

/**
 * Generate a visitor ID from request headers
 *
 * Uses IP address and user agent to create a semi-unique visitor identifier
 * that respects privacy while allowing basic analytics.
 *
 * @param headers - Request headers object
 * @returns Raw visitor ID string
 */
export function generateVisitorId(headers: Headers): string {
  // Get IP address from various headers (prioritize X-Forwarded-For for proxied requests)
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

  // Get user agent
  const userAgent = headers.get('user-agent') || 'unknown';

  // Combine for visitor ID
  return `${ip}:${userAgent}`;
}

/**
 * Get geographic location from request headers
 *
 * Uses Vercel's geo headers or falls back to unknown
 *
 * @param headers - Request headers object
 * @returns Object with country, city, region
 */
export function getGeoLocation(headers: Headers): {
  country: string | null;
  city: string | null;
  region: string | null;
} {
  // Vercel provides geo headers automatically
  const country = headers.get('x-vercel-ip-country');
  const city = headers.get('x-vercel-ip-city');
  const region = headers.get('x-vercel-ip-country-region');

  return {
    country: country || null,
    city: city || null,
    region: region || null,
  };
}

/**
 * Extract referrer domain from full URL
 *
 * @param referrer - Full referrer URL
 * @returns Domain only (e.g., "github.com") or null
 */
export function extractReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Determine if the request should be tracked
 *
 * Excludes bots, crawlers, and internal traffic
 *
 * @param headers - Request headers object
 * @returns true if should track, false otherwise
 */
export function shouldTrackRequest(headers: Headers): boolean {
  const userAgent = headers.get('user-agent')?.toLowerCase() || '';

  // Bot detection patterns
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
    'googlebot',
    'bingbot',
    'slackbot',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
  ];

  // Check if user agent matches bot patterns
  const isBot = botPatterns.some(pattern => userAgent.includes(pattern));

  if (isBot) {
    return false;
  }

  // Check for Do Not Track header
  const dnt = headers.get('dnt');
  if (dnt === '1') {
    return false;
  }

  return true;
}
