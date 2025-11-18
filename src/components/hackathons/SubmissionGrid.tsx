'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Video, Trophy } from 'lucide-react';
import { VoteButton } from './VoteButton';

interface Submission {
  id: string;
  project_title: string;
  description: string;
  github_url: string;
  demo_url: string | null;
  video_url: string | null;
  tech_stack: string[];
  vote_count: number;
  status: string;
  user_has_voted?: boolean;
}

interface SubmissionGridProps {
  submissions: Submission[];
  votingEnabled?: boolean;
  showVoteButton?: boolean;
}

export function SubmissionGrid({
  submissions,
  votingEnabled = false,
  showVoteButton = false,
}: SubmissionGridProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-devcard-text/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-devcard-heading mb-2">
          No Submissions Yet
        </h3>
        <p className="text-devcard-text">
          Be the first to submit your project!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {submissions.map((submission, index) => (
        <Card
          key={submission.id}
          className="border-devcard-border bg-devcard-base flex flex-col"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-devcard-heading text-lg line-clamp-2">
                {submission.project_title}
              </CardTitle>
              {index < 3 && submission.status === 'submitted' && (
                <Badge
                  className={
                    index === 0
                      ? 'bg-yellow-500 text-black'
                      : index === 1
                      ? 'bg-gray-400 text-black'
                      : 'bg-orange-600 text-white'
                  }
                >
                  #{index + 1}
                </Badge>
              )}
            </div>
            <CardDescription className="text-devcard-text line-clamp-3">
              {submission.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow">
            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {submission.tech_stack.slice(0, 5).map((tech, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="border-devcard-green/30 text-devcard-green text-xs"
                >
                  {tech}
                </Badge>
              ))}
              {submission.tech_stack.length > 5 && (
                <Badge variant="outline" className="border-devcard-border text-devcard-text text-xs">
                  +{submission.tech_stack.length - 5}
                </Badge>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-devcard-border justify-start"
              >
                <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  View Code
                </a>
              </Button>

              {submission.demo_url && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-devcard-border justify-start"
                >
                  <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}

              {submission.video_url && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-devcard-border justify-start"
                >
                  <a href={submission.video_url} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </a>
                </Button>
              )}
            </div>
          </CardContent>

          {showVoteButton && (
            <CardFooter className="pt-4 border-t border-devcard-border">
              <VoteButton
                submissionId={submission.id}
                initialVoteCount={submission.vote_count}
                initialHasVoted={submission.user_has_voted || false}
                disabled={!votingEnabled}
              />
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
