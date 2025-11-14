'use client';

import Image from 'next/image';
import { Github, Layers, Smartphone, Calendar, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Github,
    title: 'Connect GitHub',
    tag: 'Auto-sync',
  },
  {
    icon: Layers,
    title: 'Curate Stack',
    tag: 'Customize',
  },
  {
    icon: Smartphone,
    title: 'Get Pass',
    tag: 'Wallet-ready',
  },
  {
    icon: Calendar,
    title: 'Enter Events',
    tag: 'Pro only',
  },
  {
    icon: Rocket,
    title: 'Ship & Win',
    tag: 'Get badges',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-devcard-base">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Side - Content & Bento Grid */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
              How it works
            </h2>
            <p className="text-lg text-devcard-heading/70 mb-10 leading-relaxed">
              From sign-up to building together — fast.
            </p>

            {/* Bento Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-5 bg-devcard-border/20 border border-devcard-border hover:border-devcard-green/50 transition-all duration-300 group ${
                    index === 0 ? 'col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-devcard-base border border-devcard-green/50 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-devcard-green" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-mono text-devcard-heading uppercase tracking-wider mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs font-mono text-devcard-green/60 uppercase tracking-wide">
                        {step.tag}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[300px] aspect-[1/2] bg-devcard-border/20 border border-devcard-border rounded-[3rem] p-4 shadow-2xl">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-devcard-base rounded-b-2xl" />

              {/* Screen content - DevCard preview */}
              <div className="w-full h-full bg-devcard-base rounded-[2.5rem] overflow-hidden border border-devcard-border/50">
                <div className="p-6 space-y-4">
                  {/* Profile header */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-devcard-green/20 border border-devcard-green" />
                    <div>
                      <div className="h-4 w-24 bg-devcard-heading/20 rounded mb-2" />
                      <div className="h-3 w-16 bg-devcard-heading/10 rounded" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-2 bg-devcard-border/30 rounded border border-devcard-border">
                        <div className="h-3 w-8 bg-devcard-green/30 rounded mb-1" />
                        <div className="h-2 w-12 bg-devcard-heading/10 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-3 bg-devcard-border/30 rounded border border-devcard-border">
                        <div className="h-3 w-20 bg-devcard-heading/20 rounded mb-2" />
                        <div className="h-2 w-full bg-devcard-heading/10 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* QR Code placeholder */}
                  <div className="mt-4 p-4 bg-white/10 rounded flex items-center justify-center">
                    <div className="w-20 h-20 bg-devcard-heading/20 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
