'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';

interface GitHubSignInProps {
  redirectTo?: string;
  fullWidth?: boolean;
}

export function GitHubSignIn({ redirectTo = '/app', fullWidth = false }: GitHubSignInProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          scopes: 'read:user user:email repo', // Need repo for reading repos
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('GitHub sign-in error:', err);
      setError(err.message || 'Failed to sign in with GitHub');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSignIn}
        disabled={loading}
        className={`
          bg-[#00FF88]
          hover:bg-[#00DD77]
          text-black
          font-semibold
          h-12
          ${fullWidth ? 'w-full' : ''}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Github className="mr-2 h-5 w-5" />
            Connect with GitHub
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
