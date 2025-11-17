/**
 * Admin Hackathons List Page
 * Lists all hackathons with create/edit/judge actions
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/middleware/admin-auth';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Users, Trophy } from 'lucide-react';

export default async function AdminHackathonsPage() {
  // Check admin authorization
  const admin = await isAdmin();
  if (!admin) {
    redirect('/app/dashboard');
  }

  // Fetch all hackathons
  const allHackathons = await db
    .select()
    .from(hackathons)
    .orderBy(desc(hackathons.created_at));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'upcoming': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'voting': return 'bg-yellow-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-devcard-heading">Hackathon Management</h1>
            <p className="text-devcard-text mt-2">Create and manage StackPass hackathons</p>
          </div>
          <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full">
            <Link href="/admin/hackathons/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Hackathon
            </Link>
          </Button>
        </div>

      {allHackathons.length === 0 ? (
        <Card className="border-devcard-border bg-devcard-base">
          <CardContent className="py-16 text-center">
            <Trophy className="h-16 w-16 text-devcard-green mx-auto mb-4" />
            <h3 className="text-xl font-bold text-devcard-heading mb-2">No hackathons yet</h3>
            <p className="text-devcard-text mb-6">Create your first hackathon to get started</p>
            <Button asChild className="bg-devcard-green hover:bg-devcard-green/90 text-black">
              <Link href="/admin/hackathons/new">Create Hackathon</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="border-devcard-border bg-devcard-base">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-devcard-heading">{hackathon.title}</CardTitle>
                      <Badge className={getStatusColor(hackathon.status)}>
                        {hackathon.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-devcard-text">
                      {hackathon.theme || 'No theme specified'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-devcard-border text-devcard-heading"
                    >
                      <Link href={`/admin/hackathons/${hackathon.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    {(hackathon.status === 'voting' || hackathon.status === 'active') && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-devcard-green text-devcard-green"
                      >
                        <Link href={`/admin/hackathons/${hackathon.id}/judging`}>
                          <Users className="mr-2 h-4 w-4" />
                          Judge
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-devcard-text">Start Date</div>
                    <div className="text-devcard-heading font-medium">
                      {new Date(hackathon.start_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-devcard-text">Deadline</div>
                    <div className="text-devcard-heading font-medium">
                      {new Date(hackathon.submission_deadline_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-devcard-text">Prize Pool</div>
                    <div className="text-devcard-heading font-medium">
                      ${(hackathon.prizes as any).first + (hackathon.prizes as any).second + (hackathon.prizes as any).third}
                    </div>
                  </div>
                  <div>
                    <div className="text-devcard-text">Slug</div>
                    <div className="text-devcard-heading font-mono text-xs">
                      /{hackathon.slug}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
