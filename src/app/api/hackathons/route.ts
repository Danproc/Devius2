/**
 * GET /api/hackathons - List hackathons
 * POST /api/hackathons - Create hackathon (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema/hackathons';
import { requireAdmin } from '@/middleware/admin-auth';
import { auth } from '@/auth';
import { desc, inArray } from 'drizzle-orm';
import type { CreateHackathonInput } from '@/types/hackathons';
import { isValidSlug, isValidHackathonDates } from '@/lib/hackathons/validations';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Filter by status if provided
    let results;
    if (status) {
      const statuses = status.split(',');
      results = await db
        .select()
        .from(hackathons)
        .where(inArray(hackathons.status, statuses as any))
        .orderBy(desc(hackathons.start_at));
    } else {
      results = await db
        .select()
        .from(hackathons)
        .orderBy(desc(hackathons.start_at));
    }

    return NextResponse.json({ hackathons: results });
  } catch (error: any) {
    console.error('Error fetching hackathons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathons', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    await requireAdmin();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateHackathonInput = await req.json();

    // Validate slug
    if (!isValidSlug(body.slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      );
    }

    // Validate dates
    const dateValidation = isValidHackathonDates(
      new Date(body.start_at),
      new Date(body.submission_deadline_at),
      body.voting_start_at ? new Date(body.voting_start_at) : null,
      body.voting_end_at ? new Date(body.voting_end_at) : null
    );

    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // Create hackathon
    const [newHackathon] = await db.insert(hackathons).values({
      slug: body.slug,
      title: body.title,
      theme: body.theme,
      description: body.description,
      rules: body.rules,
      start_at: new Date(body.start_at),
      submission_deadline_at: new Date(body.submission_deadline_at),
      voting_start_at: body.voting_start_at ? new Date(body.voting_start_at) : null,
      voting_end_at: body.voting_end_at ? new Date(body.voting_end_at) : null,
      prizes: body.prizes,
      max_participants: body.max_participants,
      created_by: session.user.id,
    }).returning();

    return NextResponse.json(newHackathon, { status: 201 });
  } catch (error: any) {
    console.error('Error creating hackathon:', error);

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create hackathon', message: error.message },
      { status: 500 }
    );
  }
}
