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
    <aside className="w-64 flex-shrink-0 space-y-6 bg-[#0a0f1a] border border-[#121824] rounded-lg p-5 h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-devcard-heading">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 px-2 text-xs text-devcard-green hover:text-devcard-green/80 hover:bg-devcard-green/10"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-devcard-text">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-devcard-text/50" />
          <Input
            id="search"
            type="search"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-[#04080f] border-[#121824] text-devcard-text placeholder:text-devcard-text/40 focus:border-devcard-green focus:ring-devcard-green/20"
            aria-label="Search members by name or username"
          />
        </div>
      </div>

      {/* Location */}
      {filterOptions && filterOptions.locations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-devcard-text">Location</Label>
          <select
            value={location || ''}
            onChange={(e) => onLocationChange(e.target.value || null)}
            className="w-full rounded-md border border-[#121824] bg-[#04080f] text-devcard-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-devcard-green/20 focus:border-devcard-green"
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
          <Label className="text-devcard-text">Tech Stack</Label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-[#121824] rounded-md p-3 bg-[#04080f]">
            {filterOptions.technologies.slice(0, 30).map((tech) => (
              <div key={tech} className="flex items-center space-x-2">
                <Checkbox
                  id={`tech-${tech}`}
                  checked={techStack.includes(tech)}
                  onCheckedChange={() => handleTechToggle(tech)}
                />
                <label
                  htmlFor={`tech-${tech}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-devcard-text"
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
                  className="inline-flex items-center gap-1 bg-devcard-green/20 text-devcard-green border border-devcard-green/30 px-2 py-1 rounded text-xs"
                >
                  {tech}
                  <button
                    onClick={() => handleTechToggle(tech)}
                    className="hover:text-red-400 transition-colors"
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
        <div className="flex items-center space-x-2 p-3 border border-[#121824] rounded-md bg-[#04080f] hover:bg-devcard-green/5 transition-colors">
          <Checkbox
            id="winners-only"
            checked={winnersOnly}
            onCheckedChange={(checked) => onWinnersOnlyChange(checked as boolean)}
            className="border-devcard-green/40 data-[state=checked]:bg-devcard-green data-[state=checked]:border-devcard-green"
          />
          <label
            htmlFor="winners-only"
            className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-devcard-text"
          >
            Hackathon Winners Only 🏆
          </label>
        </div>
      </div>

      {/* Achievement Types (optional - show if available) */}
      {filterOptions && filterOptions.achievement_types.length > 0 && (
        <div className="space-y-2">
          <Label className="text-devcard-text">Achievements</Label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-[#121824] rounded-md p-3 bg-[#04080f]">
            {filterOptions.achievement_types.slice(0, 20).map((achievement) => (
              <div key={achievement} className="flex items-center space-x-2">
                <Checkbox
                  id={`achievement-${achievement}`}
                  checked={achievementTypes.includes(achievement)}
                  onCheckedChange={() => handleAchievementToggle(achievement)}
                />
                <label
                  htmlFor={`achievement-${achievement}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-devcard-text"
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
