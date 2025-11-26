// @ts-nocheck
/**
 * Premium Reminder Email Template
 * T122: Create src/emails/premium-reminder.tsx React Email template for renewal reminders (7 days before)
 * Updated to support promotional grants messaging
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
  promotionType?: string; // NEW: Type of promotion (e.g., 'founding_member_year')
}

export default function PremiumReminderEmail({
  name,
  daysUntilExpiry,
  expiryDate,
  renewUrl,
  promotionType,
}: PremiumReminderEmailProps) {
  const isFoundingMember = promotionType === 'founding_member_year';

  const getUrgencyText = () => {
    if (isFoundingMember) {
      if (daysUntilExpiry === 1) {
        return 'Your Founding Member free year expires tomorrow!';
      } else if (daysUntilExpiry <= 3) {
        return `Your Founding Member free year expires in ${daysUntilExpiry} days`;
      }
      return `Your Founding Member free year expires in ${daysUntilExpiry} days`;
    }

    if (daysUntilExpiry === 1) {
      return 'Your Premium subscription expires tomorrow!';
    } else if (daysUntilExpiry <= 3) {
      return `Your Premium subscription expires in ${daysUntilExpiry} days`;
    }
    return `Your Premium subscription expires in ${daysUntilExpiry} days`;
  };

  const getEmoji = () => {
    if (isFoundingMember) return '👑';
    if (daysUntilExpiry === 1) return '⚠️';
    if (daysUntilExpiry <= 3) return '⏰';
    return '👋';
  };

  const getGreeting = () => {
    if (isFoundingMember) {
      return `${getEmoji()} Hi ${name}, Founding Member!`;
    }
    return `${getEmoji()} Hi ${name}!`;
  };

  return (
    <Html>
      <Layout previewText={`${getEmoji()} ${getUrgencyText()}`}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {getGreeting()}
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          {getUrgencyText()} on <strong>{expiryDate}</strong>.
        </Text>

        {isFoundingMember ? (
          <Container style={{
            background: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px',
            marginBottom: '16px'
          }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', marginTop: 0 }}>
              🎉 Thank you for being a Founding Member!
            </Text>
            <Text style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '8px', marginTop: 0 }}>
              You were among the first 100 members to join StackPass. As one of our founding members,
              you've had a full year of premium features on us!
            </Text>
            <Text style={{ fontSize: '14px', lineHeight: '20px', marginBottom: 0, marginTop: 0 }}>
              Your Pioneer badge is yours to keep forever. To continue enjoying premium features,
              subscribe now.
            </Text>
          </Container>
        ) : (
          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            We wanted to remind you so you don't lose access to your premium features.
          </Text>
        )}

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
            : isFoundingMember
            ? 'Subscribe now to keep all your premium features active.'
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
          {isFoundingMember ? 'Continue Premium Access' : 'Renew Premium Subscription'}
        </Button>

        <Text style={{ fontSize: '14px', lineHeight: '20px', marginTop: '24px', color: '#6b7280' }}>
          {isFoundingMember
            ? `If you choose not to subscribe, you'll be automatically downgraded to the free plan after your
              free year ends. Your Founding Member badge will remain on your profile forever. You can subscribe
              at any time to regain access to premium features.`
            : `If you choose not to renew, you'll be automatically downgraded to the free plan after your
              subscription expires. You can resubscribe at any time to regain access to premium features.`}
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
          Thanks for being a{isFoundingMember ? ' founding' : ' premium'} member!
          <br />
          The {appConfig.projectName} Team
        </Text>
      </Layout>
    </Html>
  );
}
