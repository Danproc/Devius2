/**
 * Hackathon Winners Page
 * Show winners for a specific hackathon (podium style)
 */

import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, DollarSign } from 'lucide-react';
import { ProjectCard } from '@/components/hackathons/ProjectCard';

export const revalidate = 3600; // ISR

export default async function HackathonWinnersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch winners
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/gallery/hackathons/${slug}/winners`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect('/gallery');
  }

  const data = await response.json();
  const { hackathon, winners } = data;

  const prizes = hackathon.prizes as { first: number; second: number; third: number };
  const totalPrize = prizes.first + prizes.second + prizes.third;

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-10 w-10 text-devcard-green" />
            <h1 className="text-4xl font-bold text-devcard-heading">{hackathon.title}</h1>
            <Badge className="bg-purple-500">Completed</Badge>
          </div>
          {hackathon.theme && (
            <p className="text-xl text-devcard-green font-medium">{hackathon.theme}</p>
          )}
        </div>

        {/* Hackathon Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-devcard-border bg-devcard-base">
            <CardHeader>
              <CardTitle className="text-devcard-heading text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-devcard-green" />
                Prize Pool
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

          <Card className="border-devcard-border bg-devcard-base">
            <CardHeader>
              <CardTitle className="text-devcard-heading text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-devcard-green" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-devcard-text">Started</span>
                <span className="text-devcard-heading">
                  {new Date(hackathon.start_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-devcard-text">Ended</span>
                <span className="text-devcard-heading">
                  {new Date(hackathon.submission_deadline_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winners Podium */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-devcard-heading mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-devcard-green" />
            Winners
          </h2>

          {/* First Place (Center, Larger) */}
          {winners.first && (
            <div className="mb-6">
              <ProjectCard
                submission={winners.first.submission}
                hackathon={hackathon}
                creator={winners.first.creator}
                placement="first"
              />
            </div>
          )}

          {/* Second and Third Place (Side by Side) */}
          <div className="grid md:grid-cols-2 gap-6">
            {winners.second && (
              <ProjectCard
                submission={winners.second.submission}
                hackathon={hackathon}
                creator={winners.second.creator}
                placement="second"
              />
            )}
            {winners.third && (
              <ProjectCard
                submission={winners.third.submission}
                hackathon={hackathon}
                creator={winners.third.creator}
                placement="third"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
