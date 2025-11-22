import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { updateDirectoryVisibility } from '@/db/queries/members';

/**
 * PATCH /api/user/privacy
 * Update directory visibility for the current user
 * T024: Privacy control API endpoint
 */
export const PATCH = withAuthRequired(async (req: NextRequest, { session }) => {
  try {
    const body = await req.json();
    const { is_public } = body;

    // Validate input
    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body. is_public must be a boolean.' },
        { status: 400 }
      );
    }

    // Update directory visibility
    const result = await updateDirectoryVisibility(session.user.id, is_public);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      is_public: result.is_public,
    });
  } catch (error) {
    console.error('Privacy update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
});
