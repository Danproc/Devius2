'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileSection } from './profile-section';
import { StatsDisplay } from './stats-display';
import { GitHubStatsCard } from './github-stats-card';
import { RepoShowcase } from './repo-showcase';
import { ConnectedDevelopers } from './connected-developers';
import { TopLanguages } from './top-languages';
import { ProjectShowcase } from './project-showcase';
import { Eye, Trophy, Award } from 'lucide-react';
import { CustomProject } from '@/types/projects';
import { GitHubStatsExtended } from '@/types/github';
import { BadgeCard } from '@/components/hackathons/BadgeCard';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';

// Language colors mapping
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  PHP: '#777bb4',
  Python: '#3776ab',
  Shell: '#89e051',
  'C++': '#00599c',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
};

// Calculate language statistics from repositories
function calculateLanguages(repos?: Repository[]) {
  if (!repos || repos.length === 0) return undefined;

  const langCounts: Record<string, number> = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });

  const total = Object.values(langCounts).reduce((a, b) => a + b, 0);

  return Object.entries(langCounts)
    .map(([name, count]) => ({
      name,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
      color: LANGUAGE_COLORS[name] || '#808080'
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
}

// Using GitHubStatsExtended from shared types instead of duplicate interface

interface Repository {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
}

interface CardPreviewProps {
  displayName: string | null;
  githubUsername: string;
  avatarUrl: string;
  customBio?: string | null;
  location?: string | null;
  availabilityStatus?: 'open' | 'available' | 'not-available' | 'custom' | null;
  availabilityMessage?: string | null;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
    instagram?: string;
  } | null;
  githubStats: GitHubStatsExtended | null;
  techStack?: string[] | null;
  featuredRepos?: Repository[];
  customProjects?: CustomProject[] | null;
  viewCount?: number;
  ranking?: number;
  isPremium?: boolean;
  theme?: {
    name: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  } | null;
  connections?: {
    count: number;
    developers: Array<{
      username: string;
      avatarUrl: string;
      url_slug: string;
    }>;
  };
  targetUserId?: string;
  targetUsername?: string;
  hackathonBadges?: {
    badges: Array<{
      badge: any;
      hackathon: any;
    }>;
    stats: {
      total: number;
      first: number;
      second: number;
      third: number;
    };
  };
  achievements?: Array<{
    id: string;
    achievement_type: string;
    earned_at: Date | string;
    is_displayed: boolean;
    metadata?: string | null;
  }>;
}

export function CardPreview({
  displayName,
  githubUsername,
  avatarUrl,
  customBio,
  location,
  availabilityStatus,
  availabilityMessage,
  socialLinks,
  githubStats,
  techStack,
  featuredRepos = [],
  customProjects,
  viewCount,
  ranking,
  isPremium = false,
  theme,
  connections,
  targetUserId,
  targetUsername,
  hackathonBadges,
  achievements,
}: CardPreviewProps) {
  // Apply theme colors if provided
  const themeStyles = theme?.colors
    ? {
        '--theme-primary': theme.colors.primary,
        '--theme-background': theme.colors.background,
        '--theme-text': theme.colors.text,
      }
    : {};

  const themeFontFamily = theme?.font ? { fontFamily: theme.font } : {};

  return (
    <div
      className="w-full max-w-2xl mx-auto space-y-6"
      style={{ ...themeStyles, ...themeFontFamily } as React.CSSProperties}
    >
      {/* CARD 1: Profile/Connect Card */}
      <Card className="overflow-hidden bg-devcard-base border border-devcard-border rounded-3xl">
        <div className="p-8">
          {/* Profile Section - with avatar, name, bio, location, social links, and connect button */}
          <ProfileSection
            displayName={displayName}
            githubUsername={githubUsername}
            avatarUrl={avatarUrl}
            customBio={customBio}
            location={location}
            availabilityStatus={availabilityStatus}
            availabilityMessage={availabilityMessage}
            socialLinks={socialLinks}
            techStack={techStack}
            ranking={ranking}
            isPremium={isPremium}
            targetUserId={targetUserId}
            targetUsername={targetUsername}
          />

          {/* Connected Developers */}
          <div className="mt-8">
            <ConnectedDevelopers
              count={connections?.count}
              developers={connections?.developers}
            />
          </div>
        </div>
      </Card>

      {/* CARD 2: GitHub Stats Card */}
      <Card className="overflow-hidden bg-devcard-base border border-devcard-border rounded-3xl">
        <div className="p-8">
          {/* GitHub Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-devcard-heading" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-devcard-heading">@{githubUsername}</span>
            </div>
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-devcard-green text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-devcard-green/90 transition-colors"
            >
              GitHub Profile
            </a>
          </div>

          {/* Comprehensive GitHub Stats */}
          {githubStats && (
            <GitHubStatsCard stats={githubStats as any} githubUsername={githubUsername} />
          )}
        </div>
      </Card>

      {/* SECTION HEADING for Custom Projects - Only show if user has added projects */}
      {customProjects && customProjects.length > 0 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-medium text-devcard-heading">Projects</h2>
            <p className="text-sm text-devcard-text">Featured Work</p>
          </div>

          {/* Project Cards */}
          <ProjectShowcase projects={customProjects} />
        </>
      )}

      {/* User Achievements */}
      {achievements && achievements.filter(a => a.is_displayed).length > 0 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-medium text-devcard-heading flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-devcard-green" />
              Achievements
            </h2>
            <p className="text-sm text-devcard-text">
              {achievements.filter(a => a.is_displayed).length} {achievements.filter(a => a.is_displayed).length === 1 ? 'Badge' : 'Badges'} Earned
            </p>
          </div>

          {/* Achievement Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements
              .filter(a => a.is_displayed)
              .map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement as any}
                  size="md"
                />
              ))}
          </div>
        </>
      )}

      {/* Hackathon Achievements */}
      {hackathonBadges && hackathonBadges.badges.length > 0 && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-medium text-devcard-heading flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-devcard-green" />
              Hackathon Wins
            </h2>
            <p className="text-sm text-devcard-text">
              {hackathonBadges.stats.total} {hackathonBadges.stats.total === 1 ? 'Win' : 'Wins'} •
              {hackathonBadges.stats.first > 0 && ` 🥇${hackathonBadges.stats.first}`}
              {hackathonBadges.stats.second > 0 && ` 🥈${hackathonBadges.stats.second}`}
              {hackathonBadges.stats.third > 0 && ` 🥉${hackathonBadges.stats.third}`}
            </p>
          </div>

          {/* Badge Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hackathonBadges.badges.map((item) => (
              <BadgeCard
                key={item.badge.id}
                badge={item.badge}
                hackathon={item.hackathon}
              />
            ))}
          </div>
        </>
      )}

      {/* Powered By Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-devcard-text">
          Powered by{' '}
          <a
            href="/"
            className="font-medium text-devcard-green hover:brightness-110 transition-all"
          >
            StackPass
          </a>
        </p>
      </div>
    </div>
  );
}
