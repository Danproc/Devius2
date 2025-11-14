'use client';

import AnimationContainer from '@/components/global/animation-container';
import MaxWidthWrapper from '@/components/global/max-width-wrapper';
import MagicBadge from '@/components/ui/magic-badge';
import { Smartphone, Users, Calendar, Github, ArrowRight, Zap, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Background Components for each card
function WalletBackground() {
  const [isAdded, setIsAdded] = useState(false);

  return (
    <div className="absolute right-10 top-10 w-[250px] origin-top transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
      <Card className="bg-devcard-base border-devcard-green/30">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-devcard-green">
              <AvatarFallback className="bg-devcard-green/20 text-devcard-green text-sm">
                DM
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold text-devcard-heading">Dan Miller</div>
              <div className="text-xs text-devcard-text">@danproc</div>
            </div>
          </div>
          <Badge variant="outline" className="border-devcard-green/50 text-devcard-green text-xs w-fit">
            Founder #042
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 text-center p-2 bg-devcard-border/30 rounded border border-devcard-border">
              <div className="text-sm font-bold text-devcard-green">127</div>
              <div className="text-[10px] text-devcard-text">Repos</div>
            </div>
            <div className="flex-1 text-center p-2 bg-devcard-border/30 rounded border border-devcard-border">
              <div className="text-sm font-bold text-devcard-green">2.4K</div>
              <div className="text-[10px] text-devcard-text">Stars</div>
            </div>
          </div>
          <Button
            size="sm"
            className={`w-full text-xs ${isAdded ? 'bg-devcard-green/20 text-devcard-green' : 'bg-devcard-green text-black'}`}
            onClick={() => setIsAdded(!isAdded)}
          >
            {isAdded ? '✓ Added to Wallet' : '+ Add to Wallet'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DevelopersBackground() {
  const [selectedDev, setSelectedDev] = useState(0);
  const developers = [
    { name: 'Sarah K.', role: 'Frontend', stack: 'React, TS' },
    { name: 'Ahmed R.', role: 'Backend', stack: 'Go, Rust' },
    { name: 'Priya S.', role: 'Full-stack', stack: 'Next.js' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedDev(prev => (prev + 1) % developers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-10 top-10 w-[240px] transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
      <Card className="bg-devcard-base border-devcard-border/50">
        <CardContent className="p-4 space-y-3">
          {developers.map((dev, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded border transition-all duration-300 ${
                selectedDev === i
                  ? 'border-devcard-green bg-devcard-green/10'
                  : 'border-devcard-border/50 bg-devcard-border/20'
              }`}
            >
              <Avatar className="w-8 h-8 border border-devcard-green">
                <AvatarFallback className="bg-devcard-green/20 text-devcard-green text-xs">
                  {dev.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-devcard-heading truncate">{dev.name}</div>
                <div className="text-[10px] text-devcard-text">{dev.stack}</div>
              </div>
              {selectedDev === i && (
                <Badge variant="outline" className="border-devcard-green/50 text-devcard-green text-[8px] px-1">
                  ONLINE
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HackathonBackground() {
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 12, mins: 34 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => ({
        ...prev,
        mins: prev.mins > 0 ? prev.mins - 1 : 59,
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-10 top-10 w-[240px] transition-all duration-300 ease-out group-hover:scale-105">
      <Card className="bg-devcard-border/50 border-devcard-border">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="border-devcard-green/50 text-devcard-green text-xs w-fit">
            LIVE EVENT
          </Badge>
          <div className="text-xs font-mono text-devcard-green uppercase tracking-wider mt-2">
            Sprint #07
          </div>
          <div className="text-sm font-bold text-devcard-heading">Ship a tool</div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-devcard-base rounded border border-devcard-border">
              <div className="text-lg font-bold text-devcard-green font-mono">{timeLeft.days}</div>
              <div className="text-[10px] text-devcard-text uppercase tracking-wider">Days</div>
            </div>
            <div className="p-2 bg-devcard-base rounded border border-devcard-border">
              <div className="text-lg font-bold text-devcard-green font-mono">{timeLeft.hours}</div>
              <div className="text-[10px] text-devcard-text uppercase tracking-wider">Hrs</div>
            </div>
            <div className="p-2 bg-devcard-base rounded border border-devcard-border">
              <div className="text-lg font-bold text-devcard-green font-mono">{timeLeft.mins}</div>
              <div className="text-[10px] text-devcard-text uppercase tracking-wider">Min</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GitHubBackground() {
  const [contributions, setContributions] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(4);

  useEffect(() => {
    setContributions(Array.from({ length: 35 }, () => Math.random() > 0.5));
    const interval = setInterval(() => {
      setStreak(prev => (prev % 10) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-10 top-10 w-[280px] transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
      <Card className="bg-devcard-base border-devcard-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-devcard-heading">Contribution Activity</div>
            <Badge variant="outline" className="border-devcard-green/50 text-devcard-green text-[10px]">
              <Zap className="w-3 h-3 mr-1" strokeWidth={1.5} />
              {streak} day streak
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {contributions.length > 0 ? contributions.map((active, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm transition-all ${
                  active ? 'bg-devcard-green/60' : 'bg-devcard-border/60'
                }`}
              />
            )) : (
              Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-sm bg-devcard-border/60" />
              ))
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-devcard-text">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-devcard-border/60" />
              <div className="w-3 h-3 rounded-sm bg-devcard-green/30" />
              <div className="w-3 h-3 rounded-sm bg-devcard-green/60" />
              <div className="w-3 h-3 rounded-sm bg-devcard-green" />
            </div>
            <span className="text-devcard-text">More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const features = [
  {
    icon: Smartphone,
    title: 'Wallet-ready profile',
    description: 'Put your profile in Apple/Google Wallet. Scan to connect at meetups, coworks, and conferences.',
    span: 'lg:col-span-2',
    background: <WalletBackground />,
  },
  {
    icon: Users,
    title: 'Discover developers',
    description: 'Find builders by stack, interests, and timezone. From "hello" to "here\'s the repo" in a tap.',
    span: 'lg:col-span-1',
    background: <DevelopersBackground />,
  },
  {
    icon: Calendar,
    title: 'Hackathons that matter',
    description: 'Join focused events designed for working demos and real collaboration—solo or in small teams.',
    span: 'lg:col-span-1',
    background: <HackathonBackground />,
  },
  {
    icon: Github,
    title: 'GitHub-native signal',
    description: 'Live contributions, languages, and repos—no screenshots, no vanity feed. Just proof you can ship.',
    span: 'lg:col-span-2',
    background: <GitHubBackground />,
  },
];

export function FeaturesBento() {
  return (
    <MaxWidthWrapper className="pt-10">
      <AnimationContainer delay={0.1}>
        <div className="flex flex-col w-full items-center justify-center py-8">
          <MagicBadge title="Features" />
          <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-bold text-devcard-heading mt-6">
            What you get
          </h2>
          <p className="mt-4 text-center text-lg text-devcard-heading/70 max-w-2xl">
            A network you can carry, events that make you ship, and profiles powered by real data.
          </p>
        </div>
      </AnimationContainer>

      <AnimationContainer delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 auto-rows-[22rem] gap-4 py-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group relative flex flex-col justify-between border border-devcard-border overflow-hidden rounded-xl bg-devcard-base [box-shadow:0_-20px_80px_-20px_#1cf49110_inset] ${feature.span}`}
            >
              {/* Background element */}
              <div>
                {feature.background}
              </div>

              {/* Content */}
              <div className="pointer-events-none relative z-10 flex flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
                <feature.icon className="h-10 w-10 origin-left text-devcard-green transition-all duration-300 ease-in-out group-hover:scale-75" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-devcard-heading mt-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-devcard-heading/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* CTA Button - slides up on hover */}
              <div className="absolute bottom-0 flex w-full translate-y-10 flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <Button variant="ghost" size="sm" className="text-devcard-green hover:text-devcard-green hover:bg-devcard-green/10 cursor-pointer pointer-events-auto">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AnimationContainer>
    </MaxWidthWrapper>
  );
}
