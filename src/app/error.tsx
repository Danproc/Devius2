'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Custom Error Page (500)
 * Catches unhandled errors and displays branded error page
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (or error tracking service)
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="bg-devcard-base min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-devcard-heading mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-devcard-heading mb-4">
          Something Went Wrong
        </h2>
        <p className="text-devcard-text mb-2">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-devcard-text/60 mb-8">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-devcard-green text-black hover:bg-devcard-green/90"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-devcard-border text-devcard-text hover:text-devcard-green"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
