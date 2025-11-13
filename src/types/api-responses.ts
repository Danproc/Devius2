/**
 * API Response Type Definitions
 *
 * Single source of truth for API response interfaces.
 * Used by dashboard, edit page, and public profile pages.
 *
 * IMPORTANT: When adding new fields to the DevCard API response,
 * update this file ONCE and all pages will automatically sync.
 */

import { Theme, SocialLinks, AvailabilityStatus } from './devcard';
import { GitHubStatsExtended } from './github';
import { CustomProject } from './projects';

/**
 * DevCard API Response
 *
 * Returned by:
 * - GET /api/cards/me (dashboard & edit pages)
 * - GET /api/cards/[username] (public profiles)
 * - PATCH /api/cards/me (after updates)
 *
 * This interface represents the complete DevCard data structure
 * as returned by the API, with all fields serialized to JSON-compatible types.
 */
export interface DevCardApiResponse {
  // Identity
  id: string;
  user_id: string;
  url_slug: string;
  is_public: boolean;

  // Profile Information
  display_name: string | null;
  custom_bio: string | null;
  location: string | null;
  avatar_url: string;
  github_username: string;

  // GitHub Stats (Extended with organizations, most starred repo, languages)
  github_stats: GitHubStatsExtended | null;

  // Social Links
  social_links: SocialLinks | null;

  // Content
  featured_repos: string[] | null;
  custom_projects: CustomProject[] | null;
  tech_stack: string[] | null;

  // Availability
  availability_status: AvailabilityStatus;
  availability_message: string | null;

  // Customization
  theme: Theme | null;

  // Metadata
  member_number: number; // Sequential user number (#1, #2, #3, etc.)
  view_count: number;
  created_at: string; // ISO date string (serialized from Date)
  updated_at: string; // ISO date string (serialized from Date)
}

/**
 * Type alias for backward compatibility
 * Use DevCardApiResponse in new code
 */
export type DevCardData = DevCardApiResponse;
