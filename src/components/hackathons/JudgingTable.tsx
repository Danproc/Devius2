'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, Trophy } from 'lucide-react';

interface JudgingTableProps {
  hackathonId: string;
}

export function JudgingTable({ hackathonId }: JudgingTableProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hackathons/${hackathonId}/judging`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [hackathonId]);

  if (loading) return <div className="text-devcard-text">Loading submissions...</div>;
  if (!data) return <div className="text-devcard-text">No data</div>;

  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <CardTitle className="text-devcard-heading flex items-center gap-2">
          <Trophy className="h-5 w-5 text-devcard-green" />
          Submissions ({data.submissions?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.submissions?.map((item: any) => (
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
