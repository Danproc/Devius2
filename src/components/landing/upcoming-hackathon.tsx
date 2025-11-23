import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { inArray } from 'drizzle-orm';
import { UpcomingHackathonClient } from './upcoming-hackathon-client';

export async function UpcomingHackathon() {
  // Fetch next upcoming hackathon
  const [upcomingHackathon] = await db
    .select()
    .from(hackathons)
    .where(inArray(hackathons.status, ['upcoming', 'registration', 'active']))
    .orderBy(hackathons.start_at)
    .limit(1);

  if (!upcomingHackathon) {
    return null; // Don't show section if no upcoming hackathon
  }

  const prizes = upcomingHackathon.prizes as { first: number; second: number; third: number; currency?: string };
  const totalPrize = prizes.first + prizes.second + prizes.third;

  // Calculate hackathon duration in days
  const duration = Math.ceil(
    (new Date(upcomingHackathon.submission_deadline_at).getTime() -
      new Date(upcomingHackathon.start_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <UpcomingHackathonClient
      title={upcomingHackathon.title}
      slug={upcomingHackathon.slug}
      startAt={upcomingHackathon.start_at.toISOString()}
      totalPrize={totalPrize}
      duration={duration}
    />
  );
}
