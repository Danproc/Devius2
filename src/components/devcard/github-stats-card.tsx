'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Users,
  UserPlus,
  Flame,
  Activity,
  Building2,
  FileCode,
  GitFork,
  Code2,
  ExternalLink,
  Trophy,
} from 'lucide-react';

interface ComprehensiveGitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  contribution_streak: number;
  public_gists?: number;
  contributions?: {
    last_year_total?: number;
    current_streak?: number;
    longest_streak?: number;
  };
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

interface GitHubStatsCardProps {
  stats: ComprehensiveGitHubStats;
  githubUsername: string;
}

export function GitHubStatsCard({ stats, githubUsername }: GitHubStatsCardProps) {
  if (!stats) return null;

  const QuickStat = ({
    icon: Icon,
    value,
    label,
    highlight = false,
  }: {
    icon: any;
    value: number | string;
    label: string;
    highlight?: boolean;
  }) => (
    <div className="flex items-center gap-2">
      <Icon
        className={`h-4 w-4 ${highlight ? 'text-devcard-green' : 'text-devcard-text'}`}
      />
      <span
        className={`font-semibold ${
          highlight ? 'text-devcard-green' : 'text-devcard-heading'
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="text-xs text-devcard-text">{label}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <QuickStat icon={Code2} value={stats.public_repos} label="repos" />
        <QuickStat icon={Star} value={stats.total_stars} label="stars" highlight />
        <QuickStat icon={Users} value={stats.followers} label="followers" />
        <QuickStat icon={UserPlus} value={stats.following} label="following" />
      </div>

      {/* Activity & Secondary Stats */}
      {(stats.contributions || stats.organizations || stats.public_gists !== undefined) && (
        <>
          <Separator className="bg-devcard-border" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {stats.contributions?.current_streak !== undefined && stats.contributions.current_streak > 0 && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-orange-500">
                  {stats.contributions.current_streak}
                </span>
                <span className="text-xs text-devcard-text">day streak</span>
              </div>
            )}
            {stats.contributions?.longest_streak !== undefined && stats.contributions.longest_streak > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-yellow-600">
                  {stats.contributions.longest_streak}
                </span>
                <span className="text-xs text-devcard-text">best streak</span>
              </div>
            )}
            {stats.contributions?.last_year_total !== undefined && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-devcard-text" />
                <span className="font-semibold text-devcard-heading">
                  {stats.contributions.last_year_total.toLocaleString()}
                </span>
                <span className="text-xs text-devcard-text">contributions</span>
              </div>
            )}
            {stats.organizations && stats.organizations.length > 0 && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-devcard-text" />
                <span className="font-semibold text-devcard-heading">
                  {stats.organizations.length}
                </span>
                <span className="text-xs text-devcard-text">orgs</span>
              </div>
            )}
            {stats.public_gists !== undefined && stats.public_gists > 0 && (
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-devcard-text" />
                <span className="font-semibold text-devcard-heading">
                  {stats.public_gists}
                </span>
                <span className="text-xs text-devcard-text">gists</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Most Starred Repo - Compact Card */}
      {stats.most_starred_repo && stats.most_starred_repo.stars > 0 && (
        <>
          <Separator className="bg-devcard-border" />
          <div className="flex items-start gap-3 p-3 rounded-lg bg-devcard-border/30 border border-devcard-border hover:border-devcard-green/50 transition-all group">
            <GitFork className="h-4 w-4 text-devcard-text mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-devcard-heading truncate">
                  {stats.most_starred_repo.name}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20 flex-shrink-0"
                >
                  <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                  {stats.most_starred_repo.stars.toLocaleString()}
                </Badge>
              </div>
              {stats.most_starred_repo.description && (
                <p className="text-xs text-devcard-text line-clamp-1">
                  {stats.most_starred_repo.description}
                </p>
              )}
            </div>
            <a
              href={stats.most_starred_repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-devcard-text hover:text-devcard-green transition-colors flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </>
      )}

      {/* Top Languages - Compact Horizontal Bars */}
      {stats.top_languages && stats.top_languages.length > 0 && (
        <>
          <Separator className="bg-devcard-border" />
          <div className="space-y-2">
            {stats.top_languages.slice(0, 3).map((lang, index) => {
              // Handle both 'name' and 'language' fields for backwards compatibility
              const langName = (lang as any).name || (lang as any).language || 'Unknown';
              const langColor = lang.color || '#808080';

              return (
                <div key={`lang-${langName}-${index}`} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: langColor }}
                    />
                    <span className="text-xs font-medium text-devcard-heading truncate">
                      {langName}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-devcard-border/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(lang.percentage, 100)}%`,
                          backgroundColor: langColor,
                        }}
                      />
                    </div>
                    <span className="text-xs text-devcard-text w-12 text-right flex-shrink-0">
                      {lang.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
