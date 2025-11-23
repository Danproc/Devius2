'use client';

import { useState } from 'react';
import { Share2, Home, LayoutDashboard, Menu } from 'lucide-react';
import { ShareModal } from '@/components/sharing/share-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import useUser from '@/lib/users/useUser';

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
  const { user } = useUser();
  const isOwnProfile = session?.user?.id === profileUserId;
  const [shareOpen, setShareOpen] = useState(false);

  // Get logged-in user's info
  const loggedInUserAvatar = user?.image;
  const loggedInUserName = user?.name || user?.email || '';

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // If user is not logged in, show green button
  if (!session) {
    return (
      <>
        {/* Desktop: Green menu button */}
        <div className="hidden md:block">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-devcard-base border-devcard-border"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Visit Website
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: Green menu button with Share */}
        <div className="md:hidden">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-devcard-base border-devcard-border"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Visit Website
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShareOpen(true)}
                className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Share Modal */}
        <ShareModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          username={username}
          displayName={displayName}
          customBio={customBio}
          avatarUrl={avatarUrl}
          showWalletOptions={showWalletOptions}
        />
      </>
    );
  }

  // User is logged in, show avatar dropdown
  return (
    <>
      {/* Desktop: Avatar dropdown + Share button */}
      <div className="hidden md:flex items-center gap-2">
        <Button
          onClick={() => setShareOpen(true)}
          variant="default"
          size="sm"
          className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none focus:ring-2 focus:ring-devcard-green rounded-full">
              <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-devcard-border hover:ring-devcard-green transition-all">
                <AvatarImage src={loggedInUserAvatar || undefined} alt={loggedInUserName} />
                <AvatarFallback className="bg-devcard-green text-black font-medium">
                  {getInitials(loggedInUserName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-devcard-base border-devcard-border"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
              >
                <Home className="w-4 h-4 mr-2" />
                Visit Website
              </Link>
            </DropdownMenuItem>

            {isOwnProfile && (
              <DropdownMenuItem asChild>
                <Link
                  href="/app"
                  className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Avatar dropdown with Share option */}
      <div className="md:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none focus:ring-2 focus:ring-devcard-green rounded-full">
              <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-devcard-border hover:ring-devcard-green transition-all">
                <AvatarImage src={loggedInUserAvatar || undefined} alt={loggedInUserName} />
                <AvatarFallback className="bg-devcard-green text-black font-medium">
                  {getInitials(loggedInUserName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-devcard-base border-devcard-border"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
              >
                <Home className="w-4 h-4 mr-2" />
                Visit Website
              </Link>
            </DropdownMenuItem>

            {isOwnProfile && (
              <DropdownMenuItem asChild>
                <Link
                  href="/app"
                  className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => setShareOpen(true)}
              className="cursor-pointer hover:bg-devcard-green/10 focus:bg-devcard-green/10 text-devcard-text"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    </>
  );
}
