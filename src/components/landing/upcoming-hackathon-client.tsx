'use client';

import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpcomingHackathonClientProps {
  title: string;
  slug: string;
  startAt: string;
  totalPrize: number;
  duration: number;
}

export function UpcomingHackathonClient({
  title,
  slug,
  startAt,
  totalPrize,
  duration,
}: UpcomingHackathonClientProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(startAt).getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startAt]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="py-12 flex justify-center">
      <div className="relative max-w-2xl w-full mx-4">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative p-8 bg-devcard-border/10 border group"
          style={{
            borderImage: isHovering
              ? `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, #1cf491, #121824 50%) 1`
              : 'none',
            borderColor: isHovering ? 'transparent' : '#121824',
          }}
        >
          {/* Corner brackets for techy look */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-devcard-green z-20" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-devcard-green z-20" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-devcard-green z-20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-devcard-green z-20" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-xs font-mono text-devcard-green uppercase tracking-[0.2em]">
                [ Upcoming Hackathon ]
              </h3>
              <h2 className="text-2xl md:text-3xl font-bold text-devcard-heading mt-4">
                {title}
              </h2>
            </div>

            {/* Countdown Timer - Large */}
            <div className="flex justify-center gap-3 md:gap-6 mb-8 font-mono">
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold text-devcard-green tabular-nums">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-xs text-devcard-text uppercase tracking-wider mt-1">Days</div>
              </div>
              <div className="text-3xl md:text-5xl font-bold text-devcard-green self-start pt-1">:</div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold text-devcard-green tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs text-devcard-text uppercase tracking-wider mt-1">Hours</div>
              </div>
              <div className="text-3xl md:text-5xl font-bold text-devcard-green self-start pt-1">:</div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold text-devcard-green tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs text-devcard-text uppercase tracking-wider mt-1">Mins</div>
              </div>
              <div className="text-3xl md:text-5xl font-bold text-devcard-green self-start pt-1">:</div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold text-devcard-green tabular-nums">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-devcard-text uppercase tracking-wider mt-1">Secs</div>
              </div>
            </div>

            {/* Info Pills - Matching LiveStats style */}
            <div className="flex flex-wrap gap-4 justify-center font-mono mb-6">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-devcard-base/50 border border-devcard-border">
                <span className="text-base font-bold text-devcard-green tabular-nums">${totalPrize}</span>
                <span className="text-[13px] text-devcard-heading uppercase tracking-wider">Prize Pool</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-devcard-base/50 border border-devcard-border">
                <span className="text-base font-bold text-devcard-green tabular-nums">{duration}H</span>
                <span className="text-[13px] text-devcard-heading uppercase tracking-wider">Hackathon</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-devcard-base/50 border border-devcard-border">
                <span className="text-base font-bold text-devcard-green">Solo/Team</span>
                <span className="text-[13px] text-devcard-heading uppercase tracking-wider">Format</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-devcard-green hover:bg-devcard-green/90 text-black font-bold rounded-full px-8"
              >
                <Link href={`/hackathons/${slug}`}>
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
