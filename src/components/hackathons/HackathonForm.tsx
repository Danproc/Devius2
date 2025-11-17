'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Hackathon, CreateHackathonInput } from '@/types/hackathons';

interface HackathonFormProps {
  hackathon?: Hackathon;
  mode: 'create' | 'edit';
}

export function HackathonForm({ hackathon, mode }: HackathonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateHackathonInput>({
    slug: hackathon?.slug || '',
    title: hackathon?.title || '',
    theme: hackathon?.theme || '',
    description: hackathon?.description || '',
    rules: hackathon?.rules || '',
    registration_start_at: hackathon?.registration_start_at
      ? new Date(hackathon.registration_start_at).toISOString().slice(0, 16)
      : '',
    registration_end_at: hackathon?.registration_end_at
      ? new Date(hackathon.registration_end_at).toISOString().slice(0, 16)
      : '',
    start_at: hackathon?.start_at ? new Date(hackathon.start_at).toISOString().slice(0, 16) : '',
    submission_deadline_at: hackathon?.submission_deadline_at
      ? new Date(hackathon.submission_deadline_at).toISOString().slice(0, 16)
      : '',
    voting_start_at: hackathon?.voting_start_at
      ? new Date(hackathon.voting_start_at).toISOString().slice(0, 16)
      : '',
    voting_end_at: hackathon?.voting_end_at
      ? new Date(hackathon.voting_end_at).toISOString().slice(0, 16)
      : '',
    prizes: (hackathon?.prizes as any) || { currency: 'USD', first: 0, second: 0, third: 0 },
    max_participants: hackathon?.max_participants as number | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'create' ? '/api/hackathons' : `/api/hackathons/${hackathon?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.error || error.message || 'Failed to save hackathon');
      }

      toast.success(mode === 'create' ? 'Hackathon created!' : 'Hackathon updated!');
      router.push('/admin/hackathons');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving hackathon:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-devcard-border bg-devcard-base">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-devcard-heading">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
                placeholder="Build a Developer Tool"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug" className="text-devcard-heading">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                className="bg-devcard-base border-devcard-border text-devcard-heading font-mono"
                placeholder="build-a-tool-jan-2025"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="theme" className="text-devcard-heading">Theme (optional)</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="bg-devcard-base border-devcard-border text-devcard-heading"
              placeholder="CLI tools, APIs, libraries"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-devcard-heading">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-devcard-base border-devcard-border text-devcard-heading min-h-32"
              placeholder="Full hackathon description..."
              required
            />
          </div>

          <div>
            <Label htmlFor="rules" className="text-devcard-heading">Rules (optional)</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="bg-devcard-base border-devcard-border text-devcard-heading min-h-24"
              placeholder="Detailed rules and eligibility..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-devcard-border bg-devcard-base">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Dates & Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Registration Dates */}
          <div className="space-y-3 pb-4 border-b border-devcard-border">
            <h4 className="text-sm font-semibold text-devcard-green">Registration Phase (Optional)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="registration_start_at" className="text-devcard-heading">
                  Registration Start
                </Label>
                <Input
                  id="registration_start_at"
                  type="datetime-local"
                  value={formData.registration_start_at || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_start_at: e.target.value })
                  }
                  className="bg-devcard-base border-devcard-border text-devcard-heading"
                />
                <p className="text-xs text-devcard-text mt-1">
                  Leave empty to skip registration
                </p>
              </div>
              <div>
                <Label htmlFor="registration_end_at" className="text-devcard-heading">
                  Registration End
                </Label>
                <Input
                  id="registration_end_at"
                  type="datetime-local"
                  value={formData.registration_end_at || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_end_at: e.target.value })
                  }
                  className="bg-devcard-base border-devcard-border text-devcard-heading"
                />
              </div>
              <div>
                <Label htmlFor="max_participants" className="text-devcard-heading">
                  Max Participants
                </Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Unlimited"
                  className="bg-devcard-base border-devcard-border text-devcard-heading"
                  min="1"
                />
                <p className="text-xs text-devcard-text mt-1">
                  Leave empty for unlimited
                </p>
              </div>
            </div>
          </div>

          {/* Hackathon Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_at" className="text-devcard-heading">
                Hackathon Start <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_at"
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
                required
              />
            </div>
            <div>
              <Label htmlFor="submission_deadline_at" className="text-devcard-heading">
                Submission Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="submission_deadline_at"
                type="datetime-local"
                value={formData.submission_deadline_at}
                onChange={(e) => setFormData({ ...formData, submission_deadline_at: e.target.value })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voting_start_at" className="text-devcard-heading">Voting Start (optional)</Label>
              <Input
                id="voting_start_at"
                type="datetime-local"
                value={formData.voting_start_at}
                onChange={(e) => setFormData({ ...formData, voting_start_at: e.target.value })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
              />
            </div>
            <div>
              <Label htmlFor="voting_end_at" className="text-devcard-heading">Voting End (optional)</Label>
              <Input
                id="voting_end_at"
                type="datetime-local"
                value={formData.voting_end_at}
                onChange={(e) => setFormData({ ...formData, voting_end_at: e.target.value })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-devcard-border bg-devcard-base">
        <CardHeader>
          <CardTitle className="text-devcard-heading">Prizes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prize_first" className="text-devcard-heading">1st Place ($)</Label>
              <Input
                id="prize_first"
                type="number"
                value={formData.prizes.first}
                onChange={(e) => setFormData({
                  ...formData,
                  prizes: { ...formData.prizes, first: parseInt(e.target.value) || 0 }
                })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="prize_second" className="text-devcard-heading">2nd Place ($)</Label>
              <Input
                id="prize_second"
                type="number"
                value={formData.prizes.second}
                onChange={(e) => setFormData({
                  ...formData,
                  prizes: { ...formData.prizes, second: parseInt(e.target.value) || 0 }
                })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="prize_third" className="text-devcard-heading">3rd Place ($)</Label>
              <Input
                id="prize_third"
                type="number"
                value={formData.prizes.third}
                onChange={(e) => setFormData({
                  ...formData,
                  prizes: { ...formData.prizes, third: parseInt(e.target.value) || 0 }
                })}
                className="bg-devcard-base border-devcard-border text-devcard-heading"
                min="0"
              />
            </div>
          </div>

          <div className="text-sm text-devcard-text">
            Total Prize Pool: <span className="text-devcard-green font-semibold">
              ${formData.prizes.first + formData.prizes.second + formData.prizes.third}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-devcard-green hover:bg-devcard-green/90 text-black"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Hackathon' : 'Update Hackathon'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-devcard-border text-devcard-heading"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
