'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

const POPULAR_TECHS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Python',
  'TailwindCSS',
  'PostgreSQL',
  'MongoDB',
  'Vue',
  'Docker',
];

export function GalleryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTech = searchParams.get('tech') || '';

  const [searchTerm, setSearchTerm] = useState('');

  const handleTechFilter = (tech: string) => {
    const params = new URLSearchParams(searchParams);
    if (tech === currentTech) {
      // Remove filter if clicking the same tech
      params.delete('tech');
    } else {
      params.set('tech', tech);
    }
    params.delete('page'); // Reset to page 1
    router.push(`/gallery?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const params = new URLSearchParams(searchParams);
    params.set('tech', searchTerm);
    params.delete('page');
    router.push(`/gallery?${params.toString()}`);
    setSearchTerm('');
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tech');
    params.delete('page');
    router.push(`/gallery?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by technology..."
          className="border-devcard-border bg-devcard-base text-devcard-heading"
        />
        <Button
          type="submit"
          variant="outline"
          className="border-devcard-border"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Active Filter */}
      {currentTech && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-devcard-text">Filtered by:</span>
          <Badge className="bg-devcard-green text-black">
            {currentTech}
            <button
              onClick={clearFilter}
              className="ml-2 hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Popular Techs */}
      <div>
        <h3 className="text-sm font-semibold text-devcard-heading mb-3">
          Popular Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TECHS.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className={`cursor-pointer transition-colors ${
                tech === currentTech
                  ? 'bg-devcard-green text-black border-devcard-green'
                  : 'border-devcard-border text-devcard-text hover:border-devcard-green hover:text-devcard-green'
              }`}
              onClick={() => handleTechFilter(tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
