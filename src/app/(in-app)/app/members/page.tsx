"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { MembersSearchResponse } from '@/lib/members/types';
import { MemberDirectoryGrid } from '@/components/members/MemberDirectoryGrid';
import { MemberDirectoryList } from '@/components/members/MemberDirectoryList';
import { MemberDirectoryFilters } from '@/components/members/MemberDirectoryFilters';
import { ViewToggle } from '@/components/members/ViewToggle';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { buildQueryParams } from '@/lib/members/filters';
import { useDebounce } from '@/hooks/use-debounce';
import { RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MembersPage() {
  // Pagination state
  const [page, setPage] = useState(1);

  // Filter state
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [techStackFilter, setTechStackFilter] = useState<string[]>([]);
  const [achievementTypesFilter, setAchievementTypesFilter] = useState<string[]>([]);
  const [winnersOnly, setWinnersOnly] = useState(false);

  // View mode state with localStorage (T021)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memberDirectoryView');
      return (saved as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });

  // Handle view mode change with localStorage persistence (T021)
  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewMode(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem('memberDirectoryView', newView);
    }
  };

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, locationFilter, techStackFilter, achievementTypesFilter, winnersOnly]);

  // Build query params
  const queryString = buildQueryParams(
    {
      search: debouncedSearch,
      location: locationFilter,
      tech_stack: techStackFilter,
      achievement_types: achievementTypesFilter,
      winners_only: winnersOnly,
    },
    page,
    20
  );

  // Fetch data with SWR
  const { data, isLoading, error, mutate } = useSWR<MembersSearchResponse>(
    `/api/members?${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const handleRetry = () => {
    mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Member Directory</h1>
        <p className="text-muted-foreground mt-2">
          Discover and connect with the StackPass community
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <MemberDirectoryFilters
          search={search}
          onSearchChange={setSearch}
          location={locationFilter}
          onLocationChange={setLocationFilter}
          techStack={techStackFilter}
          onTechStackChange={setTechStackFilter}
          achievementTypes={achievementTypesFilter}
          onAchievementTypesChange={setAchievementTypesFilter}
          winnersOnly={winnersOnly}
          onWinnersOnlyChange={setWinnersOnly}
          filterOptions={data?.filters}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Member count and view toggle (T022) */}
          {data && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {data.members.length} of {data.pagination.total} members
              </div>
              <ViewToggle viewMode={viewMode} onViewModeChange={handleViewChange} />
            </div>
          )}

          {/* Error state (T028) */}
          {error && (
            <div className="text-center py-12 border rounded-lg p-8">
              <p className="text-destructive text-lg font-semibold">Failed to load members</p>
              <p className="text-sm text-muted-foreground mt-2">
                There was an error loading the member directory. Please try again.
              </p>
              <Button
                onClick={handleRetry}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Member display - conditional render based on view mode */}
          {!error && (
            <>
              {viewMode === 'grid' ? (
                <MemberDirectoryGrid members={data?.members || []} isLoading={isLoading} />
              ) : (
                <MemberDirectoryList members={data?.members || []} isLoading={isLoading} />
              )}

              {/* Pagination */}
              {data && data.pagination.pageCount > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    page={data.pagination.currentPage}
                    pageSize={data.pagination.perPage}
                    total={data.pagination.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
