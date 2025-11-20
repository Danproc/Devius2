/**
 * Unified Hackathon Detail Page
 * Works for both authenticated and public users
 */

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
import { Calendar, DollarSign, Trophy, ArrowRight, Edit, ExternalLink, Github } from 'lucide-react';
import { CountdownTimer } from '@/components/hackathons/CountdownTimer';
import { RegistrationButton } from '@/components/hackathons/RegistrationButton';
import { RegistrationStatus } from '@/components/hackathons/RegistrationStatus';
import { RegisteredUsersList } from '@/components/hackathons/RegisteredUsersList';
import { TeamInviteCard } from '@/components/hackathons/TeamInviteCard';
import { isRegistrationPeriodActive, getHackathonPhase } from '@/lib/hackathons/validations';
import { checkProStatus } from '@/middleware/pro-check';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';

export const revalidate = 60; // Revalidate every minute for real-time updates

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

  // Compute actual phase
  const actualPhase = getHackathonPhase(
    hackathon.registration_start_at ? new Date(hackathon.registration_start_at) : null,
    hackathon.registration_end_at ? new Date(hackathon.registration_end_at) : null,
    new Date(hackathon.start_at),
    new Date(hackathon.submission_deadline_at),
    hackathon.voting_start_at ? new Date(hackathon.voting_start_at) : null,
    hackathon.voting_end_at ? new Date(hackathon.voting_end_at) : null
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

  const canUnregister = isRegistrationActive;
  const prizes = hackathon.prizes as { first: number; second: number; third: number };
  const totalPrize = prizes.first + prizes.second + prizes.third;

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Back Link */}
        <Link href="/hackathons" className="text-devcard-green hover:underline text-sm mb-4 inline-block">
          ← Back to Hackathons
        </Link>

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
              {actualPhase}
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

        {/* Actions - Conditional based on auth + phase */}
        <Card className="border-devcard-green/30 bg-devcard-green/5 mb-6">
          <CardContent className="py-4">
            {!session ? (
              // Not logged in - show sign up CTA
              <div className="text-center">
                <h3 className="text-xl font-bold text-devcard-heading mb-2">Ready to Compete?</h3>
                <p className="text-devcard-text mb-4">Sign up for StackPass Pro to register</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black font-semibold">
                    <Link href="/sign-up">
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-devcard-border">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              </div>
            ) : userSubmission ? (
              // Already submitted
              <div className="text-center">
                <Trophy className="h-12 w-12 text-devcard-green mx-auto mb-4" />
                <h3 className="text-xl font-bold text-devcard-heading mb-2">You're Entered!</h3>
                <p className="text-devcard-text mb-4">Project: {userSubmission.project_title}</p>
                <Button asChild variant="outline" className="border-devcard-border">
                  <Link href={`/app/hackathons/submissions/${userSubmission.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Submission
                  </Link>
                </Button>
              </div>
            ) : isRegistrationActive ? (
              // Registration period - show registration button
              <div className="text-center">
                <h3 className="text-xl font-bold text-devcard-heading mb-4">
                  {userRegistration ? "You're Registered!" : 'Join the Competition'}
                </h3>
                <RegistrationButton
                  hackathonId={hackathon.id}
                  isRegistered={!!userRegistration}
                  isFull={isFull}
                  canUnregister={canUnregister}
                />
              </div>
            ) : actualPhase === 'active' ? (
              // Active phase - show submit button
              <div className="text-center">
                {userRegistration ? (
                  <>
                    <h3 className="text-xl font-bold text-devcard-heading mb-4">Ready to compete?</h3>
                    <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full" size="lg">
                      <Link href={`/app/hackathons/${hackathon.slug}/enter`}>
                        Submit Project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-devcard-heading mb-4">Registration Required</h3>
                    <p className="text-devcard-text">You must register during the registration period to participate.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-devcard-text">
                This hackathon is not currently accepting registrations or submissions.
              </div>
            )}
          </CardContent>
        </Card>

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

                return (
                  <Card key={submission.id} className="border-devcard-border bg-devcard-base">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-devcard-heading">{submission.project_title}</CardTitle>
                          <p className="text-devcard-text mt-1">{submission.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <Badge className="bg-yellow-500 text-black mb-1">{placement}</Badge>
                          <p className="text-sm text-devcard-green font-semibold">${prizeAmount}</p>
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
      </div>
    </div>
  );
}
