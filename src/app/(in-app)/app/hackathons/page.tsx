/**
 * Hackathons Browse Page (Pro Members)
 * List active and upcoming hackathons
 */

import Link from 'next/link';
import { getActiveHackathons } from '@/lib/hackathons/queries';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { Trophy, Zap } from 'lucide-react';

export default async function HackathonsPage() {
  const hackathons = await getActiveHackathons();

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-devcard-heading flex items-center gap-3">
            <Trophy className="h-8 w-8 text-devcard-green" />
            StackPass Hackathons
          </h1>
          <p className="text-devcard-text mt-2">
            Compete in coding challenges, build projects, and earn badges
          </p>
        </div>

        {hackathons.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="h-16 w-16 text-devcard-green mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-devcard-heading mb-2">No active hackathons</h3>
            <p className="text-devcard-text">Check back soon for upcoming competitions!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
