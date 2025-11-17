/**
 * Edit Hackathon Page (Admin)
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/middleware/admin-auth';
import { getHackathonById } from '@/lib/hackathons/queries';
import { HackathonForm } from '@/components/hackathons/HackathonForm';

export default async function EditHackathonPage({
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

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-devcard-heading">Edit Hackathon</h1>
          <p className="text-devcard-text mt-2">{hackathon.title}</p>
        </div>

        <HackathonForm hackathon={hackathon} mode="edit" />
      </div>
    </div>
  );
}
