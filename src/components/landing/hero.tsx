'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import DarkVeil from '@/components/ui/dark-veil';
import { useEffect, useState } from 'react';

export function Hero() {
  const [showBackground, setShowBackground] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide background when scrolled past 80% of viewport height
      const heroHeight = window.innerHeight;
      const scrolled = window.scrollY;
      setShowBackground(scrolled < heroHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative py-20 md:py-32 flex items-center justify-center bg-devcard-base min-h-screen">
      {/* Animated background - only shown when in hero viewport */}
      {showBackground && (
        <div className="fixed top-0 left-0 right-0 h-screen opacity-15 pointer-events-none z-0">
          {/* Gradient overlay to fade bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-devcard-base" />
          <DarkVeil
            hueShift={140}
            noiseIntensity={0.01}
            scanlineIntensity={0}
            speed={0.4}
            scanlineFrequency={0}
            warpAmount={0.02}
            resolutionScale={1}
          />
        </div>
      )}

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Founders Badge */}
          <Badge
            variant="outline"
            className="border-devcard-green/30 bg-devcard-green/5 text-devcard-green px-4 py-1.5 text-sm font-semibold"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Founders #001–#500 are open
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-devcard-heading leading-[1]">
            Your GitHub, Beautifully Networked.
          </h1>

          {/* Hackathon Registration Open */}
          <p className="text-sm md:text-base font-mono tracking-widest text-devcard-green uppercase">
            HACKATHON REGISTRATION OPEN
          </p>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-devcard-heading/70 max-w-2xl leading-relaxed">
            StackPass is a developer network that helps you meet devs and ship in focused hackathons. Simply connect your GitHub to get started.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-devcard-border/30 border border-devcard-border text-devcard-text">
              <div className="w-2 h-2 rounded-full bg-devcard-green" />
              GitHub-Native
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-devcard-border/30 border border-devcard-border text-devcard-text">
              <div className="w-2 h-2 rounded-full bg-devcard-green" />
              Scan-Ready
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-devcard-border/30 border border-devcard-border text-devcard-text">
              <div className="w-2 h-2 rounded-full bg-devcard-green" />
              Built to Compete
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium text-sm px-12 py-6 rounded-full"
            >
              <Link href="/sign-up">
                Get your pass
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-devcard-border hover:bg-devcard-border/70 text-devcard-heading font-medium text-sm px-8 py-6 rounded-full border border-devcard-heading/20"
            >
              <Link href="/danproc">
                Preview a profile
              </Link>
            </Button>
          </div>

          {/* Quick Stats - Removed, will be replaced with dynamic stats */}
        </div>
      </div>
    </section>
  );
}
