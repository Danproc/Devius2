import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_registrations } from '@/db/schema/hackathon-registrations';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, and, isNull, count as drizzleCount, sql } from 'drizzle-orm';
import { getUserRegistration, getRegistrationCount } from '@/lib/hackathons/queries';
import { isRegistrationPeriodActive } from '@/lib/hackathons/validations';
import { render } from '@react-email/components';
import sendMail from '@/lib/email/sendMail';
import RegistrationConfirmation from '@/emails/RegistrationConfirmation';

/**
 * POST /api/hackathons/[id]/registrations
 * Register for a hackathon (with atomic capacity check)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: hackathonId } = await params;
    const body = await req.json();
    const { participation_type } = body;

    // Validate participation type
    if (!participation_type || !['solo', 'team'].includes(participation_type)) {
      return NextResponse.json(
        { error: 'Participation type must be "solo" or "team"' },
        { status: 400 }
      );
    }

    // Get hackathon
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check if registration period is active
    if (
      !hackathon.registration_start_at ||
      !hackathon.registration_end_at ||
      !isRegistrationPeriodActive(
        new Date(hackathon.registration_start_at),
        new Date(hackathon.registration_end_at)
      )
    ) {
      return NextResponse.json(
        { error: 'Registration period is not active' },
        { status: 400 }
      );
    }

    // Check if user is Pro
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

    if (
      !user?.is_premium ||
      (user.premium_expires_at && new Date(user.premium_expires_at) < new Date())
    ) {
      return NextResponse.json(
        { error: 'Pro membership required to register for hackathons' },
        { status: 403 }
      );
    }

    // Check if user already registered
    const existingRegistration = await getUserRegistration(hackathonId, session.user.id);
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this hackathon' },
        { status: 400 }
      );
    }

    // Check capacity before attempting registration
    const maxParticipants = hackathon.max_participants as number | null;
    if (maxParticipants !== null) {
      const currentCount = await getRegistrationCount(hackathonId);
      if (currentCount >= maxParticipants) {
        return NextResponse.json(
          { error: 'Hackathon is at full capacity' },
          { status: 400 }
        );
      }
    }

    // Insert registration (unique constraint prevents duplicates)
    try {
      const [registration] = await db
        .insert(hackathon_registrations)
        .values({
          hackathon_id: hackathonId,
          user_id: session.user.id,
          participation_type: participation_type as 'solo' | 'team',
        })
        .returning();

      // Send confirmation email
      try {
        const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

        const html = await render(
          RegistrationConfirmation({
            userName: user.name || 'Developer',
            hackathonTitle: hackathon.title,
            hackathonTheme: hackathon.theme,
            participationType: participation_type,
            hackathonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/hackathons/${hackathon.slug}`,
            startDate: new Date(hackathon.start_at).toLocaleDateString(),
            submissionDeadline: new Date(hackathon.submission_deadline_at).toLocaleDateString(),
          })
        );

        await sendMail(user.email, `You're registered for ${hackathon.title}!`, html);
      } catch (emailError) {
        console.error('Failed to send registration email:', emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({ registration }, { status: 201 });
    } catch (error: any) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You are already registered for this hackathon' },
          { status: 400 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register for hackathon' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hackathons/[id]/registrations
 * Get registration stats for a hackathon
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;

    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    const registrationCount = await getRegistrationCount(hackathonId);
    const maxParticipants = hackathon.max_participants as number | null;

    return NextResponse.json({
      count: registrationCount,
      max: maxParticipants,
      is_full: maxParticipants !== null && registrationCount >= maxParticipants,
      is_active: isRegistrationPeriodActive(
        hackathon.registration_start_at ? new Date(hackathon.registration_start_at) : null,
        hackathon.registration_end_at ? new Date(hackathon.registration_end_at) : null
      ),
    });
  } catch (error: any) {
    console.error('Error fetching registration stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration stats' },
      { status: 500 }
    );
  }
}
