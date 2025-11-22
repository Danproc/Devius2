'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, Trophy, ArrowUpDown, Star } from 'lucide-react';
import { ScoringModal } from './ScoringModal';

interface JudgingTableProps {
  hackathonId: string;
}

export function JudgingTable({ hackathonId }: JudgingTableProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'votes' | 'score'>('votes');
  const [sortAsc, setSortAsc] = useState(false);
  const [scoringSubmission, setScoringSubmission] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, [hackathonId]);

  const loadData = () => {
    fetch(`/api/hackathons/${hackathonId}/judging`)
      .then(res => res.json())
      .then(async (judgeData) => {
        setData(judgeData);

        // Fetch scores for all submissions
        if (judgeData.submissions) {
          const scorePromises = judgeData.submissions.map((item: any) =>
            fetch(`/api/hackathons/submissions/${item.submission.id}/score`)
              .then(res => res.json())
              .then(data => ({ id: item.submission.id, score: data.score }))
          );

          const scoreResults = await Promise.all(scorePromises);
          const scoresMap: Record<string, any> = {};
          scoreResults.forEach(result => {
            if (result.score) {
              scoresMap[result.id] = result.score;
            }
          });
          setScores(scoresMap);
        }
      })
      .finally(() => setLoading(false));
  };

  const sortedSubmissions = data?.submissions?.sort((a: any, b: any) => {
    if (sortBy === 'votes') {
      return sortAsc
        ? a.submission.vote_count - b.submission.vote_count
        : b.submission.vote_count - a.submission.vote_count;
    } else {
      const aScore = scores[a.submission.id]?.total_score || 0;
      const bScore = scores[b.submission.id]?.total_score || 0;
      return sortAsc ? aScore - bScore : bScore - aScore;
    }
  });

  const handleScoreClick = (submission: any) => {
    setScoringSubmission(submission);
  };

  if (loading) return <div className="text-devcard-text">Loading submissions...</div>;
  if (!data) return <div className="text-devcard-text">No data</div>;

  return (
    <>
      <Card className="border-devcard-border bg-devcard-base">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-devcard-heading flex items-center gap-2">
              <Trophy className="h-5 w-5 text-devcard-green" />
              Submissions ({data.submissions?.length || 0})
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy(sortBy === 'votes' ? 'score' : 'votes')}
                className="text-sm text-devcard-text hover:text-devcard-green transition-colors px-3 py-1 border border-devcard-border rounded-md"
              >
                Sort by: {sortBy === 'votes' ? 'Votes' : 'Score'}
              </button>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-2 text-sm text-devcard-text hover:text-devcard-green transition-colors px-3 py-1 border border-devcard-border rounded-md"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortAsc ? 'Low to High' : 'High to Low'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSubmissions?.map((item: any) => {
              const score = scores[item.submission.id];

              return (
                <div
                  key={item.submission.id}
                  className="p-4 border border-devcard-border rounded-lg hover:border-devcard-green/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
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

                    {/* Right side: Votes, Score, and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Votes */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-devcard-green">
                          {item.submission.vote_count}
                        </div>
                        <div className="text-xs text-devcard-text">votes</div>
                      </div>

                      {/* Score */}
                      {score ? (
                        <div className="text-center">
                          <div className="text-xl font-bold text-yellow-500">
                            {score.total_score}
                            <span className="text-sm text-devcard-text">/100</span>
                          </div>
                          <div className="text-xs text-devcard-text">scored</div>
                        </div>
                      ) : (
                        <div className="text-xs text-devcard-text/60">Not scored</div>
                      )}

                      {/* Score Button */}
                      <Button
                        onClick={() => handleScoreClick(item.submission)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                      >
                        <Star className="h-3.5 w-3.5 mr-1.5" />
                        {score ? 'Edit Score' : 'Score'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Modal */}
      {scoringSubmission && (
        <ScoringModal
          open={!!scoringSubmission}
          onOpenChange={(open) => !open && setScoringSubmission(null)}
          submission={scoringSubmission}
          existingScore={scores[scoringSubmission.id]}
          onScoreSaved={loadData}
        />
      )}
    </>
  );
}
