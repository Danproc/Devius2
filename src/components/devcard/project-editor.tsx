'use client';

import React, { useState, useEffect } from 'react';
import { CustomProject } from '@/types/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TechStackPicker } from './tech-stack-picker';
import { Loader2, Github, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectEditorProps {
  project?: Partial<CustomProject>;
  onSave: (project: Partial<CustomProject>) => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function ProjectEditor({
  project,
  onSave,
  onCancel,
  isNew = false,
}: ProjectEditorProps) {
  const [formData, setFormData] = useState<Partial<CustomProject>>({
    title: project?.title || '',
    description: project?.description || '',
    projectUrl: project?.projectUrl || '',
    githubUrl: project?.githubUrl || '',
    techStack: project?.techStack || [],
    stars: project?.stars,
    forks: project?.forks,
    language: project?.language,
  });

  const [isFetchingGitHub, setIsFetchingGitHub] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (formData.projectUrl && !isValidUrl(formData.projectUrl)) {
      newErrors.projectUrl = 'Must be a valid URL';
    }

    if (formData.githubUrl && !isValidGitHubUrl(formData.githubUrl)) {
      newErrors.githubUrl = 'Must be a valid GitHub repository URL';
    }

    if (!formData.techStack || formData.techStack.length === 0) {
      newErrors.techStack = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidGitHubUrl = (url: string): boolean => {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return regex.test(url);
  };

  const handleFetchGitHubData = async () => {
    if (!formData.githubUrl) {
      toast.error('Please enter a GitHub URL first');
      return;
    }

    if (!isValidGitHubUrl(formData.githubUrl)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    setIsFetchingGitHub(true);

    try {
      const response = await fetch('/api/projects/fetch-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: formData.githubUrl }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to fetch GitHub data');
        return;
      }

      // Auto-populate fields
      setFormData((prev) => ({
        ...prev,
        title: prev.title || result.data.title,
        description: prev.description || result.data.description,
        stars: result.data.stars,
        forks: result.data.forks,
        language: result.data.language,
        techStack: prev.techStack?.length
          ? prev.techStack
          : result.data.suggestedTechStack,
      }));

      toast.success('GitHub data fetched successfully!');
    } catch (error: any) {
      console.error('Error fetching GitHub data:', error);
      toast.error('Failed to fetch GitHub data');
    } finally {
      setIsFetchingGitHub(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    onSave(formData);
  };

  return (
    <div>
      <Card className="bg-devcard-base border-devcard-border">
        <CardHeader>
          <CardTitle className="text-devcard-heading">
            {isNew ? 'Add New Project' : 'Edit Project'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub URL with Auto-Fetch */}
          <div>
            <Label className="text-devcard-heading">
              GitHub Repository URL (Optional)
            </Label>
            <div className="flex gap-2 mt-1">
              <div className="flex-1">
                <Input
                  placeholder="https://github.com/owner/repo"
                  value={formData.githubUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                  className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text"
                />
                {errors.githubUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.githubUrl}</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchGitHubData}
                disabled={isFetchingGitHub || !formData.githubUrl}
                className="border-devcard-border hover:bg-devcard-border/50"
              >
                {isFetchingGitHub ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                <span className="ml-2">Auto-Fill</span>
              </Button>
            </div>
            <p className="text-xs text-devcard-text mt-1">
              Add a GitHub URL to auto-populate project details
            </p>
          </div>

          {/* Title */}
          <div>
            <Label className="text-devcard-heading">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="My Awesome Project"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
              className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text mt-1"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
            <p className="text-xs text-devcard-text mt-1">
              {formData.title?.length || 0}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <Label className="text-devcard-heading">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Describe your project..."
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={500}
              rows={4}
              className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text mt-1"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-devcard-text mt-1">
              {formData.description?.length || 0}/500 characters
            </p>
          </div>

          {/* Project URL */}
          <div>
            <Label className="text-devcard-heading">Project URL (Optional)</Label>
            <div className="relative mt-1">
              <Input
                placeholder="https://myproject.com"
                value={formData.projectUrl || ''}
                onChange={(e) =>
                  setFormData({ ...formData, projectUrl: e.target.value })
                }
                className="bg-devcard-base border-devcard-border text-devcard-heading placeholder:text-devcard-text pr-10"
              />
              {formData.projectUrl && (
                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-devcard-text" />
              )}
            </div>
            {errors.projectUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.projectUrl}</p>
            )}
            <p className="text-xs text-devcard-text mt-1">
              Link to live demo, documentation, or landing page
            </p>
          </div>

          {/* GitHub Stats (if available) */}
          {(formData.stars !== undefined || formData.forks !== undefined) && (
            <div className="p-3 rounded-lg bg-devcard-border/30 border border-devcard-border">
              <Label className="text-xs text-devcard-text block mb-2">
                GitHub Stats
              </Label>
              <div className="flex gap-4 text-sm">
                {formData.stars !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-devcard-text">⭐</span>
                    <span className="text-devcard-heading font-semibold">
                      {formData.stars.toLocaleString()}
                    </span>
                    <span className="text-devcard-text">stars</span>
                  </div>
                )}
                {formData.forks !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-devcard-text">🍴</span>
                    <span className="text-devcard-heading font-semibold">
                      {formData.forks.toLocaleString()}
                    </span>
                    <span className="text-devcard-text">forks</span>
                  </div>
                )}
                {formData.language && (
                  <div className="flex items-center gap-1">
                    <span className="text-devcard-text">•</span>
                    <span className="text-devcard-heading">{formData.language}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tech Stack Picker */}
          <div>
            <TechStackPicker
              value={formData.techStack || []}
              onChange={(techStack) => setFormData({ ...formData, techStack })}
              maxItems={20}
              allowCustom={true}
              label="Tech Stack"
              description="Select technologies used in this project"
              showCount={true}
            />
            {errors.techStack && (
              <p className="text-xs text-red-500 mt-1">{errors.techStack}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-devcard-green hover:bg-devcard-green/90 text-black"
            >
              {isNew ? 'Add Project' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-devcard-border hover:bg-devcard-border/50"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
