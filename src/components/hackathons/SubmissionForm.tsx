'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Globe, Video, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { HackathonSubmission } from '@/db/schema/hackathon-submissions';

interface SubmissionFormProps {
  hackathonId: string;
  existingSubmission?: HackathonSubmission;
  onSuccess?: () => void;
}

export function SubmissionForm({ hackathonId, existingSubmission, onSuccess }: SubmissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [techStackInput, setTechStackInput] = useState('');

  const [formData, setFormData] = useState({
    project_title: existingSubmission?.project_title || '',
    description: existingSubmission?.description || '',
    github_url: existingSubmission?.github_url || '',
    demo_url: existingSubmission?.demo_url || '',
    video_url: existingSubmission?.video_url || '',
    tech_stack: (existingSubmission?.tech_stack as string[]) || [],
  });

  const handleAddTechTag = () => {
    const trimmed = techStackInput.trim();
    if (!trimmed) return;

    if (trimmed.length < 2 || trimmed.length > 30) {
      toast.error('Tech tags must be 2-30 characters');
      return;
    }

    if (formData.tech_stack.length >= 10) {
      toast.error('Maximum 10 tech tags allowed');
      return;
    }

    if (formData.tech_stack.includes(trimmed)) {
      toast.error('Tag already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tech_stack: [...prev.tech_stack, trimmed],
    }));
    setTechStackInput('');
  };

  const handleRemoveTechTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.project_title.trim()) {
        toast.error('Project title is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Description is required');
        setLoading(false);
        return;
      }

      if (!formData.github_url.trim()) {
        toast.error('GitHub URL is required');
        setLoading(false);
        return;
      }

      if (formData.tech_stack.length === 0) {
        toast.error('Add at least one tech tag');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        status,
      };

      let response;

      if (existingSubmission) {
        // Update existing submission
        response = await fetch(`/api/hackathons/submissions/${existingSubmission.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new submission
        response = await fetch(`/api/hackathons/${hackathonId}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save submission');
      }

      if (status === 'submitted') {
        toast.success('Submission entered successfully!');
      } else {
        toast.success('Draft saved');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/app/hackathons/${hackathonId}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error saving submission:', error);
      toast.error(error.message || 'Failed to save submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div className="space-y-2">
        <Label htmlFor="project_title" className="text-devcard-heading">
          Project Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="project_title"
          value={formData.project_title}
          onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
          placeholder="My Awesome Project"
          maxLength={100}
          className="border-devcard-border bg-devcard-base text-devcard-heading"
        />
        <p className="text-xs text-devcard-text">
          {formData.project_title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-devcard-heading">
          Project Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project, what it does, and how it relates to the hackathon theme..."
          rows={8}
          maxLength={5000}
          className="border-devcard-border bg-devcard-base text-devcard-heading"
        />
        <p className="text-xs text-devcard-text">
          {formData.description.length}/5000 characters
        </p>
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="github_url" className="text-devcard-heading">
          <Github className="inline h-4 w-4 mr-1" />
          GitHub Repository <span className="text-red-500">*</span>
        </Label>
        <Input
          id="github_url"
          type="url"
          value={formData.github_url}
          onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
          placeholder="https://github.com/username/repo"
          className="border-devcard-border bg-devcard-base text-devcard-heading"
        />
        <p className="text-xs text-devcard-text">
          Must be a valid GitHub repository URL
        </p>
      </div>

      {/* Demo URL */}
      <div className="space-y-2">
        <Label htmlFor="demo_url" className="text-devcard-heading">
          <Globe className="inline h-4 w-4 mr-1" />
          Demo URL (optional)
        </Label>
        <Input
          id="demo_url"
          type="url"
          value={formData.demo_url}
          onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
          placeholder="https://my-project.vercel.app"
          className="border-devcard-border bg-devcard-base text-devcard-heading"
        />
        <p className="text-xs text-devcard-text">
          Live demo or deployment link
        </p>
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="video_url" className="text-devcard-heading">
          <Video className="inline h-4 w-4 mr-1" />
          Video Demo URL (optional)
        </Label>
        <Input
          id="video_url"
          type="url"
          value={formData.video_url}
          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="border-devcard-border bg-devcard-base text-devcard-heading"
        />
        <p className="text-xs text-devcard-text">
          YouTube, Vimeo, or Loom link
        </p>
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label htmlFor="tech_stack" className="text-devcard-heading">
          Tech Stack <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="tech_stack"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTechTag();
              }
            }}
            placeholder="React, TypeScript, Next.js..."
            maxLength={30}
            className="border-devcard-border bg-devcard-base text-devcard-heading"
          />
          <Button
            type="button"
            onClick={handleAddTechTag}
            variant="outline"
            size="icon"
            className="border-devcard-border"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tech_stack.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-devcard-green/20 text-devcard-green border-devcard-green/30"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTechTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-devcard-text">
          Add 1-10 technologies used ({formData.tech_stack.length}/10)
        </p>
      </div>

      {/* Action Buttons */}
      <Card className="border-devcard-green/30 bg-devcard-green/5">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              variant="outline"
              className="flex-1 border-devcard-border text-devcard-heading"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={() => handleSubmit('submitted')}
              disabled={loading}
              className="flex-1 bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
            >
              {loading ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Entry'}
            </Button>
          </div>
          <p className="text-xs text-devcard-text text-center mt-3">
            {existingSubmission
              ? 'You can edit your submission until the deadline'
              : 'Save as draft to continue later, or submit to enter the hackathon'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
