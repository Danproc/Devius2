/**
 * Hackathon Submission Entry Page
 * Allows Pro members to submit their project
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHackathonBySlug, getUserRegistration, getUserTeam } from '@/lib/hackathons/queries';
import { getHackathonPhase } from '@/lib/hackathons/validations';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trophy, Users as UsersIcon, User } from 'lucide-react';
import { SubmissionForm } from '@/components/hackathons/SubmissionForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HackathonEntryPage({
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

  // Check if hackathon is in active phase
  const actualPhase = getHackathonPhase(
    hackathon.registration_start_at ? new Date(hackathon.registration_start_at) : null,
    hackathon.registration_end_at ? new Date(hackathon.registration_end_at) : null,
    new Date(hackathon.start_at),
    new Date(hackathon.submission_deadline_at),
    hackathon.voting_start_at ? new Date(hackathon.voting_start_at) : null,
    hackathon.voting_end_at ? new Date(hackathon.voting_end_at) : null
  );

  if (actualPhase !== 'active') {
    return (
      <div className="min-h-screen bg-devcard-base">
        <div className="container mx-auto py-8 max-w-4xl">
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              This hackathon is not currently accepting submissions.
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

  // Check deadline
  const deadline = new Date(hackathon.submission_deadline_at);
  const now = new Date();
  if (now > deadline) {
    return (
      <div className="min-h-screen bg-devcard-base">
        <div className="container mx-auto py-8 max-w-4xl">
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              The submission deadline has passed. Submissions are no longer accepted.
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

  // Check if user is Pro
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user?.is_premium || (user.premium_expires_at && new Date(user.premium_expires_at) < new Date())) {
    return (
      <div className="min-h-screen bg-devcard-base">
        <div className="container mx-auto py-8 max-w-4xl">
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              Pro membership required to participate in hackathons. Upgrade to Pro for $49/year to compete.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild variant="outline" className="border-devcard-border">
              <Link href="/app/billing">Upgrade to Pro</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is registered (if hackathon has registration)
  if (hackathon.registration_start_at && hackathon.registration_end_at) {
    const userRegistration = await getUserRegistration(hackathon.id, session.user.id);
    if (!userRegistration) {
      return (
        <div className="min-h-screen bg-devcard-base">
          <div className="container mx-auto py-8 max-w-4xl">
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">
                You must register during the registration period to submit a project for this hackathon.
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
  }

  // Check if user is on a team for this hackathon
  const userTeam = await getUserTeam(hackathon.id, session.user.id);

  const prizes = hackathon.prizes as { first: number; second: number; third: number };

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Hackathon Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className="bg-devcard-green">Active</Badge>
          </div>
          {hackathon.theme && (
            <p className="text-lg text-devcard-green font-medium">{hackathon.theme}</p>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-devcard-border bg-devcard-base mb-6">
          <CardHeader>
            <CardTitle className="text-devcard-heading">Submit Your Entry</CardTitle>
            <CardDescription className="text-devcard-text">
              Complete the form below to enter your project. You can save as a draft and edit until the deadline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-devcard-text">Deadline:</span>{' '}
                <span className="text-devcard-heading font-semibold">
                  {deadline.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-devcard-text">Prize Pool:</span>{' '}
                <span className="text-devcard-green font-semibold">
                  ${prizes.first + prizes.second + prizes.third}
                </span>
              </div>
            </div>

            <Alert className="border-devcard-green/30 bg-devcard-green/5">
              <AlertDescription className="text-devcard-text text-sm">
                <strong>Requirements:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>GitHub repository must be public</li>
                  <li>Project must align with the hackathon theme</li>
                  <li>Demo/video highly recommended</li>
                  <li>You can edit your submission until the deadline</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Team Selection (if no team yet) */}
        {!userTeam && (
          <Card className="border-devcard-border bg-devcard-base mb-6">
            <CardHeader>
              <CardTitle className="text-devcard-heading">Choose Your Participation Type</CardTitle>
              <CardDescription className="text-devcard-text">
                Will you be working solo or forming a team?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Solo Option */}
                <Card className="border-devcard-border hover:border-devcard-green/50 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <User className="h-12 w-12 text-devcard-green mx-auto mb-3" />
                      <h3 className="font-semibold text-devcard-heading mb-2">Submit Solo</h3>
                      <p className="text-sm text-devcard-text mb-4">
                        Work independently on your project
                      </p>
                      <p className="text-xs text-devcard-text italic">
                        Continue below to submit as a solo participant
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Option */}
                <Card className="border-devcard-border hover:border-devcard-green/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <UsersIcon className="h-12 w-12 text-devcard-green mx-auto mb-3" />
                      <h3 className="font-semibold text-devcard-heading mb-2">Form a Team</h3>
                      <p className="text-sm text-devcard-text mb-4">
                        Collaborate with up to 4 other participants
                      </p>
                      <Button
                        asChild
                        className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
                      >
                        <Link href={`/hackathons/${hackathon.slug}/team`}>
                          Build Team
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Info (if on a team) */}
        {userTeam && (
          <Card className="border-devcard-green/30 bg-devcard-green/5 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-devcard-green" />
                  <span className="font-semibold text-devcard-heading">
                    Submitting as Team
                    {userTeam.team_name && `: ${userTeam.team_name}`}
                  </span>
                  <Badge variant="outline" className="border-devcard-green text-devcard-green">
                    {(userTeam.members as any[]).length} members
                  </Badge>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-devcard-border"
                >
                  <Link href={`/hackathons/${hackathon.slug}/team`}>
                    Manage Team
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission Form */}
        <Card className="border-devcard-border bg-devcard-base">
          <CardContent className="pt-6">
            <SubmissionForm
              hackathonId={hackathon.id}
              teamId={userTeam?.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
