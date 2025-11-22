/**
 * Hackathon Judging Interface (Admin)
 * Review submissions and declare winners
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/middleware/admin-auth';
import { getHackathonById } from '@/lib/hackathons/queries';
import { JudgingTable } from '@/components/hackathons/JudgingTable';
import { WinnerSelector } from '@/components/hackathons/WinnerSelector';
import { getHackathonPhase } from '@/lib/hackathons/validations';

export default async function JudgingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) {
    redirect('/app/dashboard');
  }

  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    redirect('/admin/hackathons');
  }

  // Compute actual phase based on dates (status overrides if completed)
  const actualPhase = getHackathonPhase(
    hackathon.registration_start_at ? new Date(hackathon.registration_start_at) : null,
    hackathon.registration_end_at ? new Date(hackathon.registration_end_at) : null,
    new Date(hackathon.start_at),
    new Date(hackathon.submission_deadline_at),
    hackathon.voting_start_at ? new Date(hackathon.voting_start_at) : null,
    hackathon.voting_end_at ? new Date(hackathon.voting_end_at) : null,
    hackathon.status
  );

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-devcard-heading">
            {actualPhase === 'voting' || actualPhase === 'completed' ? 'Judging' : 'Submissions'}: {hackathon.title}
          </h1>
          <p className="text-devcard-text mt-2">
            {actualPhase === 'voting' || actualPhase === 'completed'
              ? 'Review submissions and select winners'
              : 'View all project submissions'}
          </p>
        </div>

        <div className="space-y-8">
          {/* Submissions Table - Always show during active, voting, or completed */}
          <JudgingTable hackathonId={hackathon.id} />

          {/* Winner Selection - Only show during voting or after */}
          {(actualPhase === 'voting' || actualPhase === 'completed') && (
            <WinnerSelector hackathonId={hackathon.id} />
          )}
        </div>
      </div>
    </div>
  );
}
