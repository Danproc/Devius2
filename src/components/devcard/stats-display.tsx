import { Star, GitFork, Users, Package, TrendingUp } from 'lucide-react';

interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  contribution_streak: number;
}

interface StatsDisplayProps {
  stats: GitHubStats | null;
  githubUsername: string;
}

export function StatsDisplay({ stats, githubUsername }: StatsDisplayProps) {
  if (!stats) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">GitHub Statistics</h2>
        <p className="text-sm text-muted-foreground">
          GitHub statistics are being synced. Check back soon!
        </p>
      </div>
    );
  }

  const statItems = [
    {
      icon: Package,
      label: 'Repositories',
      value: stats.public_repos.toLocaleString(),
      href: `https://github.com/${githubUsername}?tab=repositories`,
      highlight: false,
    },
    {
      icon: Users,
      label: 'Followers',
      value: stats.followers.toLocaleString(),
      href: `https://github.com/${githubUsername}?tab=followers`,
      highlight: false,
    },
    {
      icon: GitFork,
      label: 'Following',
      value: stats.following.toLocaleString(),
      href: `https://github.com/${githubUsername}?tab=following`,
      highlight: false,
    },
    {
      icon: Star,
      label: 'Total Stars',
      value: stats.total_stars.toLocaleString(),
      href: `https://github.com/${githubUsername}`,
      highlight: true, // Highlight stars in green
    },
    {
      icon: TrendingUp,
      label: 'Contribution Streak',
      value: `${stats.contribution_streak} days`,
      href: `https://github.com/${githubUsername}`,
      highlight: true, // Highlight streak in green
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-devcard-heading">GitHub Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
              ${item.highlight
                ? 'border-devcard-green/30 bg-devcard-green/5 hover:bg-devcard-green/10 hover:border-devcard-green/50'
                : 'border-devcard-border bg-devcard-base hover:bg-white/5 hover:border-white/20'
              }
              group hover:-translate-y-0.5
            `}
          >
            <item.icon className={`size-5 transition-colors ${
              item.highlight
                ? 'text-devcard-green'
                : 'text-devcard-text group-hover:text-devcard-heading'
            }`} />
            <div className="flex flex-col items-center gap-0.5">
              <span className={`text-2xl font-bold ${
                item.highlight ? 'text-devcard-green' : 'text-devcard-heading'
              }`}>
                {item.value}
              </span>
              <span className="text-xs text-devcard-text text-center">
                {item.label}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
