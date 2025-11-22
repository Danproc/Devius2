'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Github, ExternalLink, Star, Users as UsersIcon } from 'lucide-react';

interface Submission {
  id: string;
  project_title: string;
  description: string;
  github_url: string;
  demo_url: string | null;
  vote_count: number;
  tech_stack: string[];
  status: string;
  team_id: string | null;
}

interface User {
  id: string;
  name: string | null;
  github_username: string | null;
}

interface DevCard {
  url_slug: string;
  display_name: string | null;
  github_username: string;
}

interface Team {
  name: string;
  members: Array<{ user_id: string }>;
}

interface Score {
  innovation: number;
  technical_execution: number;
  design_ux: number;
  completeness: number;
  total_score: number;
}

interface LeaderboardEntry {
  submission: Submission;
  user: User;
  devcard: DevCard | null;
  team: Team | null;
  score: Score | null;
}

interface PublicLeaderboardProps {
  entries: LeaderboardEntry[];
}

export function PublicLeaderboard({ entries }: PublicLeaderboardProps) {
  // Sort by total score (highest first)
  const sortedEntries = [...entries].sort((a, b) => {
    const aScore = a.score?.total_score || 0;
    const bScore = b.score?.total_score || 0;
    return bScore - aScore;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-500'; // Gold
    if (score >= 75) return 'text-gray-300'; // Silver
    if (score >= 60) return 'text-amber-600'; // Bronze
    return 'text-devcard-text';
  };

  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <CardTitle className="text-devcard-heading text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-devcard-green" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-devcard-border hover:bg-transparent">
              <TableHead className="text-devcard-text w-12">#</TableHead>
              <TableHead className="text-devcard-text">Project</TableHead>
              <TableHead className="text-devcard-text">Creator</TableHead>
              <TableHead className="text-devcard-text text-center">Score</TableHead>
              <TableHead className="text-devcard-text">Tech Stack</TableHead>
              <TableHead className="text-devcard-text text-right">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry, index) => {
              const score = entry.score;
              const placement = index + 1;

              // Get creator info (team or solo user)
              const creatorName = entry.team
                ? entry.team.name
                : (entry.devcard?.display_name || entry.user.name || entry.user.github_username || 'Unknown');
              const creatorLink = entry.team
                ? null
                : entry.devcard?.url_slug;
              const isTeam = !!entry.team;
              const teamSize = entry.team ? entry.team.members.length : 1;

              return (
                <TableRow
                  key={entry.submission.id}
                  className="border-devcard-border hover:bg-devcard-base/50"
                >
                  {/* Rank */}
                  <TableCell className="font-bold text-devcard-heading">
                    {placement}
                  </TableCell>

                  {/* Project */}
                  <TableCell>
                    <div>
                      <div className="font-semibold text-devcard-heading">
                        {entry.submission.project_title}
                      </div>
                      <div className="text-sm text-devcard-text line-clamp-1">
                        {entry.submission.description}
                      </div>
                    </div>
                  </TableCell>

                  {/* Creator (User or Team) */}
                  <TableCell>
                    {creatorLink ? (
                      <Link
                        href={`/${creatorLink}`}
                        className="text-devcard-heading hover:text-devcard-green transition-colors font-medium"
                      >
                        {creatorName}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {isTeam && <UsersIcon className="h-3.5 w-3.5 text-devcard-green" />}
                        <span className="font-medium text-devcard-heading">
                          {creatorName}
                        </span>
                        {isTeam && (
                          <Badge variant="outline" className="border-devcard-green/30 text-devcard-green text-xs ml-1">
                            {teamSize} members
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Score */}
                  <TableCell className="text-center">
                    {score ? (
                      <div>
                        <div className={`text-xl font-bold ${getScoreColor(score.total_score)}`}>
                          {score.total_score}
                          <span className="text-sm text-devcard-text">/100</span>
                        </div>
                        <div className="text-xs text-devcard-text/60">
                          {score.innovation + score.technical_execution + score.design_ux + score.completeness}/40
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-devcard-text/60">Not scored</span>
                    )}
                  </TableCell>

                  {/* Tech Stack */}
                  <TableCell>
                    <div className="flex gap-1 flex-wrap max-w-xs">
                      {entry.submission.tech_stack.slice(0, 3).map((tech, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-devcard-green/30 text-devcard-green text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {entry.submission.tech_stack.length > 3 && (
                        <Badge variant="outline" className="border-devcard-border text-devcard-text text-xs">
                          +{entry.submission.tech_stack.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Links */}
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <a
                          href={entry.submission.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4 text-devcard-green" />
                        </a>
                      </Button>
                      {entry.submission.demo_url && (
                        <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <a
                            href={entry.submission.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Demo"
                          >
                            <ExternalLink className="h-4 w-4 text-devcard-green" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
