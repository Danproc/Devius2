import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">GitHub Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            GitHub statistics are being synced. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      icon: Package,
      label: 'Repositories',
      value: stats.public_repos.toLocaleString(),
      href: `https://github.com/${githubUsername}?tab=repositories`,
    },
    {
      icon: Users,
      label: 'Followers',
      value: stats.followers.toLocaleString(),
      href: `https://github.com/${githubUsername}?tab=followers`,
    },
    {
      icon: GitFork,
      label: 'Following',
      value: stats.following.toLocaleString(),
      href: `https://github.com/${githubUsername}?tab=following`,
    },
    {
      icon: Star,
      label: 'Total Stars',
      value: stats.total_stars.toLocaleString(),
      href: `https://github.com/${githubUsername}`,
    },
    {
      icon: TrendingUp,
      label: 'Contribution Streak',
      value: `${stats.contribution_streak} days`,
      href: `https://github.com/${githubUsername}`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">GitHub Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <item.icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
