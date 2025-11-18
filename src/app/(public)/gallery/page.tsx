/**
 * Public Gallery Page
 * Showcase all winning projects across hackathons
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { WinnerGrid } from '@/components/hackathons/WinnerGrid';
import { GalleryFilters } from '@/components/hackathons/GalleryFilters';

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tech?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const tech = params.tech || '';

  // Fetch winners
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const queryParams = new URLSearchParams({
    page: page.toString(),
    perPage: '20',
    ...(tech && { tech }),
  });

  const response = await fetch(`${baseUrl}/api/gallery/winners?${queryParams}`, {
    cache: 'no-store',
  });

  const data = await response.json();
  const winners = data.winners || [];

  return (
    <div className="min-h-screen bg-devcard-base">
      <div className="container mx-auto py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-10 w-10 text-devcard-green" />
            <h1 className="text-4xl font-bold text-devcard-heading">Winners Gallery</h1>
          </div>
          <p className="text-lg text-devcard-text">
            Explore award-winning projects from StackPass Hackathons
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="border-devcard-border bg-devcard-base sticky top-4">
              <CardHeader>
                <CardTitle className="text-devcard-heading text-lg">Filters</CardTitle>
                <CardDescription className="text-devcard-text">
                  Find projects by technology
                </CardDescription>
              </CardHeader>
              <div className="p-6 pt-0">
                <GalleryFilters />
              </div>
            </Card>
          </aside>

          {/* Winners Grid */}
          <main className="lg:col-span-3">
            <WinnerGrid winners={winners} />
          </main>
        </div>
      </div>
    </div>
  );
}
