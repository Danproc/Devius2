'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Popular tech stack options
const POPULAR_TECH_STACK = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'C++',
  'C#',
  '.NET',
  'Vue.js',
  'Angular',
  'Svelte',
  'Express',
  'NestJS',
  'FastAPI',
  'Django',
  'Flask',
  'Spring Boot',
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'GraphQL',
  'REST API',
  'TailwindCSS',
  'SASS',
  'Git',
  'CI/CD',
];

interface TechStackPickerProps {
  value: string[];
  onChange: (techStack: string[]) => void;
  maxItems?: number;
  allowCustom?: boolean;
  label?: string;
  description?: string;
  showCount?: boolean;
}

export function TechStackPicker({
  value = [],
  onChange,
  maxItems = 20,
  allowCustom = true,
  label = 'Tech Stack',
  description,
  showCount = true,
}: TechStackPickerProps) {
  const [customTechInput, setCustomTechInput] = useState('');

  const handleToggleTech = (tech: string) => {
    if (value.includes(tech)) {
      // Remove tech
      onChange(value.filter((t) => t !== tech));
    } else {
      // Add tech
      if (value.length >= maxItems) {
        toast.error(`Maximum ${maxItems} technologies allowed`);
        return;
      }
      onChange([...value, tech]);
    }
  };

  const handleAddCustomTech = () => {
    const trimmed = customTechInput.trim();

    if (!trimmed) {
      toast.error('Please enter a technology name');
      return;
    }

    if (value.includes(trimmed)) {
      toast.error('This technology is already added');
      return;
    }

    if (value.length >= maxItems) {
      toast.error(`Maximum ${maxItems} technologies allowed`);
      return;
    }

    onChange([...value, trimmed]);
    setCustomTechInput('');
    toast.success(`Added ${trimmed}`);
  };

  const handleRemoveTech = (tech: string) => {
    onChange(value.filter((t) => t !== tech));
  };

  // Separate predefined and custom tech
  const predefinedTech = value.filter((tech) => POPULAR_TECH_STACK.includes(tech));
  const customTech = value.filter((tech) => !POPULAR_TECH_STACK.includes(tech));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Label className="text-sm text-devcard-heading font-semibold">
          {label}
          {showCount && ` (${value.length}/${maxItems})`}
        </Label>
        {description && (
          <p className="text-xs text-devcard-text mt-1">{description}</p>
        )}
      </div>

      {/* Selected Technologies - Pills/badges display */}
      {value.length > 0 && (
        <div className="space-y-3">
          {/* Predefined Tech */}
          {predefinedTech.length > 0 && (
            <div>
              <Label className="text-xs text-devcard-text mb-2 block">Selected</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-devcard-border/30 border border-devcard-border">
                {predefinedTech.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="bg-devcard-green/10 text-devcard-green hover:bg-devcard-green/20 border-devcard-green/20"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Tech */}
          {customTech.length > 0 && (
            <div>
              <Label className="text-xs text-devcard-text mb-2 block">Custom</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-blue-950/30 border border-blue-800/50">
                {customTech.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Popular Technologies */}
      <div>
        <Label className="text-sm text-devcard-text mb-2 block">
          Popular Technologies
        </Label>
        <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 rounded-lg border border-devcard-border bg-devcard-base/50">
          {POPULAR_TECH_STACK.map((tech) => {
            const isSelected = value.includes(tech);
            return (
              <Badge
                key={tech}
                variant="outline"
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-devcard-green/10 border-devcard-green text-devcard-green'
                    : 'border-devcard-border text-devcard-text hover:bg-devcard-border/50 hover:text-devcard-heading'
                }`}
                onClick={() => handleToggleTech(tech)}
              >
                {tech}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Add Custom Technology */}
      {allowCustom && (
        <div>
          <Label className="text-sm text-devcard-text mb-2 block">
            Add Custom Technology
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter technology name"
              value={customTechInput}
              onChange={(e) => setCustomTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTech();
                }
              }}
              maxLength={50}
              className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddCustomTech}
              disabled={!customTechInput.trim() || value.length >= maxItems}
              className="border-devcard-border hover:bg-devcard-border/50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-devcard-text mt-1">
            Can't find your tech? Add it as a custom tag
          </p>
        </div>
      )}
    </div>
  );
}
