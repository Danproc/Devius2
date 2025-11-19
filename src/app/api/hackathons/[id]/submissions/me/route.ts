import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/hackathons/[id]/submissions/me
 * Get the current user's submission for a hackathon (if any)
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

    // Check for user's submission (solo or team)
    const [submission] = await db
      .select()
      .from(hackathon_submissions)
      .where(
        and(
          eq(hackathon_submissions.hackathon_id, hackathonId),
          eq(hackathon_submissions.user_id, session.user.id)
        )
      );

    if (!submission) {
      return NextResponse.json({ submission: null });
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error('Error fetching user submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}
