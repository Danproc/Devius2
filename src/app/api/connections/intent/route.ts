import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/connections/intent
 * Store connection intent in a secure cookie before redirecting to auth
 * This preserves the user's intention to connect with someone through the OAuth flow
 */
export async function POST(req: NextRequest) {
  try {
    const { targetUserId } = await req.json();

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: 'targetUserId is required and must be a string' },
        { status: 400 }
      );
    }

    // Store connection intent in secure, httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('connection_intent', targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes - enough time to complete OAuth
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing connection intent:', error);
    return NextResponse.json(
      { error: 'Failed to store connection intent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/connections/intent
 * Clear the connection intent cookie
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('connection_intent');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing connection intent:', error);
    return NextResponse.json(
      { error: 'Failed to clear connection intent' },
      { status: 500 }
    );
  }
}
