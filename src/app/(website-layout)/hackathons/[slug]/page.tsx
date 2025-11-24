/**
 * Unified Hackathon Detail Page
 * Works for both authenticated and public users
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  getHackathonBySlug,
  getUserSubmission,
  getUserRegistration,
  getRegistrationCount,
  getRegisteredUsers,
  getHackathonTeamInvites,
} from '@/lib/hackathons/queries';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Trophy, ArrowRight, Edit, ExternalLink, Github, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { CountdownTimer } from '@/components/hackathons/CountdownTimer';
import { RegistrationButton } from '@/components/hackathons/RegistrationButton';
import { RegistrationStatus } from '@/components/hackathons/RegistrationStatus';
import { RegisteredUsersList } from '@/components/hackathons/RegisteredUsersList';
import { TeamInviteCard } from '@/components/hackathons/TeamInviteCard';
import { PublicLeaderboard } from '@/components/hackathons/PublicLeaderboard';
import { isRegistrationPeriodActive, getHackathonPhase, formatPhaseLabel } from '@/lib/hackathons/validations';
import { checkProStatus } from '@/middleware/pro-check';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateEventSchema } from '@/lib/seo/structured-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export const revalidate = 60; // Revalidate every minute for real-time updates

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);

  if (!hackathon) {
    return {
      title: 'Hackathon Not Found - StackPass',
      description: 'The requested hackathon could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ogImageUrl = `/api/og/hackathon?title=${encodeURIComponent(hackathon.title)}&prize=${hackathon.prizes.first}&currency=${hackathon.prizes.currency}`;

  return generatePageMetadata({
    title: `${hackathon.title} - StackPass Hackathons`,
    description: hackathon.description,
    path: `/hackathons/${hackathon.slug}`,
    ogImage: `${baseUrl}${ogImageUrl}`,
  });
}

export default async function UnifiedHackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth(); // Returns null if not authenticated - NO REDIRECT
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);

  if (!hackathon) {
    redirect('/hackathons');
  }

  // Compute actual phase (status overrides date calculation if completed)
  const actualPhase = getHackathonPhase(
    hackathon.registration_start_at ? new Date(hackathon.registration_start_at) : null,
    hackathon.registration_end_at ? new Date(hackathon.registration_end_at) : null,
    new Date(hackathon.start_at),
    new Date(hackathon.submission_deadline_at),
    hackathon.voting_start_at ? new Date(hackathon.voting_start_at) : null,
    hackathon.voting_end_at ? new Date(hackathon.voting_end_at) : null,
    hackathon.status
  );

  const isCompleted = actualPhase === 'completed';
  const isRegistrationActive = hackathon.registration_start_at && hackathon.registration_end_at
    ? isRegistrationPeriodActive(
        new Date(hackathon.registration_start_at),
        new Date(hackathon.registration_end_at)
      )
    : false;

  // Get registration count (public data)
  const registrationCount = await getRegistrationCount(hackathon.id);
  const maxParticipants = hackathon.max_participants as number | null;
  const isFull = maxParticipants !== null && registrationCount >= maxParticipants;

  // Fetch authenticated user data ONLY if logged in
  let userSubmission = null;
  let userRegistration = null;
  let pendingInvites: any[] = [];
  let proStatus: { isPro: boolean; expiresAt: Date | null; isExpired: boolean } = {
    isPro: false,
    expiresAt: null,
    isExpired: false
  };
  let registeredUsers: any[] = [];

  if (session?.user?.id) {
    [userSubmission, userRegistration, pendingInvites, proStatus] = await Promise.all([
      getUserSubmission(hackathon.id, session.user.id),
      getUserRegistration(hackathon.id, session.user.id),
      getHackathonTeamInvites(session.user.id, hackathon.id),
      checkProStatus(session.user.id),
    ]);

    // Get registered users list (only for authenticated users, during registration/active/voting)
    if (actualPhase === 'registration' || actualPhase === 'active' || actualPhase === 'voting') {
      registeredUsers = await getRegisteredUsers(hackathon.id);
    }
  }

  // Get winners if completed (public data)
  const winners = isCompleted
    ? await db
        .select()
        .from(hackathon_submissions)
        .where(
          and(
            eq(hackathon_submissions.hackathon_id, hackathon.id),
            inArray(hackathon_submissions.status, ['winner_first', 'winner_second', 'winner_third'])
          )
        )
    : [];

  // Get leaderboard data if completed (all submissions with scores)
  let leaderboardData: any[] = [];
  if (isCompleted) {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/hackathons/${hackathon.id}/leaderboard`,
      { cache: 'no-store' }
    );
    if (response.ok) {
      const data = await response.json();
      leaderboardData = data.leaderboard || [];
    }
  }

  const canUnregister = isRegistrationActive;
  const prizes = hackathon.prizes as { first: number; second: number; third: number };
  const totalPrize = prizes.first + prizes.second + prizes.third;

  return (
    <div className="min-h-screen bg-devcard-base">
      <StructuredData schema={generateEventSchema(hackathon)} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-20 pb-8 max-w-4xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Hackathons', href: '/hackathons' },
            { label: hackathon.title, href: `/hackathons/${hackathon.slug}` },
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className={
              actualPhase === 'completed' ? 'bg-purple-500' :
              actualPhase === 'voting' ? 'bg-yellow-500' :
              actualPhase === 'active' ? 'bg-devcard-green' :
              actualPhase === 'registration' ? 'bg-cyan-500' : 'bg-blue-500'
            }>
              {formatPhaseLabel(actualPhase)}
            </Badge>
          </div>
          {hackathon.theme && (
            <p className="text-xl text-devcard-green">{hackathon.theme}</p>
          )}
        </div>

        {/* Registration Status & Countdown - Shows during registration AND active phases */}
        {(isRegistrationActive || actualPhase === 'active') && (
          <RegistrationStatus
            registrationEndAt={
              isRegistrationActive
                ? hackathon.registration_end_at!
                : hackathon.submission_deadline_at
            }
            currentCount={registrationCount}
            maxParticipants={maxParticipants}
            label={isRegistrationActive ? 'Registration closes in' : 'Submission deadline in'}
          />
        )}

        {/* Team Invites (Authenticated Only) */}
        {session && pendingInvites.length > 0 && (
          <div className="mb-6 space-y-4">
            <h2 className="text-2xl font-bold text-devcard-heading flex items-center gap-2">
              <Trophy className="h-6 w-6 text-devcard-green" />
              Team Invitations ({pendingInvites.length})
            </h2>
            {pendingInvites.map((item) => (
              <TeamInviteCard
                key={item.invite.id}
                invite={item.invite}
                team={item.team}
                hackathon={item.hackathon}
                inviter={item.inviter}
              />
            ))}
          </div>
        )}

        {/* Free User Banner (Authenticated Non-Pro Only) */}
        {session && !proStatus.isPro && !isCompleted && (
          <Alert className="mb-6 border-devcard-green/30 bg-devcard-green/5">
            <Sparkles className="h-4 w-4 text-devcard-green" />
            <AlertDescription className="text-devcard-text">
              <span className="font-semibold text-devcard-heading">Upgrade to Pro to participate!</span>
              {' '}Join hackathons, compete for prizes, and earn exclusive badges.
              <a href="/app/billing" className="ml-2 text-devcard-green hover:underline font-medium">
                Upgrade now →
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Description */}
        <Card className="border-devcard-border bg-devcard-base mb-6">
          <CardHeader>
            <CardTitle className="text-devcard-heading">About This Hackathon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-devcard-text whitespace-pre-wrap">{hackathon.description}</p>
            {hackathon.rules && (
              <div>
                <h3 className="font-semibold text-devcard-heading mb-2">Rules</h3>
                <p className="text-devcard-text whitespace-pre-wrap text-sm">{hackathon.rules}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline & Prizes */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-devcard-border bg-devcard-base">
            <CardHeader>
              <CardTitle className="text-devcard-heading text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-devcard-green" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {hackathon.registration_start_at && hackathon.registration_end_at && (
                <>
                  <div className="flex justify-between">
                    <span className="text-devcard-text">Registration Opens</span>
                    <span className="text-devcard-heading">
                      {new Date(hackathon.registration_start_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-devcard-text">Registration Closes</span>
                    <span className="text-devcard-heading">
                      {new Date(hackathon.registration_end_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-devcard-border my-2"></div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-devcard-text">Hackathon Starts</span>
                <span className="text-devcard-heading">{new Date(hackathon.start_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-devcard-text">Submission Deadline</span>
                <span className="text-devcard-heading">{new Date(hackathon.submission_deadline_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-devcard-border bg-devcard-base">
            <CardHeader>
              <CardTitle className="text-devcard-heading text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-devcard-green" />
                Prizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-devcard-text">1st Place</span>
                <span className="text-devcard-heading font-semibold">${prizes.first}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-devcard-text">2nd Place</span>
                <span className="text-devcard-heading">${prizes.second}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-devcard-text">3rd Place</span>
                <span className="text-devcard-heading">${prizes.third}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-devcard-border">
                <span className="text-devcard-text font-semibold">Total</span>
                <span className="text-devcard-green font-bold">${totalPrize}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions - Sleek compact design (hide during completed phase) */}
        {!isCompleted && (
        <Alert className="border-devcard-green/30 bg-devcard-green/5 mb-6">
          {!session ? (
            <>
              <Sparkles className="h-4 w-4 text-devcard-green" />
              <AlertDescription>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-sm font-semibold text-devcard-heading">Ready to compete? </span>
                    <span className="text-sm text-devcard-text">Sign up for StackPass Pro to register</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="bg-devcard-green hover:bg-devcard-green/90 text-black">
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-devcard-border">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </>
          ) : userSubmission ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-devcard-green" />
              <AlertDescription>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-sm font-semibold text-devcard-heading">You're Entered! </span>
                    <span className="text-sm text-devcard-text">{userSubmission.project_title}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="border-devcard-border">
                    <Link href={`/app/hackathons/submissions/${userSubmission.id}/edit`}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit Submission
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </>
          ) : isRegistrationActive ? (
            <>
              <Trophy className="h-4 w-4 text-devcard-green" />
              <AlertDescription>
                <div className="flex items-center justify-center">
                  <RegistrationButton
                    hackathonId={hackathon.id}
                    isRegistered={!!userRegistration}
                    isFull={isFull}
                    canUnregister={canUnregister}
                  />
                </div>
              </AlertDescription>
            </>
          ) : actualPhase === 'active' ? (
            <>
              <Trophy className="h-4 w-4 text-devcard-green" />
              <AlertDescription>
                {userRegistration ? (
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-sm font-semibold text-devcard-heading">Ready to submit your project?</span>
                    <Button asChild size="sm" className="bg-devcard-green hover:bg-devcard-green/90 text-black">
                      <Link href={`/app/hackathons/${hackathon.slug}/enter`}>
                        Submit Project
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-devcard-text">
                    <span className="font-semibold text-devcard-heading">Registration Required.</span> You must register during the registration period to participate.
                  </div>
                )}
              </AlertDescription>
            </>
          ) : actualPhase === 'voting' ? (
            <>
              <Trophy className="h-4 w-4 text-devcard-green" />
              <AlertDescription>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-sm font-semibold text-devcard-heading">Voting is Open! </span>
                    <span className="text-sm text-devcard-text">Cast your votes for the best projects</span>
                  </div>
                  <Button asChild size="sm" className="bg-devcard-green hover:bg-devcard-green/90 text-black">
                    <Link href={`/app/hackathons/${hackathon.slug}/vote`}>
                      Vote on Submissions
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </>
          ) : (
            <>
              <Trophy className="h-4 w-4 text-devcard-text/50" />
              <AlertDescription>
                <span className="text-sm text-devcard-text">This hackathon is not currently accepting registrations or submissions.</span>
              </AlertDescription>
            </>
          )}
        </Alert>
        )}

        {/* Registered Users (Authenticated Only) */}
        {session && registeredUsers.length > 0 && (
          <div className="mb-6">
            <RegisteredUsersList users={registeredUsers} totalCount={registrationCount} />
          </div>
        )}

        {/* Winners (Completed Hackathons - Public) */}
        {isCompleted && winners.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-devcard-heading mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-devcard-green" />
              Winners
            </h2>
            <div className="space-y-4">
              {winners.map((submission) => {
                const placement = submission.status === 'winner_first' ? '🥇 1st Place' :
                                submission.status === 'winner_second' ? '🥈 2nd Place' : '🥉 3rd Place';
                const prizeAmount = submission.status === 'winner_first' ? prizes.first :
                                   submission.status === 'winner_second' ? prizes.second : prizes.third;

                // Find score for this submission
                const leaderboardEntry = leaderboardData.find((entry: any) => entry.submission.id === submission.id);
                const score = leaderboardEntry?.score;

                return (
                  <Card key={submission.id} className="border-devcard-green/50 bg-devcard-base">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-devcard-heading">{submission.project_title}</CardTitle>
                          <p className="text-devcard-text mt-1">{submission.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <Badge className="bg-yellow-500 text-black mb-2">{placement}</Badge>
                          <p className="text-sm text-devcard-green font-semibold mb-1">${prizeAmount}</p>
                          {score && (
                            <div className="flex items-center gap-1 justify-end">
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-lg font-bold text-yellow-500">
                                {score.total_score}
                                <span className="text-xs text-devcard-text">/100</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {(submission.tech_stack as string[]).slice(0, 6).map((tech, i) => (
                          <Badge key={i} variant="outline" className="border-devcard-green/30 text-devcard-green text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="border-devcard-border">
                          <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            Code
                          </a>
                        </Button>
                        {submission.demo_url && (
                          <Button asChild size="sm" variant="outline" className="border-devcard-border">
                            <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Leaderboard (Completed Hackathons - Public) */}
        {isCompleted && leaderboardData.length > 0 && (
          <div className="mb-8">
            <PublicLeaderboard entries={leaderboardData} />
          </div>
        )}
      </div>
    </div>
  );
}
