import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, and } from 'drizzle-orm';
import {
  isValidGitHubUrl,
  isValidDemoUrl,
  isValidProjectTitle,
  isValidDescription,
  isValidTechStack,
  isBeforeDeadline,
} from '@/lib/hackathons/validations';
import { getUserRegistration } from '@/lib/hackathons/queries';

/**
 * POST /api/hackathons/[id]/submissions
 * Create or submit a hackathon project
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

    // Validate input
    const {
      project_title,
      description,
      github_url,
      demo_url,
      video_url,
      tech_stack,
      status = 'draft', // Can be 'draft' or 'submitted'
    } = body;

    // Check hackathon exists and is active
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    if (hackathon.status !== 'active') {
      return NextResponse.json(
        { error: 'Hackathon is not accepting submissions' },
        { status: 400 }
      );
    }

    // Check deadline
    if (!isBeforeDeadline(new Date(hackathon.submission_deadline_at))) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user is Pro
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user?.is_premium || (user.premium_expires_at && new Date(user.premium_expires_at) < new Date())) {
      return NextResponse.json(
        { error: 'Pro membership required to participate in hackathons' },
        { status: 403 }
      );
    }

    // Check if user is registered (if hackathon has registration)
    if (hackathon.registration_start_at && hackathon.registration_end_at) {
      const userRegistration = await getUserRegistration(hackathonId, session.user.id);
      if (!userRegistration) {
        return NextResponse.json(
          { error: 'You must register during the registration period to submit a project' },
          { status: 403 }
        );
      }
    }

    // Check if user already has a submission (solo or team)
    const existingSubmissions = await db
      .select()
      .from(hackathon_submissions)
      .where(
        and(
          eq(hackathon_submissions.hackathon_id, hackathonId),
          eq(hackathon_submissions.user_id, session.user.id)
        )
      );

    if (existingSubmissions.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a project for this hackathon' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!project_title || !isValidProjectTitle(project_title)) {
      return NextResponse.json(
        { error: 'Project title must be between 3 and 100 characters' },
        { status: 400 }
      );
    }

    if (!description || !isValidDescription(description)) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    if (!github_url || !isValidGitHubUrl(github_url)) {
      return NextResponse.json(
        { error: 'Valid GitHub repository URL required (https://github.com/username/repo)' },
        { status: 400 }
      );
    }

    if (demo_url && !isValidDemoUrl(demo_url)) {
      return NextResponse.json(
        { error: 'Demo URL must be a valid HTTP/HTTPS URL' },
        { status: 400 }
      );
    }

    if (video_url && !isValidDemoUrl(video_url)) {
      return NextResponse.json(
        { error: 'Video URL must be a valid HTTP/HTTPS URL' },
        { status: 400 }
      );
    }

    if (!tech_stack || !isValidTechStack(tech_stack)) {
      return NextResponse.json(
        { error: 'Tech stack must contain 1-10 tags, each 2-30 characters' },
        { status: 400 }
      );
    }

    // Create submission
    const submissionData: any = {
      hackathon_id: hackathonId,
      user_id: session.user.id,
      project_title,
      description,
      github_url,
      demo_url: demo_url || null,
      video_url: video_url || null,
      tech_stack,
      status,
      team_id: null, // Solo submission by default
    };

    // If submitting (not draft), set submitted_at timestamp
    if (status === 'submitted') {
      submissionData.submitted_at = new Date();
    }

    const [submission] = await db
      .insert(hackathon_submissions)
      .values(submissionData)
      .returning();

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create submission' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hackathons/[id]/submissions
 * List all submissions for a hackathon (public)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;

    // Get all submitted submissions (not drafts)
    const submissions = await db
      .select()
      .from(hackathon_submissions)
      .where(
        and(
          eq(hackathon_submissions.hackathon_id, hackathonId),
          eq(hackathon_submissions.status, 'submitted')
        )
      );

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
