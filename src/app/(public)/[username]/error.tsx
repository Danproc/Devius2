'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('DevCard page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#04080f] animate-fade-in">
      <Card className="max-w-md w-full bg-[#04080f] border border-[#121824] rounded-3xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="size-16 text-destructive animate-pulse" />
          </div>
          <CardTitle className="text-2xl text-[#dde3ed]">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-[#5b6a7f]">
            We encountered an error while loading this DevCard. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-[#5b6a7f] font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium">
              Try Again
            </Button>
            <Button asChild variant="outline" className="border-[#121824] hover:bg-white/5 text-[#5b6a7f]">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
