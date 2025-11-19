'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TeamInviteCardProps {
  invite: {
    id: string;
    status: string;
    created_at: Date | string;
  };
  team: {
    id: string;
    team_name: string | null;
    members: any[];
  };
  hackathon: {
    id: string;
    title: string;
    slug: string;
  };
  inviter: {
    id: string;
    name: string | null;
    github_username: string | null;
    image: string | null;
  };
}

export function TeamInviteCard({ invite, team, hackathon, inviter }: TeamInviteCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hackathons/teams/invites/${invite.id}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite');
      }

      toast.success('Invite accepted! You are now part of the team.');
      router.refresh();
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hackathons/teams/invites/${invite.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invite');
      }

      toast.success('Invite declined');
      router.refresh();
    } catch (error: any) {
      console.error('Error declining invite:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayName = inviter.name || inviter.github_username || 'Unknown';
  const username = inviter.github_username || inviter.id.slice(0, 8);

  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-devcard-heading text-lg">
              Team Invite for {hackathon.title}
            </CardTitle>
            <CardDescription className="text-devcard-text">
              {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-devcard-green text-devcard-green">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inviter Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-devcard-base/50 border border-devcard-border">
          <Avatar className="h-10 w-10">
            <AvatarImage src={inviter.image || undefined} />
            <AvatarFallback className="bg-devcard-green text-black">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-devcard-heading">
              {displayName}
            </p>
            <p className="text-xs text-devcard-text">@{username}</p>
          </div>
        </div>

        {/* Team Info */}
        <div className="space-y-2">
          {team.team_name && (
            <div className="flex items-center gap-2 text-sm text-devcard-text">
              <Users className="h-4 w-4" />
              <span className="font-medium text-devcard-heading">{team.team_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-devcard-text">
            <Users className="h-4 w-4" />
            <span>{team.members.length} / 5 members</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-devcard-text">
            <Calendar className="h-4 w-4" />
            <span>Hackathon: {hackathon.title}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {invite.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 bg-devcard-green hover:bg-devcard-green/90 text-black"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={handleDecline}
              disabled={loading}
              variant="outline"
              className="flex-1 border-devcard-border"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
