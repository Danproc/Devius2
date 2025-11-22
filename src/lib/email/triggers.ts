/**
 * Email Trigger Functions
 * Send emails for key StackPass events
 */

import { sendEmail } from './client';
import Welcome from '@/emails/Welcome';
import ConnectionRequest from '@/emails/ConnectionRequest';
import ConnectionAccepted from '@/emails/ConnectionAccepted';

const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
      dashboardUrl: `${getBaseUrl()}/app/dashboard`,
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
      cardUrl: `${getBaseUrl()}/${requesterUsername}`,
      message,
      actionUrl: `${getBaseUrl()}/app/network/requests`,
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
      cardUrl: `${getBaseUrl()}/${accepterUsername}`,
    }),
  });
}
