'use client';

import { useState, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface VoteButtonProps {
  submissionId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  disabled?: boolean;
}

export function VoteButton({
  submissionId,
  initialVoteCount,
  initialHasVoted,
  disabled = false,
}: VoteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Optimistic UI state
  const [optimisticState, setOptimisticState] = useOptimistic(
    { voteCount: initialVoteCount, hasVoted: initialHasVoted },
    (state, newHasVoted: boolean) => ({
      voteCount: newHasVoted ? state.voteCount + 1 : state.voteCount - 1,
      hasVoted: newHasVoted,
    })
  );

  const handleVote = async () => {
    if (disabled) return;

    const newHasVoted = !optimisticState.hasVoted;
    setLoading(true);

    // Optimistically update UI immediately
    setOptimisticState(newHasVoted);

    try {
      const response = await fetch(`/api/hackathons/submissions/${submissionId}/vote`, {
        method: newHasVoted ? 'POST' : 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update vote');
      }

      // Refresh to get latest data
      router.refresh();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message);

      // Revert optimistic update on error
      setOptimisticState(!newHasVoted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVote}
      disabled={disabled || loading}
      variant={optimisticState.hasVoted ? 'default' : 'outline'}
      className={
        optimisticState.hasVoted
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
          : 'border-devcard-border hover:border-red-500 hover:text-red-500'
      }
      size="sm"
    >
      <Heart
        className={`h-4 w-4 mr-2 ${optimisticState.hasVoted ? 'fill-current' : ''}`}
      />
      {optimisticState.voteCount}
    </Button>
  );
}
