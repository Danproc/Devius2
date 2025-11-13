'use client';

import { CardPreview } from './card-preview';
import { CustomProject } from '@/types/projects';
import { GitHubStatsExtended } from '@/types/github';

/**
 * Standard props interface for DevCard data
 * Use this to ensure consistency across all preview usages
 */
export interface DevCardData {
  display_name: string | null;
  github_username: string;
  avatar_url: string;
  custom_bio?: string | null;
  location?: string | null;
  availability_status?: 'open' | 'available' | 'not-available' | 'custom' | null;
  availability_message?: string | null;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
    instagram?: string;
  } | null;
  github_stats?: GitHubStatsExtended | null;
  tech_stack?: string[] | null;
  custom_projects?: CustomProject[] | null;
  view_count?: number;
  theme?: {
    name: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  } | null;
  user_id?: string;
}

interface DevCardPreviewWrapperProps {
  devcard: DevCardData;
  featuredRepos?: any[];
  connections?: {
    count: number;
    developers: Array<{
      username: string;
      avatarUrl: string;
      url_slug: string;
    }>;
  };
  ranking?: number;
  isPremium?: boolean;
}

/**
 * Wrapper component that standardizes CardPreview usage
 * Use this instead of CardPreview directly to ensure consistent prop passing
 */
export function DevCardPreviewWrapper({
  devcard,
  featuredRepos = [],
  connections,
  ranking,
  isPremium = false,
}: DevCardPreviewWrapperProps) {
  return (
    <CardPreview
      displayName={devcard.display_name}
      githubUsername={devcard.github_username}
      avatarUrl={devcard.avatar_url}
      customBio={devcard.custom_bio}
      location={devcard.location}
      availabilityStatus={devcard.availability_status}
      availabilityMessage={devcard.availability_message}
      socialLinks={devcard.social_links}
      githubStats={devcard.github_stats}
      techStack={devcard.tech_stack as string[] | null}
      featuredRepos={featuredRepos}
      customProjects={devcard.custom_projects}
      viewCount={devcard.view_count}
      theme={devcard.theme}
      connections={connections}
      ranking={ranking}
      isPremium={isPremium}
      targetUserId={devcard.user_id}
      targetUsername={devcard.display_name || devcard.github_username}
    />
  );
}
