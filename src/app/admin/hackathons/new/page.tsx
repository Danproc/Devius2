/**
 * Create New Hackathon Page (Admin)
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/middleware/admin-auth';
import { HackathonForm } from '@/components/hackathons/HackathonForm';

export default async function NewHackathonPage() {
  const admin = await isAdmin();
  if (!admin) {
    redirect('/app/dashboard');
  }

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-devcard-heading">Create Hackathon</h1>
          <p className="text-devcard-text mt-2">Set up a new coding competition for Pro members</p>
        </div>

        <HackathonForm mode="create" />
      </div>
    </div>
  );
}
