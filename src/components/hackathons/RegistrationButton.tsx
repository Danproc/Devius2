'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, Users, User, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationButtonProps {
  hackathonId: string;
  isRegistered: boolean;
  isFull: boolean;
  canUnregister: boolean;
  onRegistrationChange?: () => void;
}

export function RegistrationButton({
  hackathonId,
  isRegistered,
  isFull,
  canUnregister,
  onRegistrationChange,
}: RegistrationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [participationType, setParticipationType] = useState<'solo' | 'team'>('solo');
  const [step, setStep] = useState<'choose' | 'team-details'>('choose');
  const [teamName, setTeamName] = useState('');
  const [inviteUsernames, setInviteUsernames] = useState<string[]>([]);
  const [usernameInput, setUsernameInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    console.log('useEffect triggered, input:', usernameInput, 'length:', usernameInput.length);

    if (usernameInput.length < 2) {
      console.log('Too short, clearing results');
      setSearchResults([]);
      return;
    }

    console.log('Starting search timer...');
    const timer = setTimeout(async () => {
      console.log('Timer fired! Searching API...');
      setSearching(true);
      try {
        const url = `/api/hackathons/${hackathonId}/users/search?q=${encodeURIComponent(usernameInput)}`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        setSearchResults(data.users || []);
        console.log('Set search results:', data.users?.length || 0, 'users');
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [usernameInput, hackathonId]);

  const handleNext = () => {
    if (participationType === 'team') {
      setStep('team-details');
    } else {
      handleRegisterSolo();
    }
  };

  const handleRegisterSolo = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participation_type: 'solo' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      toast.success('Registered as solo participant!');
      setDialogOpen(false);
      setStep('choose');

      if (onRegistrationChange) {
        onRegistrationChange();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithTeam = async () => {
    setLoading(true);

    try {
      // Step 1: Register user
      const regResponse = await fetch(`/api/hackathons/${hackathonId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participation_type: 'team' }),
      });

      if (!regResponse.ok) {
        const data = await regResponse.json();
        throw new Error(data.error || 'Failed to register');
      }

      // Step 2: Create team
      const teamResponse = await fetch(`/api/hackathons/${hackathonId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName || null }),
      });

      const teamData = await teamResponse.json();

      if (!teamResponse.ok) {
        throw new Error(teamData.error || 'Failed to create team');
      }

      // Step 3: Send invites (optional - can skip)
      if (inviteUsernames.length > 0) {
        for (const username of inviteUsernames) {
          await fetch(`/api/hackathons/teams/${teamData.team.id}/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
        }
        toast.success(`Team created! Invites sent to ${inviteUsernames.length} member(s)`);
      } else {
        toast.success('Team created! You can invite members later');
      }

      setDialogOpen(false);
      setStep('choose');
      setTeamName('');
      setInviteUsernames([]);

      if (onRegistrationChange) {
        onRegistrationChange();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error registering with team:', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/registrations/me`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unregister');
      }

      toast.success('Unregistered successfully');

      if (onRegistrationChange) {
        onRegistrationChange();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error unregistering:', error);
      toast.error(error.message || 'Failed to unregister');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvite = () => {
    if (!usernameInput.trim()) return;
    if (inviteUsernames.includes(usernameInput.trim())) {
      toast.error('Already added');
      return;
    }
    if (inviteUsernames.length >= 4) {
      toast.error('Maximum 4 invites (5 members total including you)');
      return;
    }
    setInviteUsernames([...inviteUsernames, usernameInput.trim()]);
    setUsernameInput('');
  };

  const handleRemoveInvite = (username: string) => {
    setInviteUsernames(inviteUsernames.filter(u => u !== username));
  };

  const handleSelectUser = (user: any) => {
    // Check if user is Pro
    if (!user.is_premium || (user.premium_expires_at && new Date(user.premium_expires_at) < new Date())) {
      toast.error('Only Pro members can join teams');
      return;
    }

    const username = user.username || user.github_username;
    if (username && !inviteUsernames.includes(username)) {
      if (inviteUsernames.length >= 4) {
        toast.error('Maximum 4 invites');
        return;
      }
      setInviteUsernames([...inviteUsernames, username]);
    }
    setUsernameInput('');
    setSearchResults([]);
  };

  if (isRegistered) {
    return (
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-devcard-green" />
          <span className="text-sm font-semibold text-devcard-green">You're Registered!</span>
        </div>
        {canUnregister && (
          <>
            <div className="h-4 w-px bg-devcard-border"></div>
            <Button
              onClick={handleUnregister}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="text-devcard-text hover:text-red-500"
            >
              {loading ? 'Unregistering...' : 'Unregister'}
            </Button>
          </>
        )}
      </div>
    );
  }

  if (isFull) {
    return (
      <Button
        disabled
        className="bg-gray-500 text-white cursor-not-allowed"
        size="lg"
      >
        Hackathon Full
      </Button>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full"
          size="lg"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Register for Hackathon
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-devcard-base border-devcard-border max-w-2xl">
        {step === 'choose' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-devcard-heading">Choose Your Participation Type</DialogTitle>
              <DialogDescription className="text-devcard-text">
                Select how you plan to participate in this hackathon
              </DialogDescription>
            </DialogHeader>

            <RadioGroup
              value={participationType}
              onValueChange={(value) => setParticipationType(value as 'solo' | 'team')}
              className="space-y-4 my-4"
            >
              <div className="flex items-center space-x-3 border border-devcard-border p-4 rounded-lg cursor-pointer hover:border-devcard-green/50 transition-colors">
                <RadioGroupItem value="solo" id="solo" />
                <Label htmlFor="solo" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-devcard-green" />
                    <div>
                      <div className="font-semibold text-devcard-heading">Solo</div>
                      <div className="text-sm text-devcard-text">
                        Work independently on your project
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border border-devcard-border p-4 rounded-lg cursor-pointer hover:border-devcard-green/50 transition-colors">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-devcard-green" />
                    <div>
                      <div className="font-semibold text-devcard-heading">Team</div>
                      <div className="text-sm text-devcard-text">
                        Collaborate with up to 4 other Pro members
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <Button
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
            >
              Next
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('choose')}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle className="text-devcard-heading">Create Your Team</DialogTitle>
                  <DialogDescription className="text-devcard-text">
                    Set up your team and invite members (optional)
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 my-4">
              {/* Team Name */}
              <div>
                <Label htmlFor="team_name" className="text-devcard-heading">
                  Team Name (Optional)
                </Label>
                <Input
                  id="team_name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Code Crushers"
                  className="bg-devcard-base border-devcard-border text-devcard-heading"
                  maxLength={50}
                />
                <p className="text-xs text-devcard-text mt-1">
                  Leave empty to use your project title
                </p>
              </div>

              {/* Invite Members */}
              <div>
                <Label htmlFor="username_invite" className="text-devcard-heading">
                  Invite Team Members (Optional)
                </Label>
                <div className="relative">
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="username_invite"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Search users... (min 2 chars)"
                      className="bg-devcard-base border-devcard-border text-devcard-heading"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      onClick={handleAddInvite}
                      variant="outline"
                      size="icon"
                      className="border-devcard-border"
                      disabled={!usernameInput.trim()}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Dropdown Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-50 w-full bg-devcard-base border border-devcard-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {searchResults.map((user) => {
                        const isPro = user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date());
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            disabled={!isPro}
                            className={`w-full flex items-center gap-3 p-3 transition-colors border-b border-devcard-border last:border-0 ${
                              isPro ? 'hover:bg-devcard-green/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image || undefined} />
                              <AvatarFallback className="bg-devcard-green text-black text-xs">
                                {(user.name || user.username || user.github_username || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-devcard-heading">
                                {user.name || user.username || user.github_username}
                              </div>
                              <div className="text-xs text-devcard-text">
                                @{user.username || user.github_username}
                              </div>
                            </div>
                            <Badge
                              variant={isPro ? 'default' : 'secondary'}
                              className={isPro ? 'bg-devcard-green text-black' : 'bg-gray-500 text-white'}
                            >
                              {isPro ? 'Pro' : 'Free'}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {searching && usernameInput.length >= 2 && searchResults.length === 0 && (
                    <div className="absolute z-50 w-full bg-devcard-base border border-devcard-border rounded-lg shadow-xl p-3 text-center text-sm text-devcard-text">
                      Searching...
                    </div>
                  )}
                  {!searching && usernameInput.length >= 2 && searchResults.length === 0 && (
                    <div className="absolute z-50 w-full bg-devcard-base border border-devcard-border rounded-lg shadow-xl p-3 text-center text-sm text-devcard-text">
                      No registered users found matching "{usernameInput}"
                    </div>
                  )}
                </div>

                {inviteUsernames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {inviteUsernames.map((username) => (
                      <Badge
                        key={username}
                        variant="secondary"
                        className="bg-devcard-green/20 text-devcard-green"
                      >
                        @{username}
                        <button
                          type="button"
                          onClick={() => handleRemoveInvite(username)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-devcard-text mt-2">
                  You can invite up to 4 members ({inviteUsernames.length}/4). Invites sent after registration.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRegisterWithTeam}
                disabled={loading}
                className="flex-1 bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
              >
                {loading ? 'Creating Team...' : inviteUsernames.length > 0 ? 'Register & Send Invites' : 'Register Team'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
