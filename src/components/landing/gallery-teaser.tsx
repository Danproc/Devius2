'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trophy, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const demoProjects = [
  {
    title: 'CLI Task Runner',
    author: 'Sarah K.',
    badge: '1st Place Sprint #05',
    prize: '$800',
    description: 'A blazingly fast task runner for monorepos with zero config.',
    stars: 342,
    language: 'Rust',
    langColor: '#dea584',
  },
  {
    title: 'API Rate Limiter',
    author: 'James P.',
    badge: '2nd Place Sprint #06',
    prize: '$500',
    description: 'Redis-backed rate limiting middleware for Express & Next.js.',
    stars: 218,
    language: 'TypeScript',
    langColor: '#3178c6',
  },
  {
    title: 'Git Flow Visualizer',
    author: 'Maria L.',
    badge: '3rd Place Sprint #04',
    prize: '$300',
    description: 'Interactive git branch visualization in the terminal.',
    stars: 156,
    language: 'Go',
    langColor: '#00add8',
  },
];

export function GalleryTeaser() {
  return (
    <section className="py-24 px-4 bg-devcard-base border-t border-devcard-border/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-devcard-heading mb-4">
            Winners gallery
          </h2>
          <p className="text-lg text-devcard-text max-w-2xl mx-auto">
            See what Pro members have shipped—and won.
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {demoProjects.map((project, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[340px] snap-center group"
              >
                <div className="h-full p-6 rounded-xl bg-devcard-border/10 border border-devcard-border hover:border-devcard-green/50 hover:bg-devcard-green/5 transition-all duration-300 hover:-translate-y-1">
                  {/* Badge */}
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  >
                    <Trophy className="h-3 w-3 mr-1 fill-yellow-500" />
                    {project.badge}
                  </Badge>

                  {/* Title & Author */}
                  <h3 className="text-lg font-bold text-devcard-heading mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-devcard-text mb-3">
                    by {project.author} • Won {project.prize}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-devcard-text leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-devcard-text mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {project.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.langColor }}
                      />
                      {project.language}
                    </div>
                  </div>

                  {/* View Link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-devcard-green hover:text-devcard-green hover:bg-devcard-green/10"
                  >
                    View project
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Fade Edges */}
          <div className="absolute top-0 left-0 bottom-4 w-12 bg-gradient-to-r from-devcard-base to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-devcard-base to-transparent pointer-events-none" />
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            className="border-devcard-green/50 text-devcard-green hover:bg-devcard-green/10"
          >
            <Link href="/gallery">
              Open the full gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
