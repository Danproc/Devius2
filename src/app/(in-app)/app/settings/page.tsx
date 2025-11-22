"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch current user's devcard to get is_public status
  const { data: userDevcard } = useSWR('/api/me/devcard', fetcher);

  // Initialize isPublic from API data
  useEffect(() => {
    if (userDevcard?.is_public !== undefined) {
      setIsPublic(userDevcard.is_public);
    }
  }, [userDevcard]);

  const handlePrivacyToggle = async (checked: boolean) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: checked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      const data = await response.json();
      setIsPublic(data.is_public);

      setStatusMessage(
        checked
          ? 'Your profile is now visible in the member directory'
          : 'Your profile has been hidden from the member directory'
      );
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error updating privacy:', error);
      setStatusMessage('Failed to update privacy settings. Please try again.');
      setTimeout(() => setStatusMessage(null), 3000);
      // Revert the toggle
      setIsPublic(!checked);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Privacy</h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 max-w-lg">
              <Label htmlFor="directory-visibility" className="text-base">
                Show in Member Directory
              </Label>
              <p className="text-sm text-muted-foreground">
                Control whether your profile appears in the public member directory.
                When enabled, other members can discover and view your profile.
              </p>
            </div>
            <Switch
              id="directory-visibility"
              checked={isPublic}
              onCheckedChange={handlePrivacyToggle}
              disabled={isSaving}
            />
          </div>

          {/* Status message */}
          {statusMessage && (
            <div className="mt-4 p-3 bg-secondary rounded-md text-sm">
              {statusMessage}
            </div>
          )}
        </Card>

        {/* Future settings sections can be added here */}
      </div>
    </div>
  );
}
