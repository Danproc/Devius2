/**
 * PATCH /api/hackathons/[id] - Update hackathon (admin only)
 * GET /api/hackathons/[id] - Get hackathon by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { requireAdmin } from '@/middleware/admin-auth';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, id))
      .limit(1);

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return NextResponse.json(hackathon);
  } catch (error: any) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathon', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const updates = await req.json();

    // Update hackathon
    const [updatedHackathon] = await db
      .update(hackathons)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(hackathons.id, id))
      .returning();

    if (!updatedHackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return NextResponse.json(updatedHackathon);
  } catch (error: any) {
    console.error('Error updating hackathon:', error);

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update hackathon', message: error.message },
      { status: 500 }
    );
  }
}
