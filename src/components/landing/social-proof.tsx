'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

export function SocialProof() {
  return (
    <section className="py-16 px-4 border-t border-devcard-border/30 bg-devcard-base">
      <div className="container mx-auto max-w-6xl">
        {/* Stats Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-4xl font-bold text-devcard-green">3,142</div>
            <div className="text-sm text-devcard-text">Scans at events this month</div>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-4xl font-bold text-devcard-green">603</div>
            <div className="text-sm text-devcard-text">Active developers</div>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-4xl font-bold text-devcard-green">$12K</div>
            <div className="text-sm text-devcard-text">In prizes this season</div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative max-w-3xl mx-auto p-8 rounded-xl bg-devcard-border/20 border border-devcard-border">
          <Quote className="absolute top-4 left-4 h-8 w-8 text-devcard-green/30" />
          <blockquote className="text-lg text-devcard-text italic pl-12">
            "Finally, a developer profile that actually shows what I ship—not just what I say I can do. The wallet pass gets me into events instantly."
          </blockquote>
          <div className="flex items-center gap-3 mt-6 pl-12">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.png" alt="Developer" />
              <AvatarFallback className="bg-devcard-green/10 text-devcard-green">
                DM
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-devcard-heading">Dan Miller</div>
              <div className="text-xs text-devcard-text">Full-stack engineer, Founder #042</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
