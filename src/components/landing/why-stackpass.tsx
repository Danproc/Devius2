'use client';

import { Shield, Scan, Trophy, Users } from 'lucide-react';

const pillars = [
  {
    icon: Shield,
    title: 'Proof over puff',
    description: 'Your GitHub speaks. No self-reported skills, no résumé fluff.',
  },
  {
    icon: Scan,
    title: 'Scan-first',
    description: 'Wallet pass = instant profile share. No awkward link exchanges.',
  },
  {
    icon: Trophy,
    title: 'Competition built-in',
    description: 'Sprints and Seasons turn side projects into prize-worthy work.',
  },
  {
    icon: Users,
    title: 'Community that ships',
    description: 'Connect with builders who commit code, not just chat.',
  },
];

export function WhyStackPass() {
  return (
    <section className="py-24 px-4 bg-devcard-base">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
            Why StackPass?
          </h2>
          <p className="text-lg text-devcard-text max-w-2xl mx-auto">
            A developer profile designed for how you actually work—and compete.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl bg-devcard-border/20 border border-devcard-border hover:border-devcard-green/50 hover:bg-devcard-green/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-devcard-green/10 flex items-center justify-center group-hover:bg-devcard-green/20 transition-colors">
                  <pillar.icon className="h-6 w-6 text-devcard-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-devcard-heading mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-devcard-text leading-relaxed">
                    {pillar.description}
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
