'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, Trophy, ArrowUpDown } from 'lucide-react';

interface JudgingTableProps {
  hackathonId: string;
}

export function JudgingTable({ hackathonId }: JudgingTableProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch(`/api/hackathons/${hackathonId}/judging`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [hackathonId]);

  const sortedSubmissions = data?.submissions?.sort((a: any, b: any) => {
    return sortAsc
      ? a.submission.vote_count - b.submission.vote_count
      : b.submission.vote_count - a.submission.vote_count;
  });

  if (loading) return <div className="text-devcard-text">Loading submissions...</div>;
  if (!data) return <div className="text-devcard-text">No data</div>;

  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-devcard-heading flex items-center gap-2">
            <Trophy className="h-5 w-5 text-devcard-green" />
            Submissions ({data.submissions?.length || 0})
          </CardTitle>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-2 text-sm text-devcard-text hover:text-devcard-green transition-colors px-3 py-1 border border-devcard-border rounded-md"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort by Votes: {sortAsc ? 'Low to High' : 'High to Low'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSubmissions?.map((item: any) => (
            <div
              key={item.submission.id}
              className="p-4 border border-devcard-border rounded-lg hover:border-devcard-green/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-devcard-heading">
                    {item.submission.project_title}
                  </h3>
                  <p className="text-sm text-devcard-text mt-1 line-clamp-2">
                    {item.submission.description}
                  </p>
                  {/* Tech Stack */}
                  {item.submission.tech_stack && item.submission.tech_stack.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {item.submission.tech_stack.slice(0, 5).map((tech: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="border-devcard-green/30 text-devcard-green text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {item.submission.tech_stack.length > 5 && (
                        <Badge variant="outline" className="border-devcard-border text-devcard-text text-xs">
                          +{item.submission.tech_stack.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 mt-3">
                    {item.submission.github_url && (
                      <a
                        href={item.submission.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-devcard-green hover:underline flex items-center gap-1"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {item.submission.demo_url && (
                      <a
                        href={item.submission.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-devcard-green hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Demo
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-devcard-green">
                    {item.submission.vote_count}
                  </div>
                  <div className="text-xs text-devcard-text">votes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
