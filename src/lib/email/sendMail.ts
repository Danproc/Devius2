import { resend, getFromEmail, isEmailConfigured } from './client';

/**
 * Send an email using Resend
 * This function accepts raw HTML content (for legacy compatibility)
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @returns Promise with Resend API response
 */
const sendMail = async (to: string, subject: string, html: string) => {
  // Check if email is configured
  if (!isEmailConfigured() || !resend) {
    console.error('❌ Email service not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local');
    console.log('📧 [DEV MODE] Would have sent email to:', to, 'with subject:', subject);
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
      html,
    });

    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

export default sendMail;
