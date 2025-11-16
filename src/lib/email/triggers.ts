/**
 * Email Trigger Functions
 * Send emails for key StackPass events
 */

import { sendEmail } from './client';
import Welcome from '@/emails/Welcome';
import ConnectionRequest from '@/emails/ConnectionRequest';
import ConnectionAccepted from '@/emails/ConnectionAccepted';

/**
 * Send welcome email when user signs up
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return sendEmail({
    to,
    subject: 'Welcome to StackPass!',
    react: Welcome({
      userName: name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/app/dashboard`,
    }),
  });
}

/**
 * Send email when someone sends a connection request
 */
export async function sendConnectionRequestEmail({
  to,
  requesterName,
  requesterUsername,
  message,
}: {
  to: string;
  requesterName: string;
  requesterUsername: string;
  message?: string;
}) {
  return sendEmail({
    to,
    subject: `${requesterName} wants to connect on StackPass`,
    react: ConnectionRequest({
      requesterName,
      cardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/${requesterUsername}`,
      message,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/app/network/requests`,
    }),
  });
}

/**
 * Send email when connection request is accepted
 */
export async function sendConnectionAcceptedEmail({
  to,
  accepterName,
  accepterUsername,
}: {
  to: string;
  accepterName: string;
  accepterUsername: string;
}) {
  return sendEmail({
    to,
    subject: `${accepterName} accepted your connection request`,
    react: ConnectionAccepted({
      accepterName,
      cardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/${accepterUsername}`,
    }),
  });
}
