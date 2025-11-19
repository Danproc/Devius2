/**
 * POST /api/hackathons/[id]/publish - Publish hackathon (admin only)
 * Changes status from draft to upcoming or active based on start date
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { requireAdmin } from '@/middleware/admin-auth';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    // Get hackathon
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, id))
      .limit(1);

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    if (hackathon.status !== 'draft') {
      return NextResponse.json(
        { error: 'Hackathon already published' },
        { status: 400 }
      );
    }

    // Determine new status based on start date
    const now = new Date();
    const startDate = new Date(hackathon.start_at);
    const newStatus = startDate <= now ? 'active' : 'upcoming';

    // Update status
    const [updated] = await db
      .update(hackathons)
      .set({
        status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(hackathons.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error publishing hackathon:', error);

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to publish hackathon', message: error.message },
      { status: 500 }
    );
  }
}
