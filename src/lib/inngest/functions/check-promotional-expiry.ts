/**
 * Promotional Grant Expiry Check Job
 * Checks for expiring promotional grants and sends reminder emails
 * Runs daily at 9 AM UTC (same as subscription expiry check)
 */

import { inngest } from '../client';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { promotional_grants } from '@/db/schema/promotional-grants';
import { expireGrants } from '@/lib/promotions/grant-service';
import { eq, and, gt, lte } from 'drizzle-orm';
import { render } from '@react-email/components';
import PremiumReminderEmail from '@/emails/PremiumReminderEmail';
import sendMail from '@/lib/email/sendMail';

export const checkPromotionalExpiry = inngest.createFunction(
  {
    id: 'check-promotional-expiry',
    name: 'Check Promotional Grant Expiry',
  },
  // Run daily at 9 AM UTC
  { cron: '0 9 * * *' },
  async ({ step }) => {
    await step.run('check-expiring-promotions', async () => {
      console.log('🔍 Checking for expiring promotional grants...');

      // Find promotional grants expiring within 7 days
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expiringGrants = await db
        .select({
          grant: promotional_grants,
          user: {
            id: users.id,
            email: users.email,
            name: users.name,
          },
        })
        .from(promotional_grants)
        .innerJoin(users, eq(promotional_grants.user_id, users.id))
        .where(
          and(
            eq(promotional_grants.status, 'active'),
            gt(promotional_grants.expires_at, now),
            lte(promotional_grants.expires_at, sevenDaysFromNow)
          )
        );

      console.log(`📧 Found ${expiringGrants.length} expiring promotional grants`);

      // Send reminder emails at 7, 3, and 1 day marks
      let emailsSent = 0;
      for (const { grant, user } of expiringGrants) {
        const daysUntilExpiry = Math.ceil(
          (grant.expires_at.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        try {
          // Only send reminders for 7 days, 3 days, and 1 day before expiry
          if ([7, 3, 1].includes(daysUntilExpiry)) {
            const emailHtml = await render(
              PremiumReminderEmail({
                name: user.name || user.email,
                daysUntilExpiry,
                expiryDate: grant.expires_at.toLocaleDateString(),
                renewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing`,
                promotionType: grant.promotion_type, // Pass promotion type for custom messaging
              })
            );

            // Customize subject line for founding members
            const subject =
              grant.promotion_type === 'founding_member_year'
                ? `👑 Your Founding Member free year expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`
                : `Your promotional premium expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`;

            await sendMail(user.email, subject, emailHtml);

            emailsSent++;
            console.log(
              `✅ Sent reminder to ${user.email} for ${grant.promotion_type} (expires in ${daysUntilExpiry} days)`
            );
          }
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${user.email}:`, error);
        }
      }

      // Auto-expire past-due grants
      console.log('🔄 Expiring past-due grants...');
      const expiredCount = await expireGrants();

      return {
        grantsChecked: expiringGrants.length,
        emailsSent,
        grantsExpired: expiredCount,
        timestamp: new Date().toISOString(),
      };
    });
  }
);
