/**
 * Test Email Endpoint
 * DELETE THIS FILE BEFORE PRODUCTION!
 *
 * Usage:
 * http://localhost:3000/api/test-email?type=welcome&email=you@email.com
 * http://localhost:3000/api/test-email?type=connection-request&email=you@email.com
 * http://localhost:3000/api/test-email?type=connection-accepted&email=you@email.com
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendConnectionRequestEmail,
  sendConnectionAcceptedEmail,
  isEmailConfigured,
} from '@/lib/email';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const email = searchParams.get('email');

  if (!isEmailConfigured()) {
    return NextResponse.json({
      error: 'Email service not configured',
      message: 'Please set RESEND_API_KEY and RESEND_FROM_EMAIL in your environment variables',
    }, { status: 503 });
  }

  if (!email) {
    return NextResponse.json({
      error: 'Email address required',
      message: 'Add ?email=your@email.com to the URL',
    }, { status: 400 });
  }

  try {
    switch (type) {
      case 'welcome':
        await sendWelcomeEmail({
          to: email,
          name: 'Test User',
        });
        return NextResponse.json({
          success: true,
          message: `Welcome email sent to ${email}`,
        });

      case 'connection-request':
        await sendConnectionRequestEmail({
          to: email,
          requesterName: 'Sarah Kim',
          requesterUsername: 'sarahk',
          message: 'Hey! I saw your profile and would love to connect. Working on similar tech stack!',
        });
        return NextResponse.json({
          success: true,
          message: `Connection request email sent to ${email}`,
        });

      case 'connection-accepted':
        await sendConnectionAcceptedEmail({
          to: email,
          accepterName: 'Dan Miller',
          accepterUsername: 'danproc',
        });
        return NextResponse.json({
          success: true,
          message: `Connection accepted email sent to ${email}`,
        });

      default:
        return NextResponse.json({
          error: 'Invalid type',
          message: 'Type must be: welcome, connection-request, or connection-accepted',
          examples: [
            '/api/test-email?type=welcome&email=you@email.com',
            '/api/test-email?type=connection-request&email=you@email.com',
            '/api/test-email?type=connection-accepted&email=you@email.com',
          ],
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      error: 'Failed to send email',
      message: error.message,
    }, { status: 500 });
  }
}
