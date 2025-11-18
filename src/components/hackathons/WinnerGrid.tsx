'use client';

import { ProjectCard } from './ProjectCard';
import { Trophy } from 'lucide-react';

interface Winner {
  submission: any;
  hackathon: any;
  creator: any;
}

interface WinnerGridProps {
  winners: Winner[];
}

export function WinnerGrid({ winners }: WinnerGridProps) {
  if (winners.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-devcard-text/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-devcard-heading mb-2">
          No Winners Yet
        </h3>
        <p className="text-devcard-text">
          Check back after hackathons have concluded to see the winning projects!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {winners.map((winner) => {
        // Determine placement based on status
        let placement: 'first' | 'second' | 'third' | undefined;
        if (winner.submission.status === 'winner_first') placement = 'first';
        else if (winner.submission.status === 'winner_second') placement = 'second';
        else if (winner.submission.status === 'winner_third') placement = 'third';

        return (
          <ProjectCard
            key={winner.submission.id}
            submission={winner.submission}
            hackathon={winner.hackathon}
            creator={winner.creator}
            placement={placement}
          />
        );
      })}
    </div>
  );
}
