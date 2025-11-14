'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const freePlan = {
  name: 'Free',
  price: '$0',
  description: 'Get started with the basics',
  features: [
    'Public developer profile',
    'GitHub auto-sync (stats, repos)',
    'Wallet pass (Apple/Google)',
    'Up to 3 featured projects',
    'Connection requests',
    'Basic tech stack display',
  ],
  cta: 'Get started free',
  ctaVariant: 'outline' as const,
  highlighted: false,
};

const proPlan = {
  name: 'Pro',
  price: '$49',
  period: '/year',
  description: 'Compete, win, and stand out',
  features: [
    'Everything in Free',
    'Enter Sprints & Seasons',
    'Compete for prizes & badges',
    'Priority profile placement',
    'Advanced analytics',
    'Custom project showcases',
    'Early access to new features',
    'Pro member badge',
  ],
  cta: 'Get Pro access',
  ctaVariant: 'default' as const,
  highlighted: true,
};

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 bg-devcard-base">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
            Simple pricing
          </h2>
          <p className="text-lg text-devcard-text max-w-2xl mx-auto">
            Start free. Go Pro to compete and win.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="flex flex-col h-full p-8 rounded-2xl bg-devcard-border/10 border border-devcard-border hover:border-devcard-border transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-devcard-heading mb-2">
                {freePlan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-devcard-heading">
                  {freePlan.price}
                </span>
              </div>
              <p className="text-sm text-devcard-text">{freePlan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {freePlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-devcard-green flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-devcard-text">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="w-full bg-devcard-green hover:bg-devcard-green/90 text-black font-medium rounded-full"
            >
              <Link href="/sign-up">
                Get started free
              </Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col h-full p-8 rounded-2xl bg-devcard-green/5 border-2 border-devcard-green/50 hover:border-devcard-green transition-all shadow-lg shadow-devcard-green/10">
            {/* Highlighted Badge */}
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-devcard-green text-black font-bold px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              COMING SOON
            </Badge>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-devcard-heading mb-2">
                {proPlan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-devcard-green">
                  {proPlan.price}
                </span>
                <span className="text-devcard-heading">{proPlan.period}</span>
              </div>
              <p className="text-sm text-devcard-heading">{proPlan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {proPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-devcard-green flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-devcard-heading">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              disabled
              className="w-full bg-black/50 text-devcard-heading/30 font-medium rounded-full cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-devcard-text mt-12">
          All prices in USD. Cancel anytime. Founders #001–#500 get permanent recognition.
        </p>
      </div>
    </section>
  );
}
