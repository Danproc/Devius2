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
    return null;
  }

  return (
    <>
      {repositories.map((repo) => (
        <div
          key={repo.full_name}
          className="bg-devcard-base border border-devcard-border rounded-3xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-medium text-devcard-heading">
                {repo.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-devcard-text mt-1">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: languageColors[repo.language] || '#00FF88',
                      }}
                    />
                    <span>{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-current" />
                  <span>{repo.stargazers_count}</span>
                </div>
              </div>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-devcard-green text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-devcard-green/90 transition-colors"
            >
              Visit Repo
            </a>
          </div>

          <p className="text-devcard-text leading-relaxed mb-6">
            {repo.description || 'No description available'}
          </p>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-devcard-green text-black py-3 rounded-full font-medium text-center hover:bg-devcard-green/90 transition-colors"
          >
            View Project
          </a>
        </div>
      ))}
    </>
  );
}
