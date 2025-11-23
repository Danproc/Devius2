import AnimationContainer from '@/components/global/animation-container';
import MaxWidthWrapper from '@/components/global/max-width-wrapper';
import MagicBadge from '@/components/ui/magic-badge';
import MagicCard from '@/components/ui/magic-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, DollarSign, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { inArray } from 'drizzle-orm';
import { getHackathonPhase, formatPhaseLabel } from '@/lib/hackathons/validations';

export async function UpcomingHackathon() {
  // Fetch next upcoming hackathon
  const [upcomingHackathon] = await db
    .select()
    .from(hackathons)
    .where(inArray(hackathons.status, ['upcoming', 'registration', 'active']))
    .orderBy(hackathons.start_at)
    .limit(1);

  if (!upcomingHackathon) {
    return (
      <MaxWidthWrapper className="py-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="Upcoming Hackathon" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-bold text-devcard-heading mt-6">
              No active competitions
            </h2>
            <p className="text-center text-devcard-text mt-4 text-lg">
              Check back soon for our next hackathon challenge
            </p>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    );
  }

  // Calculate phase for badge
  const phase = getHackathonPhase(
    upcomingHackathon.registration_start_at ? new Date(upcomingHackathon.registration_start_at) : null,
    upcomingHackathon.registration_end_at ? new Date(upcomingHackathon.registration_end_at) : null,
    new Date(upcomingHackathon.start_at),
    new Date(upcomingHackathon.submission_deadline_at),
    upcomingHackathon.voting_start_at ? new Date(upcomingHackathon.voting_start_at) : null,
    upcomingHackathon.voting_end_at ? new Date(upcomingHackathon.voting_end_at) : null,
    upcomingHackathon.status
  );

  const prizes = upcomingHackathon.prizes as { first: number; second: number; third: number; currency?: string };
  const totalPrize = prizes.first + prizes.second + prizes.third;
  const currency = prizes.currency || 'USD';

  return (
    <MaxWidthWrapper className="py-10">
      <AnimationContainer delay={0.1}>
        <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
          <MagicBadge title="Upcoming Hackathon" />
          <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-bold text-devcard-heading mt-6">
            Join the next challenge
          </h2>
          <p className="text-center text-devcard-text mt-4 text-lg">
            Compete for{' '}
            <span className="text-devcard-green font-bold">${totalPrize.toLocaleString()} {currency}</span>
            {' '}in prizes
          </p>
        </div>
      </AnimationContainer>

      <AnimationContainer delay={0.3}>
        <div className="flex justify-center py-10">
          <MagicCard className="max-w-2xl w-full">
            {/* Status Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className={
                phase === 'registration' ? 'bg-devcard-green text-black' :
                phase === 'active' ? 'bg-blue-500 text-white' :
                'bg-cyan-500 text-black'
              }>
                <Zap className="h-3 w-3 mr-1" />
                {formatPhaseLabel(phase)}
              </Badge>
            </div>

            <div className="p-8 md:p-10">
              {/* Title */}
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-devcard-heading mb-2">
                  {upcomingHackathon.title}
                </h3>
                {upcomingHackathon.theme && (
                  <p className="text-devcard-green text-lg font-medium">
                    {upcomingHackathon.theme}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-devcard-text text-center mb-8 leading-relaxed max-w-xl mx-auto">
                {upcomingHackathon.description}
              </p>

              {/* Key Details - Techy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Prize Pool */}
                <div className="flex flex-col items-center p-4 rounded-lg bg-devcard-base/50 border border-devcard-border">
                  <DollarSign className="h-6 w-6 text-devcard-green mb-2" />
                  <div className="text-2xl font-bold text-devcard-green">
                    ${totalPrize}
                  </div>
                  <div className="text-xs text-devcard-text">Prize Pool</div>
                </div>

                {/* Start Date */}
                <div className="flex flex-col items-center p-4 rounded-lg bg-devcard-base/50 border border-devcard-border">
                  <Calendar className="h-6 w-6 text-devcard-green mb-2" />
                  <div className="text-sm font-bold text-devcard-heading">
                    {new Date(upcomingHackathon.start_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-devcard-text">Launch Date</div>
                </div>

                {/* Duration */}
                <div className="flex flex-col items-center p-4 rounded-lg bg-devcard-base/50 border border-devcard-border">
                  <Trophy className="h-6 w-6 text-devcard-green mb-2" />
                  <div className="text-sm font-bold text-devcard-heading">
                    {Math.ceil(
                      (new Date(upcomingHackathon.submission_deadline_at).getTime() -
                        new Date(upcomingHackathon.start_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} Days
                  </div>
                  <div className="text-xs text-devcard-text">To Build</div>
                </div>
              </div>

              {/* Terminal-style stats */}
              <div className="mb-8 p-4 rounded-lg bg-devcard-base border border-devcard-green/30 font-mono text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-devcard-green">$</span>
                  <span className="text-devcard-text">hackathon --info</span>
                </div>
                <div className="pl-4 space-y-1 text-devcard-text/70">
                  <div>
                    <span className="text-devcard-green">1st place:</span> ${prizes.first}
                  </div>
                  <div>
                    <span className="text-devcard-green">2nd place:</span> ${prizes.second}
                  </div>
                  <div>
                    <span className="text-devcard-green">3rd place:</span> ${prizes.third}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-devcard-green hover:bg-devcard-green/90 text-black font-bold rounded-full px-8"
                >
                  <Link href={`/hackathons/${upcomingHackathon.slug}`}>
                    {phase === 'registration' ? 'Register Now' : 'View Details'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </MagicCard>
        </div>
      </AnimationContainer>
    </MaxWidthWrapper>
  );
}
