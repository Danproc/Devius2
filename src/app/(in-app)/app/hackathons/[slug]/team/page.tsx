/**
 * Team Builder Page
 * Create and manage team for hackathon
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHackathonBySlug, getUserTeam } from '@/lib/hackathons/queries';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamBuilder } from '@/components/hackathons/TeamBuilder';

export default async function TeamBuilderPage({
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

  // Check if hackathon allows team formation (registration or active phase)
  if (hackathon.status !== 'active' && hackathon.status !== 'registration') {
    redirect(`/hackathons/${hackathon.slug}`);
  }

  // Get user's team (if any)
  const userTeam = await getUserTeam(hackathon.id, session.user.id);

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-devcard-heading">Team Builder</h1>
            <Badge className="bg-devcard-green">{hackathon.title}</Badge>
          </div>
          {hackathon.theme && (
            <p className="text-lg text-devcard-text">{hackathon.theme}</p>
          )}
        </div>

        {/* Team Builder */}
        <Card className="border-devcard-border bg-devcard-base">
          <CardHeader>
            <CardTitle className="text-devcard-heading">
              {userTeam ? 'Manage Your Team' : 'Create Your Team'}
            </CardTitle>
            <CardDescription className="text-devcard-text">
              {userTeam
                ? 'Invite other registered participants to join your team (max 5 members total)'
                : 'Create a team and invite up to 4 other registered participants'}
            </CardDescription>
          </CardHeader>
          <TeamBuilder
            hackathonId={hackathon.id}
            hackathonSlug={hackathon.slug}
            existingTeam={userTeam}
            userId={session.user.id}
          />
        </Card>
      </div>
    </div>
  );
}
