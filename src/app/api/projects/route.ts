import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';
import {
  CustomProject,
  createProjectSchema,
  customProjectsArraySchema
} from '@/types/projects';

/**
 * GET /api/projects
 * Fetch all custom projects for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's devcard
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.user_id, session.user.id))
      .limit(1);

    if (!devcard) {
      return NextResponse.json(
        { error: 'DevCard not found' },
        { status: 404 }
      );
    }

    const projects = (devcard.custom_projects as CustomProject[]) || [];

    // Sort by order
    const sortedProjects = projects.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      projects: sortedProjects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new custom project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid project data', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Fetch user's devcard
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.user_id, session.user.id))
      .limit(1);

    if (!devcard) {
      return NextResponse.json(
        { error: 'DevCard not found' },
        { status: 404 }
      );
    }

    const currentProjects = (devcard.custom_projects as CustomProject[]) || [];

    // Check max limit
    if (currentProjects.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 projects allowed' },
        { status: 400 }
      );
    }

    // Create new project with auto-generated ID and order
    const newProject: CustomProject = {
      ...validation.data,
      id: crypto.randomUUID(),
      order: currentProjects.length,
    };

    const updatedProjects = [...currentProjects, newProject];

    // Update database
    const [updatedCard] = await db
      .update(devcards)
      .set({
        custom_projects: updatedProjects,
        updated_at: new Date(),
      })
      .where(eq(devcards.user_id, session.user.id))
      .returning();

    // Revalidate the public profile page
    try {
      revalidatePath(`/${updatedCard.url_slug}`);
      revalidateTag('devcards');
    } catch (error) {
      console.error('Failed to revalidate cache:', error);
    }

    return NextResponse.json({
      success: true,
      project: newProject,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects
 * Update an existing project
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's devcard
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.user_id, session.user.id))
      .limit(1);

    if (!devcard) {
      return NextResponse.json(
        { error: 'DevCard not found' },
        { status: 404 }
      );
    }

    const currentProjects = (devcard.custom_projects as CustomProject[]) || [];
    const projectIndex = currentProjects.findIndex(p => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project
    const updatedProject = {
      ...currentProjects[projectIndex],
      ...updates,
      id, // Ensure ID cannot be changed
    };

    const updatedProjects = [...currentProjects];
    updatedProjects[projectIndex] = updatedProject;

    // Validate updated projects array
    const validation = customProjectsArraySchema.safeParse(updatedProjects);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid project data', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update database
    const [updatedCard] = await db
      .update(devcards)
      .set({
        custom_projects: updatedProjects,
        updated_at: new Date(),
      })
      .where(eq(devcards.user_id, session.user.id))
      .returning();

    // Revalidate the public profile page
    try {
      revalidatePath(`/${updatedCard.url_slug}`);
      revalidateTag('devcards');
    } catch (error) {
      console.error('Failed to revalidate cache:', error);
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects
 * Delete a project
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's devcard
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.user_id, session.user.id))
      .limit(1);

    if (!devcard) {
      return NextResponse.json(
        { error: 'DevCard not found' },
        { status: 404 }
      );
    }

    const currentProjects = (devcard.custom_projects as CustomProject[]) || [];
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Remove project and reorder
    const updatedProjects = currentProjects
      .filter(p => p.id !== projectId)
      .map((p, index) => ({ ...p, order: index }));

    // Update database
    const [updatedCard] = await db
      .update(devcards)
      .set({
        custom_projects: updatedProjects,
        updated_at: new Date(),
      })
      .where(eq(devcards.user_id, session.user.id))
      .returning();

    // Revalidate the public profile page
    try {
      revalidatePath(`/${updatedCard.url_slug}`);
      revalidateTag('devcards');
    } catch (error) {
      console.error('Failed to revalidate cache:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
