'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { UserPlus, Users, User } from 'lucide-react';
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

  const handleRegister = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participation_type: participationType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      toast.success('Registration successful!');
      setDialogOpen(false);

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
      <DialogContent className="bg-devcard-base border-devcard-border">
        <DialogHeader>
          <DialogTitle className="text-devcard-heading">Choose Your Participation Type</DialogTitle>
          <DialogDescription className="text-devcard-text">
            Select how you plan to participate. You can change this later when submitting.
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
                    Collaborate with 1-4 other Pro members
                  </div>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
        >
          {loading ? 'Registering...' : 'Confirm Registration'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
