'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Home, LayoutDashboard, Menu } from 'lucide-react';
import { ShareModal } from '@/components/sharing/share-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ProfileActionButtonsProps {
  username: string;
  displayName: string;
  customBio?: string;
  avatarUrl?: string;
  profileUserId: string;
  showWalletOptions?: boolean;
}

export function ProfileActionButtons({
  username,
  displayName,
  customBio,
  avatarUrl,
  profileUserId,
  showWalletOptions = false,
}: ProfileActionButtonsProps) {
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.id === profileUserId;
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop: Show all buttons in a row */}
      <div className="hidden md:flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-devcard-border bg-devcard-base hover:bg-devcard-green/10 hover:border-devcard-green text-devcard-text"
        >
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Visit Website
          </Link>
        </Button>

        {isOwnProfile && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-devcard-border bg-devcard-base hover:bg-devcard-green/10 hover:border-devcard-green text-devcard-text"
          >
            <Link href="/app">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        )}

        <Button
          onClick={() => setShareOpen(true)}
          variant="default"
          size="sm"
          className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Mobile: Menu toggle button */}
      <div className="md:hidden">
        <Button
          onClick={() => setMobileMenuOpen(true)}
          variant="default"
          size="sm"
          className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Share Modal (both desktop and mobile) */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        username={username}
        displayName={displayName}
        customBio={customBio}
        avatarUrl={avatarUrl}
        showWalletOptions={showWalletOptions}
      />

      {/* Mobile Actions Modal */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="bg-devcard-base border-devcard-border">
          <DialogHeader>
            <DialogTitle className="text-devcard-heading">Actions</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start border-devcard-border bg-[#0a0f1a] hover:bg-devcard-green/10 hover:border-devcard-green text-devcard-text"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Visit StackPass Website
              </Link>
            </Button>

            {isOwnProfile && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-devcard-border bg-[#0a0f1a] hover:bg-devcard-green/10 hover:border-devcard-green text-devcard-text"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/app">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            )}

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setShareOpen(true);
              }}
              className="w-full justify-start bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
