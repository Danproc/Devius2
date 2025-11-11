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
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 devcard-gradient-bg animate-fade-in">
      <Card className="max-w-md w-full glass-card border-white/10 shadow-2xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="size-16 text-destructive animate-pulse" />
          </div>
          <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We encountered an error while loading this DevCard. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium">
              Try Again
            </Button>
            <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
