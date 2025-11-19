import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

/**
 * GET /api/hackathons/[id]/users/search?q=username
 * Search registered users for a hackathon (for team invites)
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
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Use direct postgres connection
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const searchPattern = `%${query.toLowerCase()}%`;

      // Search all users, exclude current user
      const users = await sql`
        SELECT id, github_username, name, image, is_premium, premium_expires_at
        FROM app_user
        WHERE id != ${session.user.id}
        AND (
          LOWER(COALESCE(github_username, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(name, '')) LIKE ${searchPattern}
        )
        LIMIT 15
      `;

      await sql.end();
      return NextResponse.json({ users });
    } catch (error) {
      await sql.end();
      throw error;
    }
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
