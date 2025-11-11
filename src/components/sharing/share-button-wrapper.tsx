'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { ShareModal } from './share-modal';

interface ShareButtonWrapperProps {
  username: string;
  displayName: string;
  customBio?: string;
  avatarUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ShareButtonWrapper({
  username,
  displayName,
  customBio,
  avatarUrl,
  variant = 'outline',
  size = 'default',
  className = '',
  showLabel = true,
}: ShareButtonWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Share2 className="w-4 h-4" />
        {showLabel && <span>Share</span>}
      </Button>

      <ShareModal
        open={open}
        onOpenChange={setOpen}
        username={username}
        displayName={displayName}
        customBio={customBio}
        avatarUrl={avatarUrl}
      />
    </>
  );
}
