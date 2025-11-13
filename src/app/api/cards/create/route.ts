import { NextRequest, NextResponse } from 'next/server';
import withAuthRequired from '@/lib/auth/withAuthRequired';
import { createDevCard, hasDevCard } from '@/lib/devcard';

/**
 * POST /api/cards/create
 * Manually create a DevCard for the authenticated user
 * This is a fallback in case auto-creation during sign-in fails
 */
export const POST = withAuthRequired(async (req: NextRequest, context) => {
  const userId = context.session.user.id;

  try {
    // Check if DevCard already exists
    const exists = await hasDevCard(userId);

    if (exists) {
      return NextResponse.json(
        { message: 'DevCard already exists', alreadyExists: true },
        { status: 200 }
      );
    }

    // Create DevCard
    console.log('🔵 Manual DevCard creation for user:', userId);
    const result = await createDevCard(userId);
    console.log(`✅ DevCard created at /${result.devcard.url_slug}`);

    return NextResponse.json(
      {
        message: 'DevCard created successfully',
        url: result.url,
        devcard: {
          id: result.devcard.id,
          url_slug: result.devcard.url_slug,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ DevCard creation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create DevCard',
        message: error.message || 'An error occurred while creating your DevCard',
      },
      { status: 500 }
    );
  }
});
