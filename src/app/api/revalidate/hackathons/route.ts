import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Revalidate hackathons pages
    revalidatePath('/hackathons');
    revalidatePath('/hackathons/[slug]', 'page');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ revalidated: false, error: 'Error revalidating' }, { status: 500 });
  }
}
