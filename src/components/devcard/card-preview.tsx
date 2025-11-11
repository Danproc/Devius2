import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileSection } from './profile-section';
import { StatsDisplay } from './stats-display';
import { RepoShowcase } from './repo-showcase';
import { Eye } from 'lucide-react';

interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  contribution_streak: number;
}

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
  } | null;
  githubStats: GitHubStats | null;
  techStack?: string[] | null;
  featuredRepos?: Repository[];
  viewCount?: number;
  theme?: {
    name: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
    };
    font?: string;
  } | null;
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
  viewCount,
  theme,
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
      className="w-full max-w-4xl mx-auto"
      style={{ ...themeStyles, ...themeFontFamily } as React.CSSProperties}
    >
      {/* Main Card Container */}
      <Card className="overflow-hidden glass-card border-white/10 shadow-2xl devcard-card-hover">
        <div className="p-6 md:p-8 space-y-8">
          {/* Profile Section */}
          <ProfileSection
            displayName={displayName}
            githubUsername={githubUsername}
            avatarUrl={avatarUrl}
            customBio={customBio}
            location={location}
            availabilityStatus={availabilityStatus}
            availabilityMessage={availabilityMessage}
            socialLinks={socialLinks}
          />

          {/* Tech Stack */}
          {techStack && techStack.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Statistics */}
          <StatsDisplay stats={githubStats} githubUsername={githubUsername} />

          {/* Featured Repositories */}
          {featuredRepos && featuredRepos.length > 0 && (
            <RepoShowcase
              repositories={featuredRepos}
              githubUsername={githubUsername}
            />
          )}

          {/* View Count Footer */}
          {viewCount !== undefined && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t border-white/10">
              <Eye className="size-4" />
              <span>
                {viewCount.toLocaleString()}{' '}
                {viewCount === 1 ? 'view' : 'views'}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Powered By Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by{' '}
          <a
            href="/"
            className="font-medium text-devcard-green hover:brightness-110 transition-all"
          >
            Devius
          </a>
        </p>
      </div>
    </div>
  );
}
