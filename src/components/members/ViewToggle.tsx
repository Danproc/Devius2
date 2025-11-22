import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-[#121824] bg-[#0a0f1a] p-1 gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={`h-8 px-3 ${
          viewMode === 'grid'
            ? 'bg-devcard-green text-black hover:bg-devcard-green/90'
            : 'text-devcard-text hover:text-devcard-green hover:bg-devcard-green/10'
        }`}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={`h-8 px-3 ${
          viewMode === 'list'
            ? 'bg-devcard-green text-black hover:bg-devcard-green/90'
            : 'text-devcard-text hover:text-devcard-green hover:bg-devcard-green/10'
        }`}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
