/**
 * Hackathon Detail Page
 * Shows full hackathon info with enter/submit options
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHackathonBySlug, getUserSubmission } from '@/lib/hackathons/queries';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Trophy, ArrowRight, Edit } from 'lucide-react';
import { CountdownTimer } from '@/components/hackathons/CountdownTimer';

export default async function HackathonDetailPage({
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
    redirect('/app/hackathons');
  }

  // Check if user already has a submission
  const userSubmission = await getUserSubmission(hackathon.id, session.user.id);

  const prizes = hackathon.prizes as { first: number; second: number; third: number };
  const totalPrize = prizes.first + prizes.second + prizes.third;
  const startDate = new Date(hackathon.start_at);
  const deadline = new Date(hackathon.submission_deadline_at);

  const statusColor = {
    draft: 'bg-gray-500',
    upcoming: 'bg-blue-500',
    active: 'bg-devcard-green',
    voting: 'bg-yellow-500',
    completed: 'bg-purple-500',
  }[hackathon.status];

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className={statusColor}>{hackathon.status}</Badge>
          </div>
          {hackathon.theme && (
            <p className="text-xl text-devcard-green font-medium">{hackathon.theme}</p>
          )}
        </div>

        {/* Countdown Timer */}
        {hackathon.status === 'active' && (
          <CountdownTimer deadline={hackathon.submission_deadline_at} />
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

        {/* Dates & Prizes */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                <span className="text-devcard-heading">{startDate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-devcard-text">Deadline</span>
                <span className="text-devcard-heading">{deadline.toLocaleString()}</span>
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

        {/* Entry/Submission Actions */}
        <Card className="border-devcard-green/30 bg-devcard-green/5">
          <CardContent className="py-6">
            {userSubmission ? (
              <div className="text-center">
                <Trophy className="h-12 w-12 text-devcard-green mx-auto mb-4" />
                <h3 className="text-xl font-bold text-devcard-heading mb-2">You're Entered!</h3>
                <p className="text-devcard-text mb-4">Project: {userSubmission.project_title}</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-devcard-border text-devcard-heading"
                >
                  <Link href={`/app/hackathons/submissions/${userSubmission.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Submission
                  </Link>
                </Button>
              </div>
            ) : hackathon.status === 'active' ? (
              <div className="text-center">
                <h3 className="text-xl font-bold text-devcard-heading mb-4">Ready to compete?</h3>
                <Button
                  asChild
                  className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full"
                  size="lg"
                >
                  <Link href={`/app/hackathons/${hackathon.id}/enter`}>
                    Enter Hackathon
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center text-devcard-text">
                This hackathon is not currently accepting submissions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
