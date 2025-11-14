'use client';

import {
  Smartphone,
  RefreshCw,
  Link2,
  Award,
  Code2,
  BarChart3,
  Users2,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Wallet-ready profile',
    description: 'Download to Apple/Google Wallet. Scan at events, share instantly.',
  },
  {
    icon: RefreshCw,
    title: 'Auto-sync from GitHub',
    description: 'Stats, repos, and languages update automatically. Set it and forget it.',
  },
  {
    icon: Link2,
    title: 'Connect with builders',
    description: 'Find and link up with other devs. Your network, visualized.',
  },
  {
    icon: Award,
    title: 'Earn badges & prizes',
    description: 'Win competitions, get permanent badges on your profile.',
  },
  {
    icon: Code2,
    title: 'Showcase projects',
    description: 'Feature your best work—GitHub or custom. Stats auto-update.',
  },
  {
    icon: BarChart3,
    title: 'Track your streak',
    description: 'Contribution streaks, org memberships, top languages—all visible.',
  },
  {
    icon: Users2,
    title: 'Founder numbers',
    description: 'Join early, get a permanent #001–#500 founder badge.',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    description: 'Fast, clean, no bloat. Your profile loads in milliseconds.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-4 bg-devcard-base border-t border-devcard-border/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-devcard-text max-w-2xl mx-auto">
            A developer profile that works as hard as you do.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-devcard-border/10 border border-devcard-border hover:border-devcard-green/50 hover:bg-devcard-green/5 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-devcard-green/10 flex items-center justify-center group-hover:bg-devcard-green/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-devcard-green" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-devcard-heading mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-devcard-text leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
