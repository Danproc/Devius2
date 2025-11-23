// @ts-nocheck
/**
 * Premium Welcome Email Template
 * T019: Welcome email sent when user first subscribes to premium
 */

import * as React from 'react';
import { Button } from '@react-email/button';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Hr } from '@react-email/hr';
import Layout from './components/Layout';
import { appConfig } from '@/lib/config';

interface PremiumWelcomeEmailProps {
  name: string;
  tierName: string;
  features: string[];
  billingAmount: number;
  billingFrequency: 'monthly' | 'annual';
  nextBillingDate: string;
  dashboardUrl: string;
}

export default function PremiumWelcomeEmail({
  name = 'Developer',
  tierName = 'Premium',
  features = ['Custom themes', 'Advanced analytics', 'Priority support'],
  billingAmount = 9.00,
  billingFrequency = 'monthly',
  nextBillingDate = 'December 23, 2025',
  dashboardUrl = 'https://stackpass.dev/app/billing',
}: PremiumWelcomeEmailProps) {
  return (
    <Html>
      <Layout previewText={`🎉 Welcome to ${tierName}! Your premium features are now active.`}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
          🎉 Welcome to {tierName}!
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          Hi {name},
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          Thank you for subscribing to <strong>{tierName}</strong>! Your premium features are now active
          and ready to use.
        </Text>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Container style={{ marginLeft: '16px', marginTop: '16px' }}>
          <Text style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
            👑 Your Premium Features:
          </Text>
          {features.map((feature, index) => (
            <Text key={index} style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '14px' }}>
              ✓ {feature}
            </Text>
          ))}
        </Container>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Container
          style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '24px',
            marginBottom: '24px',
          }}
        >
          <Text style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            📋 Subscription Details
          </Text>
          <Text style={{ fontSize: '14px', marginBottom: '4px' }}>
            <strong>Plan:</strong> {tierName}
          </Text>
          <Text style={{ fontSize: '14px', marginBottom: '4px' }}>
            <strong>Billing:</strong> ${billingAmount.toFixed(2)} {billingFrequency}
          </Text>
          <Text style={{ fontSize: '14px', marginBottom: '4px' }}>
            <strong>Next billing date:</strong> {nextBillingDate}
          </Text>
        </Container>

        <Text style={{ fontSize: '16px', lineHeight: '24px', marginTop: '24px' }}>
          Ready to explore your new premium features?
        </Text>

        <Button
          href={dashboardUrl}
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
          Go to Billing Dashboard
        </Button>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Text style={{ fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
          <strong>Need help getting started?</strong>
        </Text>
        <Text style={{ fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
          • Manage your subscription and payment methods in your{' '}
          <a href={dashboardUrl} style={{ color: '#eab308' }}>
            billing dashboard
          </a>
        </Text>
        <Text style={{ fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
          • Contact our support team for personalized assistance
        </Text>
        <Text style={{ fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
          • Check out our{' '}
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/docs`} style={{ color: '#eab308' }}>
            documentation
          </a>
          {' '}to learn about all premium features
        </Text>

        <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

        <Text style={{ fontSize: '14px', lineHeight: '20px', marginTop: '16px', color: '#6b7280' }}>
          We're excited to have you as a premium member!
          <br />
          <br />
          Best regards,
          <br />
          The {appConfig.projectName} Team
        </Text>

        <Text style={{ fontSize: '12px', lineHeight: '16px', marginTop: '24px', color: '#9ca3af' }}>
          You're receiving this email because you just subscribed to {tierName}. You can manage your
          subscription anytime from your billing dashboard.
        </Text>
      </Layout>
    </Html>
  );
}
