import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search } from 'lucide-react';

interface MemberDirectoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  location: string | null;
  onLocationChange: (value: string | null) => void;
  techStack: string[];
  onTechStackChange: (value: string[]) => void;
  achievementTypes: string[];
  onAchievementTypesChange: (value: string[]) => void;
  winnersOnly: boolean;
  onWinnersOnlyChange: (value: boolean) => void;
  filterOptions?: {
    locations: string[];
    technologies: string[];
    achievement_types: string[];
  };
}

export function MemberDirectoryFilters({
  search,
  onSearchChange,
  location,
  onLocationChange,
  techStack,
  onTechStackChange,
  achievementTypes,
  onAchievementTypesChange,
  winnersOnly,
  onWinnersOnlyChange,
  filterOptions,
}: MemberDirectoryFiltersProps) {
  const hasActiveFilters = search || location || techStack.length > 0 || achievementTypes.length > 0 || winnersOnly;

  const handleClearAll = () => {
    onSearchChange('');
    onLocationChange(null);
    onTechStackChange([]);
    onAchievementTypesChange([]);
    onWinnersOnlyChange(false);
  };

  const handleTechToggle = (tech: string) => {
    if (techStack.includes(tech)) {
      onTechStackChange(techStack.filter(t => t !== tech));
    } else {
      onTechStackChange([...techStack, tech]);
    }
  };

  const handleAchievementToggle = (achievement: string) => {
    if (achievementTypes.includes(achievement)) {
      onAchievementTypesChange(achievementTypes.filter(a => a !== achievement));
    } else {
      onAchievementTypesChange([...achievementTypes, achievement]);
    }
  };

  return (
    <div className="w-64 flex-shrink-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 px-2 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search members by name or username"
          />
        </div>
      </div>

      {/* Location */}
      {filterOptions && filterOptions.locations.length > 0 && (
        <div className="space-y-2">
          <Label>Location</Label>
          <select
            value={location || ''}
            onChange={(e) => onLocationChange(e.target.value || null)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter by location"
          >
            <option value="">All locations</option>
            {filterOptions.locations.slice(0, 50).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tech Stack */}
      {filterOptions && filterOptions.technologies.length > 0 && (
        <div className="space-y-2">
          <Label>Tech Stack</Label>
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
            {filterOptions.technologies.slice(0, 30).map((tech) => (
              <div key={tech} className="flex items-center space-x-2">
                <Checkbox
                  id={`tech-${tech}`}
                  checked={techStack.includes(tech)}
                  onCheckedChange={() => handleTechToggle(tech)}
                />
                <label
                  htmlFor={`tech-${tech}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tech}
                </label>
              </div>
            ))}
          </div>
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                >
                  {tech}
                  <button
                    onClick={() => handleTechToggle(tech)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Winners Only */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="winners-only"
            checked={winnersOnly}
            onCheckedChange={(checked) => onWinnersOnlyChange(checked as boolean)}
          />
          <label
            htmlFor="winners-only"
            className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Hackathon Winners Only
          </label>
        </div>
      </div>

      {/* Achievement Types (optional - show if available) */}
      {filterOptions && filterOptions.achievement_types.length > 0 && (
        <div className="space-y-2">
          <Label>Achievements</Label>
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
            {filterOptions.achievement_types.slice(0, 20).map((achievement) => (
              <div key={achievement} className="flex items-center space-x-2">
                <Checkbox
                  id={`achievement-${achievement}`}
                  checked={achievementTypes.includes(achievement)}
                  onCheckedChange={() => handleAchievementToggle(achievement)}
                />
                <label
                  htmlFor={`achievement-${achievement}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {achievement.replace(/_/g, ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
