/**
 * GitHub API TypeScript Types
 *
 * Type definitions for GitHub API responses and related data structures.
 */

// GitHub user profile data
export interface GitHubProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// GitHub repository data
export interface GitHubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
    node_id: string;
  } | null;
  allow_forking: boolean;
  is_template: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
}

// Simplified repository data for DevCard display
export interface GitHubRepoSimplified {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

// GitHub contribution statistics
export interface GitHubStats {
  total_stars: number; // Sum of stars across all repos
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  contribution_streak: number; // Current streak in days
  contributions?: {
    last_year_total: number;
    current_streak: number;
    longest_streak: number;
  };
}

/**
 * Extended GitHub Stats with Additional Metrics
 * Includes organizations, most starred repo, and language breakdown
 */
export interface GitHubStatsExtended extends GitHubStats {
  organizations?: string[];
  most_starred_repo?: {
    name: string;
    full_name: string;
    stars: number;
    url: string;
    description: string | null;
    language: string | null;
  };
  top_languages?: Array<{
    name: string;
    count: number;
    stars: number;
    percentage: number;
    color?: string;
  }>;
}

// Contribution activity data
export interface GitHubContributions {
  last_year_total: number;
  current_streak: number;
  longest_streak: number;
  weeks?: Array<{
    w: number; // Week start timestamp
    a: number; // Additions
    d: number; // Deletions
    c: number; // Commits
  }>;
}

// GitHub API rate limit response
export interface GitHubRateLimit {
  resources: {
    core: {
      limit: number;
      used: number;
      remaining: number;
      reset: number; // Unix timestamp
    };
    search: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
    graphql: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
  };
  rate: {
    limit: number;
    used: number;
    remaining: number;
    reset: number;
  };
}

// GitHub OAuth token response
export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

// GitHub user data combined with stats
export interface GitHubUserData {
  profile: GitHubProfile;
  repositories: GitHubRepoSimplified[];
  stats: GitHubStats;
  contributions?: GitHubContributions;
  organizations?: string[];
  most_starred_repo?: {
    name: string;
    full_name: string;
    stars: number;
    url: string;
    description: string | null;
    language: string | null;
  };
  top_languages?: Array<{
    name: string;
    count: number;
    stars: number;
    percentage: number;
    color?: string;
  }>;
}

// GitHub cache entry
export interface GitHubCacheEntry {
  id: string;
  devcard_id: string;
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  total_stars: number;
  contribution_streak: number;
  repositories: GitHubRepoSimplified[];
  contributions: GitHubContributions | null;
  cached_at: Date;
  expires_at: Date;
}

// GitHub API error response
export interface GitHubAPIError {
  message: string;
  documentation_url?: string;
  status?: number;
}

// Required OAuth scopes for DevCard
export const GITHUB_REQUIRED_SCOPES = [
  'read:user',
  'user:email',
  'public_repo',
] as const;

export type GitHubScope = typeof GITHUB_REQUIRED_SCOPES[number];
