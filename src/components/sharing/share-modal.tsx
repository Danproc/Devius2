'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCode } from './qr-code';
import { WalletPassButton } from './wallet-pass-button';
import { generateAllShareLinks, type ShareMetadata } from '@/lib/sharing/share-links';
import { Copy, Check, Twitter, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  displayName: string;
  customBio?: string;
  avatarUrl?: string;
  showWalletOptions?: boolean;
}

export function ShareModal({
  open,
  onOpenChange,
  username,
  displayName,
  customBio,
  avatarUrl,
  showWalletOptions = true,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate share links
  const metadata: ShareMetadata = {
    username,
    display_name: displayName,
    custom_bio: customBio,
  };

  const shareLinks = generateAllShareLinks(metadata, ['twitter', 'linkedin', 'email', 'copy']);
  const copyLink = shareLinks.find((link) => link.platform === 'copy');
  const socialLinks = shareLinks.filter((link) => link.platform !== 'copy');

  const handleCopyLink = async () => {
    if (!copyLink) return;

    try {
      await navigator.clipboard.writeText(copyLink.url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#04080f] border border-[#121824] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Connect with {displayName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <QRCode username={username} size={280} className="rounded-lg" />
          </div>

          {/* Wallet Pass Buttons - Only show on admin dashboard */}
          {showWalletOptions && (
            <div className="w-full flex flex-col gap-3">
              <WalletPassButton
                username={username}
                platform="apple"
                displayName={displayName}
                className="w-full"
              />
              <WalletPassButton
                username={username}
                platform="google"
                displayName={displayName}
                className="w-full"
              />
            </div>
          )}

          {/* Copy Link Button */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full bg-[#121824] border-[#1e2838] hover:bg-[#1e2838] text-white"
            size="lg"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#00FF94]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          {/* Social Share Buttons */}
          <div className="w-full">
            <p className="text-sm text-gray-400 text-center mb-3">Share on social media</p>
            <div className="flex gap-3 justify-center">
              {socialLinks.map((link) => (
                <Button
                  key={link.platform}
                  onClick={() => handleSocialShare(link.url)}
                  variant="outline"
                  size="icon"
                  className="bg-[#121824] border-[#1e2838] hover:bg-[#1e2838] text-white"
                  title={link.label}
                >
                  {getSocialIcon(link.platform)}
                </Button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full pt-2">
            <Button
              asChild
              className="w-full bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-semibold"
              size="lg"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                Create your own Devius DevCard
              </a>
            </Button>
          </div>

          {/* Social Proof (Optional - can be populated with real data later) */}
          <div className="w-full text-center">
            <p className="text-xs text-gray-500">
              Join thousands of developers sharing their DevCards
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
