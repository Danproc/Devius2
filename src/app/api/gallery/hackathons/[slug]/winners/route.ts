import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathon_submissions } from '@/db/schema/hackathon-submissions';
import { hackathons } from '@/db/schema/hackathons';
import { users } from '@/db/schema/user';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * GET /api/gallery/hackathons/[slug]/winners
 * Get winners for a specific hackathon (public)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get hackathon
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.slug, slug));

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Get all winners for this hackathon
    const winners = await db
      .select({
        submission: hackathon_submissions,
        creator: {
          id: users.id,
          name: users.name,
          github_username: users.github_username,
          image: users.image,
        },
      })
      .from(hackathon_submissions)
      .innerJoin(users, eq(hackathon_submissions.user_id, users.id))
      .where(
        and(
          eq(hackathon_submissions.hackathon_id, hackathon.id),
          inArray(hackathon_submissions.status, [
            'winner_first',
            'winner_second',
            'winner_third',
          ])
        )
      );

    // Separate by placement
    const firstPlace = winners.find((w) => w.submission.status === 'winner_first');
    const secondPlace = winners.find((w) => w.submission.status === 'winner_second');
    const thirdPlace = winners.find((w) => w.submission.status === 'winner_third');

    return NextResponse.json({
      hackathon,
      winners: {
        first: firstPlace || null,
        second: secondPlace || null,
        third: thirdPlace || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching hackathon winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}
