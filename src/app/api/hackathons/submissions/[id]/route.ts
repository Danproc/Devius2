import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathons } from '@/db/schema/hackathons';
import { eq, and } from 'drizzle-orm';
import {
  isValidGitHubUrl,
  isValidDemoUrl,
  isValidProjectTitle,
  isValidDescription,
  isValidTechStack,
  isBeforeDeadline,
} from '@/lib/hackathons/validations';

/**
 * GET /api/hackathons/submissions/[id]
 * Get a specific submission
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;

    const [submission] = await db
      .select()
      .from(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/hackathons/submissions/[id]
 * Update a submission (only by owner, before deadline)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: submissionId } = await params;
    const body = await req.json();

    // Get existing submission
    const [existingSubmission] = await db
      .select()
      .from(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check ownership
    if (existingSubmission.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own submissions' },
        { status: 403 }
      );
    }

    // Check if submission is disqualified or a winner (can't edit)
    if (
      existingSubmission.status === 'disqualified' ||
      existingSubmission.status === 'winner_first' ||
      existingSubmission.status === 'winner_second' ||
      existingSubmission.status === 'winner_third'
    ) {
      return NextResponse.json(
        { error: 'Cannot edit a disqualified or winning submission' },
        { status: 400 }
      );
    }

    // Get hackathon to check deadline
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, existingSubmission.hackathon_id));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check deadline
    if (!isBeforeDeadline(new Date(hackathon.submission_deadline_at))) {
      return NextResponse.json(
        { error: 'Cannot edit submission after deadline' },
        { status: 400 }
      );
    }

    // Build update object with validations
    const updates: any = {
      updated_at: new Date(),
    };

    const {
      project_title,
      description,
      github_url,
      demo_url,
      video_url,
      tech_stack,
      status,
    } = body;

    // Validate and update fields
    if (project_title !== undefined) {
      if (!isValidProjectTitle(project_title)) {
        return NextResponse.json(
          { error: 'Project title must be between 3 and 100 characters' },
          { status: 400 }
        );
      }
      updates.project_title = project_title;
    }

    if (description !== undefined) {
      if (!isValidDescription(description)) {
        return NextResponse.json(
          { error: 'Description must be between 10 and 5000 characters' },
          { status: 400 }
        );
      }
      updates.description = description;
    }

    if (github_url !== undefined) {
      if (!isValidGitHubUrl(github_url)) {
        return NextResponse.json(
          { error: 'Valid GitHub repository URL required (https://github.com/username/repo)' },
          { status: 400 }
        );
      }
      updates.github_url = github_url;
    }

    if (demo_url !== undefined) {
      if (demo_url && !isValidDemoUrl(demo_url)) {
        return NextResponse.json(
          { error: 'Demo URL must be a valid HTTP/HTTPS URL' },
          { status: 400 }
        );
      }
      updates.demo_url = demo_url || null;
    }

    if (video_url !== undefined) {
      if (video_url && !isValidDemoUrl(video_url)) {
        return NextResponse.json(
          { error: 'Video URL must be a valid HTTP/HTTPS URL' },
          { status: 400 }
        );
      }
      updates.video_url = video_url || null;
    }

    if (tech_stack !== undefined) {
      if (!isValidTechStack(tech_stack)) {
        return NextResponse.json(
          { error: 'Tech stack must contain 1-10 tags, each 2-30 characters' },
          { status: 400 }
        );
      }
      updates.tech_stack = tech_stack;
    }

    // Handle status change from draft to submitted
    if (status !== undefined && status !== existingSubmission.status) {
      if (status === 'submitted' && existingSubmission.status === 'draft') {
        updates.status = 'submitted';
        updates.submitted_at = new Date();
      } else if (status === 'draft' && existingSubmission.status === 'submitted') {
        // Allow reverting to draft before deadline
        updates.status = 'draft';
        updates.submitted_at = null;
      } else {
        return NextResponse.json(
          { error: 'Invalid status transition' },
          { status: 400 }
        );
      }
    }

    // Update submission
    const [updatedSubmission] = await db
      .update(hackathon_submissions)
      .set(updates)
      .where(eq(hackathon_submissions.id, submissionId))
      .returning();

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update submission' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hackathons/submissions/[id]
 * Delete a submission (only by owner, before deadline)
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

    const { id: submissionId } = await params;

    // Get existing submission
    const [existingSubmission] = await db
      .select()
      .from(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check ownership
    if (existingSubmission.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own submissions' },
        { status: 403 }
      );
    }

    // Get hackathon to check deadline
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, existingSubmission.hackathon_id));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check deadline
    if (!isBeforeDeadline(new Date(hackathon.submission_deadline_at))) {
      return NextResponse.json(
        { error: 'Cannot delete submission after deadline' },
        { status: 400 }
      );
    }

    // Delete submission
    await db
      .delete(hackathon_submissions)
      .where(eq(hackathon_submissions.id, submissionId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
