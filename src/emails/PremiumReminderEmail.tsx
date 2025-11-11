/**
 * Premium Reminder Email Template
 * T122: Create src/emails/premium-reminder.tsx React Email template for renewal reminders (7 days before)
 */

import * as React from 'react';
import { Button } from '@react-email/button';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Hr } from '@react-email/hr';
import Layout from './components/Layout';
import { appConfig } from '@/lib/config';

interface PremiumReminderEmailProps {
  name: string;
  daysUntilExpiry: number;
  expiryDate: string;
  renewUrl: string;
}

export default function PremiumReminderEmail({
  name,
  daysUntilExpiry,
  expiryDate,
  renewUrl,
}: PremiumReminderEmailProps) {
  const getUrgencyText = () => {
    if (daysUntilExpiry === 1) {
      return 'Your Premium subscription expires tomorrow!';
    } else if (daysUntilExpiry <= 3) {
      return `Your Premium subscription expires in ${daysUntilExpiry} days`;
    }
    return `Your Premium subscription expires in ${daysUntilExpiry} days`;
  };

  const getEmoji = () => {
    if (daysUntilExpiry === 1) return '⚠️';
    if (daysUntilExpiry <= 3) return '⏰';
    return '👋';
  };

  return (
    <Html>
      <Layout previewText={`${getEmoji()} ${getUrgencyText()}`}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {getEmoji()} Hi {name}!
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          {getUrgencyText()} on <strong>{expiryDate}</strong>.
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          We wanted to remind you so you don't lose access to your premium features.
        </Text>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Container style={{ marginLeft: '16px', marginTop: '16px' }}>
          <Text style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            👑 Your Premium Features:
          </Text>
          <Text style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '14px' }}>
            ✓ Custom themes and branding
          </Text>
          <Text style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '14px' }}>
            ✓ Custom domain support
          </Text>
          <Text style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '14px' }}>
            ✓ Advanced analytics
          </Text>
          <Text style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '14px' }}>
            ✓ Priority support
          </Text>
          <Text style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '14px' }}>
            ✓ Organization profiles
          </Text>
        </Container>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Text style={{ fontSize: '16px', lineHeight: '24px', marginTop: '24px' }}>
          {daysUntilExpiry === 1
            ? "Don't let your premium access expire!"
            : 'Renew now to keep all your premium features active.'}
        </Text>

        <Button
          href={renewUrl}
          style={{
            backgroundColor: '#eab308',
            color: '#000000',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-block',
            marginTop: '16px',
          }}
        >
          Renew Premium Subscription
        </Button>

        <Text style={{ fontSize: '14px', lineHeight: '20px', marginTop: '24px', color: '#6b7280' }}>
          If you choose not to renew, you'll be automatically downgraded to the free plan after your
          subscription expires. You can resubscribe at any time to regain access to premium features.
        </Text>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Text style={{ fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
          Have questions? Reply to this email or visit our{' '}
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/help`} style={{ color: '#eab308' }}>
            Help Center
          </a>
          .
        </Text>

        <Text style={{ fontSize: '14px', lineHeight: '20px', marginTop: '16px', color: '#6b7280' }}>
          Thanks for being a premium member!
          <br />
          The {appConfig.projectName} Team
        </Text>
      </Layout>
    </Html>
  );
}
