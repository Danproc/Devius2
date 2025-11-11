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

// Language color mapping (GitHub's colors)
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
};

export function RepoShowcase({ repositories, githubUsername }: RepoShowcaseProps) {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Featured Repositories</h2>
        <p className="text-sm text-muted-foreground">
          No featured repositories selected yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Featured Repositories</h2>
        <a
          href={`https://github.com/${githubUsername}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-devcard-green hover:brightness-110 transition-all inline-flex items-center gap-1"
        >
          View all
          <ExternalLink className="size-3" />
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {repositories.map((repo) => (
          <a
            key={repo.full_name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 p-5 rounded-xl border border-white/10 bg-white/5 hover:border-devcard-green/50 hover:bg-white/10 hover:shadow-lg hover:shadow-devcard-green/10 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Repo Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate text-foreground group-hover:text-devcard-green transition-colors">
                  {repo.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {repo.full_name}
                </p>
              </div>
              <ExternalLink className="size-4 text-muted-foreground group-hover:text-devcard-green shrink-0 transition-colors" />
            </div>

            {/* Description */}
            {repo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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
                    className="text-xs px-2 py-0.5 bg-devcard-green/10 text-devcard-green border-devcard-green/20"
                  >
                    {topic}
                  </Badge>
                ))}
                {repo.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-white/20">
                    +{repo.topics.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats and Language */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {repo.language && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: languageColors[repo.language] || '#00FF88',
                    }}
                  />
                  <span className="font-medium">{repo.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-current" />
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
    </div>
  );
}
