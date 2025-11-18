'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AchievementCheckerProps {
  profileUserId: string;
}

/**
 * Silent achievement checker component
 * Automatically checks and awards achievements when viewing own profile
 */
export function AchievementChecker({ profileUserId }: AchievementCheckerProps) {
  const { data: session } = useSession();

  useEffect(() => {
    // Only check achievements if viewing own profile
    if (session?.user?.id && session.user.id === profileUserId) {
      // Silent check - no UI feedback, just awards in background
      fetch('/api/achievements/check', {
        method: 'POST',
      }).catch((err) => {
        console.error('Failed to check achievements:', err);
      });
    }
  }, [session?.user?.id, profileUserId]);

  return null; // No UI rendered
}
