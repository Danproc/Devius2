/**
 * Resend Email Client
 * Configured email sending service for StackPass
 */

import { Resend } from 'resend';

// Initialize Resend client
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Check if Resend is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

/**
 * Get the configured FROM email address
 */
export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'noreply@stackpass.dev';
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) {
  if (!resend) {
    console.error('Resend is not configured. Email not sent.');
    return { error: 'Email service not configured' };
  }

  try {
    console.log('📧 Sending email:', {
      from: getFromEmail(),
      to,
      subject,
    });

    const result = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      react,
    });

    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}
