'use client';

import { useEffect, useState, useRef, MouseEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FoundingStatus {
  total: number;
  claimed: number;
  remaining: number;
  percentageClaimed: number;
  isActive: boolean;
}

export function FoundingMemberModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<FoundingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check how many times user has seen the modal
    const viewCount = parseInt(localStorage.getItem('founding-member-modal-views') || '0');
    const maxViews = 3;

    fetch('/api/promotions/founding-status')
      .then((res) => res.json())
      .then((data: FoundingStatus) => {
        setStatus(data);
        setLoading(false);

        // Show modal if:
        // 1. User has seen it less than 3 times
        // 2. Promotion is still active
        // 3. There are spots remaining
        const shouldShow = viewCount < maxViews && data.isActive && data.remaining > 0;

        if (shouldShow) {
          setTimeout(() => {
            setIsOpen(true);
            // Increment view count
            localStorage.setItem('founding-member-modal-views', String(viewCount + 1));
          }, 800);
        }
      })
      .catch((error) => {
        console.error('Error fetching founding status:', error);
        setLoading(false);
      });
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClaim = () => {
    window.location.href = '/app/billing';
  };

  if (loading || !status) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[480px] p-0 overflow-hidden bg-[#04080f] border-[#121824] rounded-none"
        showCloseButton={false}
      >
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
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-devcard-green z-20" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-devcard-green z-20" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-devcard-green z-20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-devcard-green z-20" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-30 p-1.5 hover:bg-[#1cf491]/10 transition-colors"
          >
            <X className="w-4 h-4 text-[#dde3ed]" />
          </button>

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <h3 className="text-xs font-mono text-devcard-green uppercase tracking-[0.2em]">
                [ FOUNDING MEMBER OFFER ]
              </h3>
              <h2 className="text-xl font-bold text-devcard-heading font-mono uppercase tracking-wide">
                First 100 Members Only
              </h2>
            </div>

            {/* Main Offer */}
            <div className="text-center space-y-2 py-4">
              <div className="text-3xl font-bold text-devcard-green font-mono tabular-nums">
                FREE 1 YEAR ACCESS
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-devcard-text uppercase tracking-wider">Spots Claimed</span>
                <span className="font-bold text-devcard-green tabular-nums">
                  {status.claimed} / {status.total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-devcard-base border border-devcard-border overflow-hidden relative">
                <div
                  className="h-full bg-devcard-green transition-all duration-500 relative"
                  style={{ width: `${status.percentageClaimed}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>

              <div className="text-center">
                {status.remaining <= 10 ? (
                  <p className="text-red-400 font-bold font-mono text-xs uppercase tracking-wider animate-pulse">
                    [ ONLY {status.remaining} SPOT{status.remaining !== 1 ? 'S' : ''} LEFT ]
                  </p>
                ) : (
                  <p className="text-devcard-green font-mono text-xs uppercase tracking-wider">
                    {status.remaining} spots remaining
                  </p>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 text-xs font-mono text-center">
              <div className="text-white uppercase tracking-wide">FREE access to all hackathons</div>
              <div className="text-white uppercase tracking-wide">Exclusive Pioneer Badge</div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleClaim}
                className="flex-1 bg-devcard-green hover:bg-devcard-green/90 text-black font-mono font-bold uppercase tracking-wider text-xs border border-devcard-green shadow-[0_0_20px_rgba(28,244,145,0.3)] hover:shadow-[0_0_30px_rgba(28,244,145,0.5)] transition-all"
                size="lg"
              >
                CLAIM YOUR SPOT
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="px-6 bg-transparent border-devcard-border hover:bg-devcard-text/5 text-devcard-text font-mono uppercase tracking-wider text-xs"
                size="lg"
              >
                Later
              </Button>
            </div>

            {/* Fine Print */}
            <p className="text-[10px] text-center text-devcard-text/30 font-mono uppercase tracking-wider">
              Limited to first 100 members
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
