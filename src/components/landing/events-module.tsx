'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function EventsModule() {
  return (
    <section id="events" className="py-24 px-4 bg-devcard-base">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
            Upcoming events
          </h2>
          <p className="text-lg text-devcard-text max-w-2xl mx-auto">
            Live competitions for Pro members. Build, ship, and win.
          </p>
        </div>

        {/* Event Card */}
        <div className="relative max-w-4xl mx-auto">

          <div className="relative p-8 md:p-10 rounded-2xl bg-devcard-base border-2 border-devcard-green/30">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Side - Event Info */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-devcard-green/50 text-devcard-green font-bold text-sm px-3 py-1">
                    COMING SOON
                  </Badge>
                </div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-devcard-heading mb-3 opacity-60">
                    Hackathon Competitions
                  </h3>
                  <p className="text-devcard-text leading-relaxed opacity-60">
                    Compete in weekly Sprints and monthly Seasons. Build projects, win prizes, and earn permanent badges on your profile. Launching soon for Pro members.
                  </p>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="border-devcard-green/50 text-devcard-green hover:bg-devcard-green/10 font-semibold"
                    disabled
                  >
                    <span>
                      Notify me when available
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
