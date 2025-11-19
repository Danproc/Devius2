'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: Date | string;
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
      const now = new Date();
      const diff = deadlineDate.getTime() - now.getTime();

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
  }, [deadline]);

  if (!timeLeft) return null;

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 mb-6">
        <CardContent className="py-4 text-center">
          <p className="text-red-500 font-semibold">Submissions Closed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-devcard-green/30 bg-devcard-green/10 mb-6">
      <CardContent className="py-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-devcard-green" />
          <h3 className="text-lg font-semibold text-devcard-heading">Time Remaining</h3>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-devcard-green">{timeLeft.days}</div>
            <div className="text-xs text-devcard-text uppercase tracking-wider">Days</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-devcard-green">{timeLeft.hours}</div>
            <div className="text-xs text-devcard-text uppercase tracking-wider">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-devcard-green">{timeLeft.minutes}</div>
            <div className="text-xs text-devcard-text uppercase tracking-wider">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-devcard-green">{timeLeft.seconds}</div>
            <div className="text-xs text-devcard-text uppercase tracking-wider">Seconds</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
