import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_registrations } from '@/db/schema/hackathon-registrations';
import { hackathons } from '@/db/schema/hackathons';
import { eq, and, isNull } from 'drizzle-orm';
import { getUserRegistration } from '@/lib/hackathons/queries';
import { isRegistrationPeriodActive } from '@/lib/hackathons/validations';

/**
 * GET /api/hackathons/[id]/registrations/me
 * Get current user's registration status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: hackathonId } = await params;

    const registration = await getUserRegistration(hackathonId, session.user.id);

    return NextResponse.json({ registration: registration || null });
  } catch (error: any) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hackathons/[id]/registrations/me
 * Unregister from a hackathon (only before registration_end_at)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: hackathonId } = await params;

    // Get hackathon
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check if registration period is still open (can only unregister before it closes)
    if (
      !hackathon.registration_end_at ||
      new Date() >= new Date(hackathon.registration_end_at)
    ) {
      return NextResponse.json(
        { error: 'Cannot unregister after registration period closes' },
        { status: 400 }
      );
    }

    // Get existing registration
    const existingRegistration = await getUserRegistration(hackathonId, session.user.id);

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'You are not registered for this hackathon' },
        { status: 404 }
      );
    }

    // Hard delete - remove registration record so user can re-register
    await db
      .delete(hackathon_registrations)
      .where(eq(hackathon_registrations.id, existingRegistration.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unregistering:', error);
    return NextResponse.json(
      { error: 'Failed to unregister' },
      { status: 500 }
    );
  }
}
