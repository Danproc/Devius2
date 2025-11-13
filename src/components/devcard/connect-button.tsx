'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ConnectButtonProps {
  targetUserId: string;
  targetUsername: string;
  className?: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  isPending: boolean;
  isOwnCard: boolean;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export function ConnectButton({ targetUserId, targetUsername, className }: ConnectButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check connection status and rate limits
  useEffect(() => {
    const checkStatus = async () => {
      // Wait for session to finish loading
      if (status === 'loading') {
        return;
      }

      // If no session, just set loading to false - button will still render
      if (!session?.user) {
        setIsLoading(false);
        setConnectionStatus({ isConnected: false, isPending: false, isOwnCard: false });
        return;
      }

      try {
        // Check if viewing own card
        const isOwnCard = session.user.id === targetUserId;

        if (isOwnCard) {
          setConnectionStatus({ isConnected: false, isPending: false, isOwnCard: true });
          setIsLoading(false);
          return;
        }

        // Check existing connection status
        const [connectionRes, rateLimitRes] = await Promise.all([
          fetch(`/api/connections/${targetUserId}`),
          fetch('/api/connections/rate-limit'),
        ]);

        if (connectionRes.ok) {
          const connectionData = await connectionRes.json();
          setConnectionStatus({
            isConnected: connectionData.status === 'accepted',
            isPending: connectionData.status === 'pending',
            isOwnCard: false,
          });
        } else if (connectionRes.status === 404) {
          // No connection exists
          setConnectionStatus({ isConnected: false, isPending: false, isOwnCard: false });
        }

        if (rateLimitRes.ok) {
          const rateLimitData = await rateLimitRes.json();
          setRateLimitInfo(rateLimitData);
        }
      } catch (error) {
        console.error('Error checking connection status:', error);
        // Set default state on error
        setConnectionStatus({ isConnected: false, isPending: false, isOwnCard: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [session, status, targetUserId]);

  const handleConnect = async () => {
    if (!session?.user) {
      // Store connection intent before redirecting to auth
      try {
        await fetch('/api/connections/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId }),
        });
      } catch (error) {
        console.error('Failed to store connection intent:', error);
      }

      // Use callbackUrl for proper NextAuth redirect handling
      router.push('/sign-in?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!session?.user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/connections/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: targetUserId,
          message: message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited
          const resetDate = new Date(data.reset);
          const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 60000);

          toast.error('Rate limit reached', {
            description: `You can send up to 20 requests per hour. Try again in ${minutesUntilReset} minutes.`,
          });

          setRateLimitInfo({
            limit: data.limit,
            remaining: 0,
            reset: data.reset,
          });
        } else {
          toast.error('Failed to send connection request', {
            description: data.message || 'Please try again later.',
          });
        }
        return;
      }

      // Update rate limit info from response headers
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '20');
      const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

      setRateLimitInfo({ limit, remaining, reset });

      // Update connection status
      setConnectionStatus({ isConnected: false, isPending: true, isOwnCard: false });

      toast.success('Connection request sent!', {
        description: `Your request to connect with ${targetUsername} has been sent.`,
      });

      setIsModalOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingTime = () => {
    if (!rateLimitInfo?.reset) return '';

    const now = Date.now();
    const resetTime = rateLimitInfo.reset;
    const diff = resetTime - now;

    if (diff <= 0) return '';

    const minutes = Math.ceil(diff / 60000);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  // Always render the button, but with different states

  // Loading state - show a disabled button
  if (isLoading) {
    return (
      <Button
        disabled
        variant="default"
        className={className}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Not logged in - show connect button that redirects to sign-in
  if (!session?.user) {
    return (
      <Button
        onClick={async () => {
          // Store connection intent before redirecting to auth
          try {
            await fetch('/api/connections/intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetUserId }),
            });
          } catch (error) {
            console.error('Failed to store connection intent:', error);
          }

          toast.info('Sign in required', {
            description: 'Please sign in to send a connection request.',
          });
          router.push('/sign-in?callbackUrl=' + encodeURIComponent(window.location.pathname));
        }}
        variant="default"
        className={className}
      >
        Connect with {targetUsername}
      </Button>
    );
  }

  // Viewing own card - show connect button but disabled with tooltip
  if (connectionStatus?.isOwnCard) {
    return (
      <Button
        onClick={() => {
          toast.info('This is your card', {
            description: 'You cannot send a connection request to yourself.',
          });
        }}
        variant="default"
        className={className}
      >
        Connect with {targetUsername}
      </Button>
    );
  }

  // Show different states based on connection status
  if (connectionStatus?.isPending) {
    return (
      <Button
        disabled
        variant="outline"
        className={className}
      >
        Pending
      </Button>
    );
  }

  if (connectionStatus?.isConnected) {
    return (
      <Button
        disabled
        variant="outline"
        className={className}
      >
        Connected
      </Button>
    );
  }

  // Default state - show connect button
  return (
    <>
      <Button
        onClick={handleConnect}
        variant="default"
        className={className}
        disabled={rateLimitInfo?.remaining === 0}
      >
        Connect with {targetUsername}
      </Button>

      {/* Connection Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Connect with {targetUsername}</DialogTitle>
            <DialogDescription>
              Send a connection request to {targetUsername}. You can include an optional message.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Hi! I'd love to connect with you..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/500 characters
              </p>
            </div>

            {rateLimitInfo && (
              <div className="text-sm text-muted-foreground">
                <p>
                  You can send up to {rateLimitInfo.limit} connection requests per hour.
                </p>
                <p>
                  Remaining: <span className="font-medium">{rateLimitInfo.remaining}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
