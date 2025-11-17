'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface RegistrationStatusProps {
  registrationEndAt: Date | string;
  currentCount: number;
  maxParticipants: number | null;
}

export function RegistrationStatus({
  registrationEndAt,
  currentCount,
  maxParticipants,
}: RegistrationStatusProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = typeof registrationEndAt === 'string' ? new Date(registrationEndAt) : registrationEndAt;
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [registrationEndAt]);

  if (!timeLeft) return null;

  const isClosed = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isClosed) {
    return (
      <Alert className="border-red-500/30 bg-red-500/5 mb-6">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-500 font-medium">
          Registration Closed
        </AlertDescription>
      </Alert>
    );
  }

  const percentageFilled = maxParticipants !== null
    ? Math.round((currentCount / maxParticipants) * 100)
    : 0;

  const isAlmostFull = maxParticipants !== null && percentageFilled >= 80;

  return (
    <Alert className={`mb-6 ${isAlmostFull ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-devcard-green/30 bg-devcard-green/5'}`}>
      <Users className="h-4 w-4 text-devcard-green" />
      <AlertDescription>
        <div className="flex items-center justify-between gap-6 flex-wrap">
          {/* Capacity */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-devcard-text">
              {maxParticipants !== null ? (
                <>
                  <span className="font-bold text-devcard-heading">{currentCount}/{maxParticipants}</span> spots filled
                </>
              ) : (
                <>
                  <span className="font-bold text-devcard-heading">{currentCount}</span> registered
                </>
              )}
            </span>
            {isAlmostFull && <Badge variant="outline" className="border-yellow-500 text-yellow-600 text-xs">Filling Fast!</Badge>}
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-devcard-green" />
            <span className="text-sm text-devcard-text">
              Closes in{' '}
              <span className="font-bold text-devcard-heading">
                {timeLeft.days > 0 && `${timeLeft.days}d `}
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
