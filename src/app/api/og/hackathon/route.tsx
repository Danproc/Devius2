import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Generate custom OG image for hackathon pages
 * Displays hackathon title and prize information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const title = searchParams.get('title');
    const prize = searchParams.get('prize');
    const currency = searchParams.get('currency') || 'USD';
    const startDate = searchParams.get('startDate');

    // Validation
    if (!title || !prize) {
      return new Response('Missing required parameters: title, prize', { status: 400 });
    }

    // Format prize
    const formattedPrize = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(Number(prize));

    // Format date if provided
    const formattedDate = startDate
      ? new Date(startDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0a',
            padding: '60px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{
              fontSize: 24,
              color: '#00ff00',
              margin: 0,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              STACKPASS HACKATHONS
            </p>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.2,
                maxWidth: 1000
              }}
            >
              {title}
            </h1>
            <div style={{
              display: 'flex',
              gap: 30,
              fontSize: 28,
              color: '#a0a0a0',
              alignItems: 'center'
            }}>
              <span style={{ color: '#00ff00', display: 'flex', alignItems: 'center' }}>
                ★ First Prize: {formattedPrize}
              </span>
              {formattedDate && (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  📅 {formattedDate}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#00ff00',
              letterSpacing: '0.05em'
            }}>
              STACKPASS
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (error) {
    console.error('Failed to generate hackathon OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
