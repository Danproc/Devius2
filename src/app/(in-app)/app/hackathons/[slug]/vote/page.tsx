/**
 * Hackathon Voting Page
 * Allows Pro members to vote on submissions during voting period
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHackathonBySlug } from '@/lib/hackathons/queries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trophy, Clock } from 'lucide-react';
import { SubmissionGrid } from '@/components/hackathons/SubmissionGrid';
import { CountdownTimer } from '@/components/hackathons/CountdownTimer';
import { isVotingPeriodActive, getHackathonPhase, formatPhaseLabel } from '@/lib/hackathons/validations';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function VotingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);

  if (!hackathon) {
    redirect('/hackathons');
  }

  // Check if voting period is configured
  if (!hackathon.voting_start_at || !hackathon.voting_end_at) {
    return (
      <div className="min-h-screen bg-devcard-base">
        <div className="container mx-auto py-8 max-w-6xl">
          <Alert className="border-yellow-500/30 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600">
              Voting has not been configured for this hackathon.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild variant="outline" className="border-devcard-border">
              <Link href={`/hackathons/${hackathon.slug}`}>Back to Hackathon</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isVotingActive = isVotingPeriodActive(
    new Date(hackathon.voting_start_at),
    new Date(hackathon.voting_end_at)
  );

  const votingEnd = new Date(hackathon.voting_end_at);
  const now = new Date();

  // Compute actual phase based on dates (status overrides if completed)
  const actualPhase = getHackathonPhase(
    hackathon.registration_start_at ? new Date(hackathon.registration_start_at) : null,
    hackathon.registration_end_at ? new Date(hackathon.registration_end_at) : null,
    new Date(hackathon.start_at),
    new Date(hackathon.submission_deadline_at),
    new Date(hackathon.voting_start_at),
    new Date(hackathon.voting_end_at),
    hackathon.status
  );

  // Fetch submissions
  const response = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/hackathons/${hackathon.id}/submissions`,
    {
      headers: {
        Cookie: `authjs.session-token=${session.user.id}`,
      },
      cache: 'no-store',
    }
  );

  const data = await response.json();
  const submissions = data.submissions || [];

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-500',
    upcoming: 'bg-blue-500',
    registration: 'bg-cyan-500',
    active: 'bg-devcard-green',
    voting: 'bg-yellow-500',
    completed: 'bg-purple-500',
  };

  const badgeColor = statusColor[actualPhase] || 'bg-gray-500';

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className={badgeColor}>{formatPhaseLabel(actualPhase)}</Badge>
          </div>
          {hackathon.theme && (
            <p className="text-xl text-devcard-green font-medium">{hackathon.theme}</p>
          )}
        </div>

        {/* Voting Status */}
        {isVotingActive ? (
          <CountdownTimer deadline={hackathon.voting_end_at} />
        ) : now < new Date(hackathon.voting_start_at) ? (
          <Alert className="border-devcard-border/50 bg-devcard-base mb-6">
            <Clock className="h-4 w-4 text-devcard-green" />
            <AlertDescription className="text-devcard-text">
              Voting opens on {new Date(hackathon.voting_start_at).toLocaleString()}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-500/30 bg-red-500/10 mb-6">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              Voting has ended. Winners will be announced soon!
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="border-devcard-border bg-devcard-base mb-6">
          <CardHeader>
            <CardTitle className="text-devcard-heading flex items-center gap-2">
              <Trophy className="h-5 w-5 text-devcard-green" />
              Community Voting
            </CardTitle>
            <CardDescription className="text-devcard-text">
              Vote for your favorite projects! You can change your votes anytime during the voting period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-devcard-text">
              <li>Vote for as many projects as you like</li>
              <li>You cannot vote on your own submission or your team's submission</li>
              <li>Click the heart button to vote, click again to remove your vote</li>
              <li>Projects are ranked by total votes received</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submissions Grid */}
        <div>
          <h2 className="text-2xl font-bold text-devcard-heading mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-devcard-green" />
            Submissions ({submissions.length})
          </h2>
          <SubmissionGrid
            submissions={submissions}
            votingEnabled={isVotingActive}
            showVoteButton={true}
          />
        </div>
      </div>
    </div>
  );
}
