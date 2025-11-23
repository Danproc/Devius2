/**
 * Pricing Tiers API
 * T014: Return active premium tiers with pricing from database
 */

import { NextResponse } from 'next/server';
import { getActivePremiumTiers } from '@/lib/premium/tiers';

export async function GET() {
  try {
    const tiers = await getActivePremiumTiers();

    return NextResponse.json({
      tiers,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching premium tiers:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch premium tiers',
        tiers: [],
        success: false,
      },
      { status: 500 }
    );
  }
}
