/**
 * Public Hackathon Detail Page
 * Shows hackathon info and winners (no auth required)
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Trophy, ArrowRight, ExternalLink, Github } from 'lucide-react';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { getRegistrationCount } from '@/lib/hackathons/queries';
import { isRegistrationPeriodActive } from '@/lib/hackathons/validations';
import { RegistrationStatus } from '@/components/hackathons/RegistrationStatus';
import { CountdownTimer } from '@/components/hackathons/CountdownTimer';

export const revalidate = 600;

export default async function PublicHackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get hackathon
  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.slug, slug));

  if (!hackathon) {
    redirect('/hackathons');
  }

  const prizes = hackathon.prizes as { first: number; second: number; third: number };
  const totalPrize = prizes.first + prizes.second + prizes.third;
  const isCompleted = hackathon.status === 'completed';

  // Check if registration is active
  const isRegistrationActive = hackathon.registration_start_at && hackathon.registration_end_at
    ? isRegistrationPeriodActive(
        new Date(hackathon.registration_start_at),
        new Date(hackathon.registration_end_at)
      )
    : false;

  // Get registration count
  const registrationCount = await getRegistrationCount(hackathon.id);
  const maxParticipants = hackathon.max_participants as number | null;

  // Get winners if completed
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

  return (
    <div className="min-h-screen bg-devcard-base py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/hackathons" className="text-devcard-green hover:underline text-sm mb-4 inline-block">
            ← Back to Hackathons
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className={isCompleted ? 'bg-purple-500' : 'bg-devcard-green'}>
              {hackathon.status}
            </Badge>
          </div>
          {hackathon.theme && (
            <p className="text-xl text-devcard-green">{hackathon.theme}</p>
          )}
        </div>

        {/* Registration Status & Countdown */}
        {isRegistrationActive && hackathon.registration_end_at && (
          <RegistrationStatus
            registrationEndAt={hackathon.registration_end_at}
            currentCount={registrationCount}
            maxParticipants={maxParticipants}
          />
        )}

        {/* Submission Countdown */}
        {hackathon.status === 'active' && (
          <CountdownTimer deadline={hackathon.submission_deadline_at} />
        )}

        {/* CTA for Non-Completed */}
        {!isCompleted && (
          <Card className="border-devcard-green/30 bg-devcard-green/5 mb-8">
            <CardContent className="py-6 text-center">
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
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card className="border-devcard-border bg-devcard-base mb-6">
          <CardHeader>
            <CardTitle className="text-devcard-heading">About</CardTitle>
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
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-devcard-border bg-devcard-base">
            <CardHeader>
              <CardTitle className="text-devcard-heading text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-devcard-green" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-devcard-text">Starts</span>
                <span className="text-devcard-heading">{new Date(hackathon.start_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-devcard-text">Deadline</span>
                <span className="text-devcard-heading">{new Date(hackathon.submission_deadline_at).toLocaleDateString()}</span>
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

        {/* Winners (Completed Only) */}
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
                        <div>
                          <CardTitle className="text-devcard-heading">{submission.project_title}</CardTitle>
                          <CardDescription className="text-devcard-text mt-1">{submission.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-500 text-black mb-1">{placement}</Badge>
                          <p className="text-sm text-devcard-green font-semibold">${prizeAmount}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        {(submission.tech_stack as string[]).slice(0, 5).map((tech, i) => (
                          <Badge key={i} variant="outline" className="border-devcard-green/30 text-devcard-green">
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
