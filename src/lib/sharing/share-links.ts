/**
 * Share Links Generator for DevCard
 *
 * Generates sharing URLs for various social media platforms and communication channels.
 * Supports Twitter, LinkedIn, email, WhatsApp, Telegram, and more.
 */

/**
 * Supported sharing platforms
 */
export type SharePlatform =
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'email'
  | 'whatsapp'
  | 'telegram'
  | 'reddit'
  | 'hackernews'
  | 'copy';

/**
 * DevCard sharing metadata
 */
export interface ShareMetadata {
  username: string;
  display_name: string;
  custom_bio?: string;
  url?: string; // Custom URL (defaults to generated DevCard URL)
}

/**
 * Share link generation result
 */
export interface ShareLink {
  platform: SharePlatform;
  url: string;
  label: string;
  icon?: string; // Icon name (for UI rendering)
}

/**
 * Get the full DevCard URL for a username
 *
 * @param username - DevCard username
 * @param custom_url - Optional custom URL override
 * @returns Full DevCard URL
 */
function getDevCardURL(username: string, custom_url?: string): string {
  if (custom_url) {
    return custom_url;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devius.io';
  return `${baseUrl}/${username}`;
}

/**
 * URL encode a string for safe use in query parameters
 */
function encodeParam(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Generate Twitter/X share URL
 *
 * @param metadata - Share metadata
 * @returns Twitter share URL
 *
 * @example
 * ```ts
 * const url = generateTwitterShare({
 *   username: 'danproctor',
 *   display_name: 'Dan Proctor',
 *   custom_bio: 'Full-stack developer'
 * });
 * // "https://twitter.com/intent/tweet?text=Check%20out%20Dan%20Proctor's%20DevCard&url=..."
 * ```
 */
export function generateTwitterShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);
  const text = metadata.custom_bio
    ? `Check out ${metadata.display_name}'s DevCard - ${metadata.custom_bio}`
    : `Check out ${metadata.display_name}'s DevCard on Devius`;

  return `https://twitter.com/intent/tweet?text=${encodeParam(text)}&url=${encodeParam(url)}`;
}

/**
 * Generate LinkedIn share URL
 *
 * @param metadata - Share metadata
 * @returns LinkedIn share URL
 */
export function generateLinkedInShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);

  // LinkedIn only accepts the URL parameter
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeParam(url)}`;
}

/**
 * Generate Facebook share URL
 *
 * @param metadata - Share metadata
 * @returns Facebook share URL
 */
export function generateFacebookShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);

  return `https://www.facebook.com/sharer/sharer.php?u=${encodeParam(url)}`;
}

/**
 * Generate Email share URL (mailto link)
 *
 * @param metadata - Share metadata
 * @returns Email mailto URL
 */
export function generateEmailShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);
  const subject = `Check out ${metadata.display_name}'s DevCard`;
  const body = metadata.custom_bio
    ? `I wanted to share ${metadata.display_name}'s developer profile with you:\n\n${metadata.custom_bio}\n\nView their DevCard: ${url}`
    : `I wanted to share ${metadata.display_name}'s developer profile with you:\n\nView their DevCard: ${url}`;

  return `mailto:?subject=${encodeParam(subject)}&body=${encodeParam(body)}`;
}

/**
 * Generate WhatsApp share URL
 *
 * @param metadata - Share metadata
 * @returns WhatsApp share URL
 */
export function generateWhatsAppShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);
  const text = metadata.custom_bio
    ? `Check out ${metadata.display_name}'s DevCard - ${metadata.custom_bio}\n${url}`
    : `Check out ${metadata.display_name}'s DevCard\n${url}`;

  return `https://wa.me/?text=${encodeParam(text)}`;
}

/**
 * Generate Telegram share URL
 *
 * @param metadata - Share metadata
 * @returns Telegram share URL
 */
export function generateTelegramShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);
  const text = metadata.custom_bio
    ? `Check out ${metadata.display_name}'s DevCard - ${metadata.custom_bio}`
    : `Check out ${metadata.display_name}'s DevCard`;

  return `https://t.me/share/url?url=${encodeParam(url)}&text=${encodeParam(text)}`;
}

/**
 * Generate Reddit share URL
 *
 * @param metadata - Share metadata
 * @returns Reddit share URL
 */
export function generateRedditShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);
  const title = `${metadata.display_name}'s DevCard`;

  return `https://reddit.com/submit?url=${encodeParam(url)}&title=${encodeParam(title)}`;
}

/**
 * Generate Hacker News share URL
 *
 * @param metadata - Share metadata
 * @returns Hacker News share URL
 */
export function generateHackerNewsShare(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);
  const title = `${metadata.display_name}'s DevCard on Devius`;

  return `https://news.ycombinator.com/submitlink?u=${encodeParam(url)}&t=${encodeParam(title)}`;
}

/**
 * Generate all share links for a DevCard
 *
 * @param metadata - Share metadata
 * @param platforms - Optional array of specific platforms to generate
 * @returns Array of share links
 *
 * @example
 * ```ts
 * const links = generateAllShareLinks({
 *   username: 'danproctor',
 *   display_name: 'Dan Proctor'
 * });
 * // Returns array of ShareLink objects for all platforms
 * ```
 */
export function generateAllShareLinks(
  metadata: ShareMetadata,
  platforms?: SharePlatform[]
): ShareLink[] {
  const generators: Record<SharePlatform, () => string> = {
    twitter: () => generateTwitterShare(metadata),
    linkedin: () => generateLinkedInShare(metadata),
    facebook: () => generateFacebookShare(metadata),
    email: () => generateEmailShare(metadata),
    whatsapp: () => generateWhatsAppShare(metadata),
    telegram: () => generateTelegramShare(metadata),
    reddit: () => generateRedditShare(metadata),
    hackernews: () => generateHackerNewsShare(metadata),
    copy: () => getDevCardURL(metadata.username, metadata.url),
  };

  const labels: Record<SharePlatform, string> = {
    twitter: 'Share on Twitter',
    linkedin: 'Share on LinkedIn',
    facebook: 'Share on Facebook',
    email: 'Share via Email',
    whatsapp: 'Share on WhatsApp',
    telegram: 'Share on Telegram',
    reddit: 'Share on Reddit',
    hackernews: 'Share on Hacker News',
    copy: 'Copy Link',
  };

  const icons: Record<SharePlatform, string> = {
    twitter: 'Twitter',
    linkedin: 'Linkedin',
    facebook: 'Facebook',
    email: 'Mail',
    whatsapp: 'MessageCircle',
    telegram: 'Send',
    reddit: 'MessageSquare',
    hackernews: 'Newspaper',
    copy: 'Copy',
  };

  const selectedPlatforms = platforms || (Object.keys(generators) as SharePlatform[]);

  return selectedPlatforms.map((platform) => ({
    platform,
    url: generators[platform](),
    label: labels[platform],
    icon: icons[platform],
  }));
}

/**
 * Generate share link for a specific platform
 *
 * @param platform - Social media platform
 * @param metadata - Share metadata
 * @returns Share link object
 */
export function generateShareLink(platform: SharePlatform, metadata: ShareMetadata): ShareLink {
  const links = generateAllShareLinks(metadata, [platform]);
  return links[0];
}

/**
 * Get default sharing platforms for the share modal
 *
 * @returns Array of default platform names
 */
export function getDefaultSharePlatforms(): SharePlatform[] {
  return ['twitter', 'linkedin', 'email', 'whatsapp', 'copy'];
}

/**
 * Get all available sharing platforms
 *
 * @returns Array of all platform names
 */
export function getAllSharePlatforms(): SharePlatform[] {
  return [
    'twitter',
    'linkedin',
    'facebook',
    'email',
    'whatsapp',
    'telegram',
    'reddit',
    'hackernews',
    'copy',
  ];
}

/**
 * Generate Open Graph meta tags for DevCard sharing
 *
 * @param metadata - Share metadata
 * @param imageUrl - Optional OG image URL
 * @returns Object with OG meta tags
 */
export function generateOpenGraphTags(
  metadata: ShareMetadata,
  imageUrl?: string
): Record<string, string> {
  const url = getDevCardURL(metadata.username, metadata.url);
  const title = `${metadata.display_name}'s DevCard`;
  const description =
    metadata.custom_bio || `Check out ${metadata.display_name}'s developer profile on Devius`;

  return {
    'og:type': 'profile',
    'og:url': url,
    'og:title': title,
    'og:description': description,
    'og:site_name': 'Devius',
    ...(imageUrl && { 'og:image': imageUrl }),

    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:url': url,
    'twitter:title': title,
    'twitter:description': description,
    ...(imageUrl && { 'twitter:image': imageUrl }),
  };
}

/**
 * Generate tracking parameters for share URLs (for analytics)
 *
 * @param platform - Sharing platform
 * @param source - Traffic source identifier
 * @returns URL query parameters string
 */
export function generateTrackingParams(platform: SharePlatform, source: string = 'share'): string {
  return `utm_source=${encodeParam(platform)}&utm_medium=${encodeParam(source)}&utm_campaign=devcard_share`;
}

/**
 * Add tracking parameters to a URL
 *
 * @param url - Base URL
 * @param platform - Sharing platform
 * @returns URL with tracking parameters
 */
export function addTrackingToURL(url: string, platform: SharePlatform): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${generateTrackingParams(platform)}`;
}

/**
 * Generate shareable text for clipboard copying
 *
 * @param metadata - Share metadata
 * @returns Formatted text for clipboard
 */
export function generateClipboardText(metadata: ShareMetadata): string {
  const url = getDevCardURL(metadata.username, metadata.url);

  if (metadata.custom_bio) {
    return `${metadata.display_name}'s DevCard - ${metadata.custom_bio}\n\n${url}`;
  }

  return `Check out ${metadata.display_name}'s DevCard on Devius\n\n${url}`;
}
