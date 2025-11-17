/**
 * GET /api/hackathons/[slug] - Get hackathon by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHackathonBySlug } from '@/lib/hackathons/queries';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const hackathon = await getHackathonBySlug(slug);

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Don't show draft hackathons to non-admins
    if (hackathon.status === 'draft') {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return NextResponse.json(hackathon);
  } catch (error: any) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathon', message: error.message },
      { status: 500 }
    );
  }
}
