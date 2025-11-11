'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface QRCodeProps {
  username: string;
  size?: number;
  className?: string;
}

interface QRCodeData {
  qr_code: string; // Base64 data URL
  url: string;
}

export function QRCode({ username, size = 400, className = '' }: QRCodeProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/share/qr/${username}?size=${size}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate QR code');
        }

        const data = await response.json();
        setQrData(data);
      } catch (err) {
        console.error('Failed to fetch QR code:', err);
        setError(err instanceof Error ? err.message : 'Failed to load QR code');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchQRCode();
    }
  }, [username, size]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF94]" />
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div
        className={`flex items-center justify-center bg-[#121824] border border-[#1e2838] rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-red-400 text-center px-4">
          {error || 'Failed to load QR code'}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={qrData.qr_code}
        alt={`QR code for ${username}`}
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
    </div>
  );
}
