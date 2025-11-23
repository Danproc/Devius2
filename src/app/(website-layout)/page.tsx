import { Hero } from '@/components/landing/hero';
import { LiveStats } from '@/components/landing/live-stats';
import { Companies } from '@/components/landing/companies';
import { FeaturesBento } from '@/components/landing/features-bento';
import { Process } from '@/components/landing/process';
import { PricingSection } from '@/components/landing/pricing-section';
import { UpcomingHackathon } from '@/components/landing/upcoming-hackathon';
import { CTALamp } from '@/components/landing/cta-lamp';
import { Suspense } from 'react';

export default function WebsiteHomepage() {
  return (
    <div className="overflow-x-hidden overflow-y-visible w-full">
      <Hero />

      <div className="container mx-auto px-4 pb-12">
        <Suspense fallback={
          <div className="flex flex-wrap gap-8 justify-center text-sm">
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold text-devcard-green">...</div>
              <div className="text-devcard-text">Loading...</div>
            </div>
          </div>
        }>
          <LiveStats />
        </Suspense>
      </div>

      <Companies />
      <FeaturesBento />
      <Process />
      <PricingSection />
      <UpcomingHackathon />
      <CTALamp />
    </div>
  );
}
