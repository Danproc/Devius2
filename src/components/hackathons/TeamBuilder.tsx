'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { HackathonTeam } from '@/db/schema/hackathon-teams';

interface TeamBuilderProps {
  hackathonId: string;
  hackathonSlug: string;
  existingTeam?: HackathonTeam;
  userId: string;
}

export function TeamBuilder({ hackathonId, hackathonSlug, existingTeam, userId }: TeamBuilderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState(existingTeam?.team_name || '');
  const [inviteUsername, setInviteUsername] = useState('');

  const handleCreateTeam = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      toast.success('Team created!');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteUsername.trim()) {
      toast.error('Enter a username');
      return;
    }

    if (!existingTeam) {
      toast.error('Create a team first');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/teams/${existingTeam.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      toast.success(`Invite sent to @${inviteUsername}!`);
      setInviteUsername('');
      router.refresh();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent className="space-y-6">
      {!existingTeam ? (
        // Create Team Form
        <>
          <div className="space-y-2">
            <Label htmlFor="team_name" className="text-devcard-heading">
              Team Name (Optional)
            </Label>
            <Input
              id="team_name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Leave empty to use project title"
              maxLength={100}
              className="border-devcard-border bg-devcard-base text-devcard-heading"
            />
            <p className="text-xs text-devcard-text">
              You can set this later when submitting your project
            </p>
          </div>

          <Button
            onClick={handleCreateTeam}
            disabled={loading}
            className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
          >
            <Users className="mr-2 h-4 w-4" />
            {loading ? 'Creating Team...' : 'Create Team'}
          </Button>

          <Alert className="border-devcard-border/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-devcard-text text-sm">
              After creating your team, you can invite up to 4 other registered participants to join.
            </AlertDescription>
          </Alert>
        </>
      ) : (
        // Manage Existing Team
        <>
          {/* Current Team Members */}
          <div>
            <h3 className="text-sm font-semibold text-devcard-heading mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members ({(existingTeam.members as any[]).length}/5)
            </h3>
            <div className="space-y-2">
              {(existingTeam.members as Array<{ user_id: string; joined_at: string }>).map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-devcard-border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-devcard-green text-black text-xs">
                        {member.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-devcard-heading text-sm">
                      {member.user_id === userId ? 'You' : 'Team Member'}
                    </span>
                  </div>
                  {member.user_id === existingTeam.creator_user_id && (
                    <Badge variant="outline" className="border-devcard-green text-devcard-green text-xs">
                      Creator
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invite Member */}
          {(existingTeam.members as any[]).length < 5 && existingTeam.creator_user_id === userId && (
            <div className="space-y-2">
              <Label htmlFor="invite_username" className="text-devcard-heading">
                Invite by Username
              </Label>
              <div className="flex gap-2">
                <Input
                  id="invite_username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="username"
                  className="border-devcard-border bg-devcard-base text-devcard-heading"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendInvite();
                    }
                  }}
                />
                <Button
                  onClick={handleSendInvite}
                  disabled={loading || !inviteUsername.trim()}
                  className="bg-devcard-green hover:bg-devcard-green/90 text-black"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-devcard-text">
                Only registered participants can be invited
              </p>
            </div>
          )}

          {/* Back to Submission */}
          <div className="pt-4 border-t border-devcard-border">
            <Button
              asChild
              variant="outline"
              className="w-full border-devcard-border"
            >
              <a href={`/app/hackathons/${hackathonSlug}/enter`}>
                Continue to Submission
              </a>
            </Button>
          </div>
        </>
      )}
    </CardContent>
  );
}
