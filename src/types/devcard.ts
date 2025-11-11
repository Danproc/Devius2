/**
 * DevCard V2 TypeScript Types
 *
 * Type definitions for DevCard entities, updates, and related data structures.
 */

// Theme configuration for DevCard customization
export interface Theme {
  name: string; // e.g., "default", "midnight", "ocean"
  colors?: {
    primary?: string;
    background?: string;
    text?: string;
  };
  font?: string;
}

// Social links configuration
export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  portfolio?: string;
}

// Availability status types
export type AvailabilityStatus = 'open' | 'available' | 'not-available' | 'custom';

// Full DevCard type (matches database schema)
export interface DevCard {
  id: string;
  user_id: string;

  // GitHub Integration
  github_username: string;
  github_id: number;
  github_access_token_expires: Date | null;

  // URL & Visibility
  url_slug: string;
  is_public: boolean;
  custom_domain: string | null;
  custom_domain_verified: boolean;

  // Profile Data
  display_name: string | null;
  custom_bio: string | null;
  location: string | null;
  avatar_url: string;

  // Social Links
  social_links: SocialLinks | null;

  // Featured Content
  featured_repos: string[] | null; // Array of repo full names
  tech_stack: string[] | null; // Array of technology names

  // Availability
  availability_status: AvailabilityStatus | null;
  availability_message: string | null;

  // Theme (Premium)
  theme: Theme | null;

  // Metadata
  view_count: number;
  last_github_sync: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Type for creating a new DevCard
export interface DevCardCreate {
  user_id: string;
  github_username: string;
  github_id: number;
  url_slug: string;
  avatar_url: string;
  display_name?: string;
  location?: string;
  custom_bio?: string;
}

// Type for updating an existing DevCard
export interface DevCardUpdate {
  display_name?: string;
  custom_bio?: string;
  location?: string;
  social_links?: SocialLinks;
  featured_repos?: string[];
  tech_stack?: string[];
  availability_status?: AvailabilityStatus;
  availability_message?: string;
  theme?: Theme;
  is_public?: boolean;
  custom_domain?: string;
}

// Public DevCard data (for sharing/displaying)
export interface PublicDevCard {
  id: string;
  github_username: string;
  url_slug: string;
  display_name: string | null;
  custom_bio: string | null;
  location: string | null;
  avatar_url: string;
  social_links: SocialLinks | null;
  featured_repos: string[] | null;
  tech_stack: string[] | null;
  availability_status: AvailabilityStatus | null;
  availability_message: string | null;
  theme: Theme | null;
  view_count: number;
  created_at: Date;
}

// DevCard with GitHub data combined
export interface DevCardWithGitHub extends DevCard {
  github_data?: {
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    total_stars: number;
    repositories: Array<{
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      topics: string[];
    }>;
  };
}

// Validation constraints
export const DEVCARD_VALIDATION = {
  CUSTOM_BIO_MAX_LENGTH: 500,
  FEATURED_REPOS_MAX: 6,
  TECH_STACK_MAX: 20,
  URL_SLUG_PATTERN: /^[a-z0-9-]+$/,
} as const;
