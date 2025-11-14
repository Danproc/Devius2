import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { connections } from '@/db/schema/connections';
import { count, eq } from 'drizzle-orm';
import { LiveStatsClient } from './live-stats-client';

export async function LiveStats() {
  // Fetch real-time stats from database
  const [developerCount] = await db
    .select({ count: count() })
    .from(devcards)
    .where(eq(devcards.is_public, true));

  const [connectionCount] = await db
    .select({ count: count() })
    .from(connections)
    .where(eq(connections.status, 'accepted'));

  const devCount = developerCount?.count || 0;
  const connCount = connectionCount?.count || 0;

  return <LiveStatsClient devCount={devCount} connCount={connCount} />;
}
