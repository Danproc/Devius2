'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type WalletPlatform = 'apple' | 'google';

interface WalletPassButtonProps {
  username: string;
  platform: WalletPlatform;
  displayName?: string;
  className?: string;
}

export function WalletPassButton({
  username,
  platform,
  displayName,
  className = '',
}: WalletPassButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/share/wallet-pass/${username}?platform=${platform}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate ${platform} wallet pass`);
      }

      if (platform === 'apple') {
        // For Apple Wallet, download the .pkpass file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${username}-devcard.pkpass`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Apple Wallet pass downloaded!');
      } else {
        // For Google Pay, redirect to save URL
        const data = await response.json();
        window.open(data.save_url, '_blank');
        toast.success('Opening Google Pay...');
      }
    } catch (err) {
      console.error(`Failed to generate ${platform} wallet pass:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to add to ${platform === 'apple' ? 'Apple Wallet' : 'Google Pay'}`);
    } finally {
      setLoading(false);
    }
  };

  const isApple = platform === 'apple';
  const label = isApple ? 'Add to Apple Wallet' : 'Add to Google Pay';
  const icon = isApple ? '🍎' : '📱';

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className={`bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-medium ${className}`}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span>{icon}</span>
          <span>{label}</span>
          <Download className="w-4 h-4" />
        </>
      )}
    </Button>
  );
}
