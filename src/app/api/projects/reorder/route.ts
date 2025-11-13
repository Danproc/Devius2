import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';
import { CustomProject } from '@/types/projects';

/**
 * PATCH /api/projects/reorder
 * Reorder projects (move up or down)
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
    const { projectId, direction } = body;

    if (!projectId || !direction) {
      return NextResponse.json(
        { error: 'Project ID and direction (up/down) are required' },
        { status: 400 }
      );
    }

    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Direction must be "up" or "down"' },
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

    // Calculate new index
    const newIndex = direction === 'up' ? projectIndex - 1 : projectIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= currentProjects.length) {
      return NextResponse.json(
        { error: 'Cannot move project in that direction' },
        { status: 400 }
      );
    }

    // Swap projects
    const updatedProjects = [...currentProjects];
    const temp = updatedProjects[projectIndex];
    updatedProjects[projectIndex] = updatedProjects[newIndex];
    updatedProjects[newIndex] = temp;

    // Update order values
    updatedProjects.forEach((project, index) => {
      project.order = index;
    });

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
      projects: updatedProjects,
    });
  } catch (error) {
    console.error('Error reordering projects:', error);
    return NextResponse.json(
      { error: 'Failed to reorder projects' },
      { status: 500 }
    );
  }
}
