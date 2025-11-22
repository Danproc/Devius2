import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_scores } from '@/db/schema/hackathon-scores';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { eq, and } from 'drizzle-orm';
import { isAdmin } from '@/middleware/admin-auth';

/**
 * POST /api/hackathons/submissions/[id]/score
 * Save or update judge score for a submission
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin authorization
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: submissionId } = await params;
    const body = await request.json();

    const {
      innovation,
      technical_execution,
      design_ux,
      completeness,
      total_score,
      notes
    } = body;

    // Validate scores are in range
    if (
      innovation < 0 || innovation > 10 ||
      technical_execution < 0 || technical_execution > 10 ||
      design_ux < 0 || design_ux > 10 ||
      completeness < 0 || completeness > 10
    ) {
      return NextResponse.json(
        { error: 'All scores must be between 0-10' },
        { status: 400 }
      );
    }

    // Verify submission exists
    const [submission] = await db
      .select()
      .from(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if score already exists for this judge
    const [existingScore] = await db
      .select()
      .from(hackathon_scores)
      .where(
        and(
          eq(hackathon_scores.submission_id, submissionId),
          eq(hackathon_scores.judge_user_id, session.user.id)
        )
      );

    if (existingScore) {
      // Update existing score
      const [updated] = await db
        .update(hackathon_scores)
        .set({
          innovation,
          technical_execution,
          design_ux,
          completeness,
          total_score,
          notes,
          updated_at: new Date(),
        })
        .where(eq(hackathon_scores.id, existingScore.id))
        .returning();

      return NextResponse.json({
        score: updated,
        message: 'Score updated successfully'
      });
    } else {
      // Create new score
      const [newScore] = await db
        .insert(hackathon_scores)
        .values({
          hackathon_id: submission.hackathon_id,
          submission_id: submissionId,
          judge_user_id: session.user.id,
          innovation,
          technical_execution,
          design_ux,
          completeness,
          total_score,
          notes,
        })
        .returning();

      return NextResponse.json({
        score: newScore,
        message: 'Score saved successfully'
      });
    }
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hackathons/submissions/[id]/score
 * Get judge's score for a submission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: submissionId } = await params;

    // Get score for current judge
    const [score] = await db
      .select()
      .from(hackathon_scores)
      .where(
        and(
          eq(hackathon_scores.submission_id, submissionId),
          eq(hackathon_scores.judge_user_id, session.user.id)
        )
      );

    return NextResponse.json({ score: score || null });
  } catch (error) {
    console.error('Error fetching score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch score' },
      { status: 500 }
    );
  }
}
