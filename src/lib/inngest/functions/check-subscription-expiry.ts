/**
 * Subscription Expiry Check Job
 * T121: Create src/lib/inngest/functions/check-subscription-expiry.ts with daily job to check expiring subscriptions
 */

import { inngest } from '../client';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { sql } from 'drizzle-orm';
import { render } from '@react-email/components';
import PremiumReminderEmail from '@/emails/PremiumReminderEmail';
import sendMail from '@/lib/email/sendMail';

export const checkSubscriptionExpiry = inngest.createFunction(
  {
    id: 'check-subscription-expiry',
    name: 'Check Subscription Expiry',
  },
  // Run daily at 9 AM UTC
  { cron: '0 9 * * *' },
  async ({ step }) => {
    await step.run('check-expiring-subscriptions', async () => {
      console.log('🔍 Checking for expiring premium subscriptions...');

      // Find users with premium expiring in 7 days or less
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const expiringUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          premium_expires_at: users.premium_expires_at,
        })
        .from(users)
        .where(
          sql`${users.is_premium} = true
              AND ${users.premium_expires_at} IS NOT NULL
              AND ${users.premium_expires_at} > NOW()
              AND ${users.premium_expires_at} <= ${sevenDaysFromNow.toISOString()}`
        );

      console.log(`📧 Found ${expiringUsers.length} users with expiring subscriptions`);

      // Send reminder emails
      let emailsSent = 0;
      for (const user of expiringUsers) {
        if (!user.premium_expires_at) continue;

        const daysUntilExpiry = Math.ceil(
          (user.premium_expires_at.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        try {
          // Only send reminders for 7 days, 3 days, and 1 day before expiry
          if ([7, 3, 1].includes(daysUntilExpiry)) {
            const emailHtml = await render(
              PremiumReminderEmail({
                name: user.name || user.email,
                daysUntilExpiry,
                expiryDate: user.premium_expires_at.toLocaleDateString(),
                renewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
              })
            );

            await sendMail(
              user.email,
              `Your Premium subscription expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`,
              emailHtml
            );

            emailsSent++;
            console.log(`✅ Sent reminder to ${user.email} (expires in ${daysUntilExpiry} days)`);
          }
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${user.email}:`, error);
        }
      }

      return {
        usersChecked: expiringUsers.length,
        emailsSent,
        timestamp: new Date().toISOString(),
      };
    });
  }
);
