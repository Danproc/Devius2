'use client';

import { useState, useRef, MouseEvent } from 'react';

interface LiveStatsClientProps {
  devCount: number;
  connCount: number;
}

export function LiveStatsClient({ devCount, connCount }: LiveStatsClientProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="py-12 flex justify-center">
      <div className="relative max-w-2xl w-full mx-4">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative p-8 bg-devcard-border/10 border group"
          style={{
            borderImage: isHovering
              ? `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, #1cf491, #121824 50%) 1`
              : 'none',
            borderColor: isHovering ? 'transparent' : '#121824',
          }}
        >
          {/* Corner brackets for techy look - Full bright green, 1px */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-devcard-green z-20" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-devcard-green z-20" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-devcard-green z-20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-devcard-green z-20" />

          <div className="relative z-10">
            <div className="text-center mb-6">
              <h3 className="text-xs font-mono text-devcard-green uppercase tracking-[0.2em]">
                [ StackPass Activity ]
              </h3>
            </div>

            <div className="flex flex-wrap gap-6 justify-center font-mono">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-devcard-base/50 border border-devcard-border">
                <span className="text-base font-bold text-devcard-green tabular-nums">{devCount}</span>
                <span className="text-[13px] text-devcard-heading uppercase tracking-wider">Active Developers</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-devcard-base/50 border border-devcard-border">
                <span className="text-base font-bold text-devcard-green tabular-nums">{connCount}</span>
                <span className="text-[13px] text-devcard-heading uppercase tracking-wider">Connections Made</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
