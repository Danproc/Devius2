import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, GitFork, ExternalLink } from 'lucide-react';

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

interface RepoShowcaseProps {
  repositories: Repository[];
  githubUsername: string;
}

export function RepoShowcase({ repositories, githubUsername }: RepoShowcaseProps) {
  if (!repositories || repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Featured Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No featured repositories selected yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Featured Repositories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {repositories.map((repo) => (
            <a
              key={repo.full_name}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 p-4 rounded-lg border border-border hover:border-foreground/20 hover:bg-accent/50 transition-all"
            >
              {/* Repo Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {repo.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {repo.full_name}
                  </p>
                </div>
                <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
              </div>

              {/* Description */}
              {repo.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {repo.description}
                </p>
              )}

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="text-xs px-2 py-0"
                    >
                      {topic}
                    </Badge>
                  ))}
                  {repo.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{repo.topics.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats and Language */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="size-3" />
                  <span>{repo.stargazers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="size-3" />
                  <span>{repo.forks_count.toLocaleString()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-border">
          <a
            href={`https://github.com/${githubUsername}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            View all repositories on GitHub
            <ExternalLink className="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
