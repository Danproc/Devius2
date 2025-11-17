/**
 * Hackathon Judging Interface (Admin)
 * Review submissions and declare winners
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/middleware/admin-auth';
import { getHackathonById } from '@/lib/hackathons/queries';
import { JudgingTable } from '@/components/hackathons/JudgingTable';
import { WinnerSelector } from '@/components/hackathons/WinnerSelector';

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

  // Fetch submissions via API (will be fetched client-side by components)

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-devcard-heading">Judging: {hackathon.title}</h1>
          <p className="text-devcard-text mt-2">
            Review submissions and select winners
          </p>
        </div>

        <div className="space-y-8">
          {/* Submissions Table */}
          <JudgingTable hackathonId={hackathon.id} />

          {/* Winner Selection */}
          {hackathon.status === 'voting' && (
            <WinnerSelector hackathonId={hackathon.id} />
          )}
        </div>
      </div>
    </div>
  );
}
