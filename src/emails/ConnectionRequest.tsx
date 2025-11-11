import * as React from 'react';
import { Button } from '@react-email/button';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import Layout from './components/Layout';
import { appConfig } from '@/lib/config';

interface ConnectionRequestEmailProps {
  requesterName: string;
  cardUrl: string;
  message?: string;
  actionUrl: string;
}

export default function ConnectionRequestEmail({
  requesterName,
  cardUrl,
  message,
  actionUrl,
}: ConnectionRequestEmailProps) {
  return (
    <Html>
      <Layout
        previewText={`${requesterName} wants to connect with you on DevCard`}
      >
        <Text style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          🤝 New Connection Request
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#374151', marginBottom: '16px' }}>
          <strong>{requesterName}</strong> wants to connect with you on DevCard!
        </Text>

        {message && (
          <Container style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px',
            marginBottom: '16px',
            borderLeft: '4px solid #1cf491'
          }}>
            <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Message:
            </Text>
            <Text style={{ fontSize: '16px', color: '#111827', marginBottom: '0' }}>
              {message}
            </Text>
          </Container>
        )}

        <Container style={{ marginTop: '24px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
            View their DevCard to learn more about them:
          </Text>
          <Button
            href={cardUrl}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#111827',
              borderRadius: '6px',
              padding: '10px 16px',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '12px',
              fontWeight: '500'
            }}
          >
            View {requesterName}&apos;s DevCard →
          </Button>
        </Container>

        <Text style={{ fontSize: '16px', marginTop: '24px', marginBottom: '16px', color: '#374151' }}>
          Ready to respond to this connection request?
        </Text>

        <Button
          href={actionUrl}
          style={{
            backgroundColor: '#1cf491',
            color: '#000000',
            borderRadius: '6px',
            padding: '12px 24px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          View Connection Requests
        </Button>

        <Text style={{ marginTop: '24px', color: '#9ca3af', fontSize: '14px', lineHeight: '20px' }}>
          You&apos;re receiving this email because {requesterName} wants to
          connect with you on DevCard. If you don&apos;t want to connect, you
          can simply ignore this email or decline the request.
        </Text>
      </Layout>
    </Html>
  );
}
