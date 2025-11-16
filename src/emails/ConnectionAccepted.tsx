import * as React from 'react';
import { Button } from '@react-email/button';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import Layout from './components/Layout';

interface ConnectionAcceptedEmailProps {
  accepterName: string;
  cardUrl: string;
}

export default function ConnectionAcceptedEmail({
  accepterName,
  cardUrl,
}: ConnectionAcceptedEmailProps) {
  return (
    <Html>
      <Layout
        previewText={`${accepterName} accepted your connection request on StackPass`}
      >
        <Text style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          🎉 Connection Accepted!
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#374151', marginBottom: '16px' }}>
          Great news! <strong>{accepterName}</strong> has accepted your connection request on StackPass.
        </Text>

        <Container style={{
          backgroundColor: '#f0fdf4',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          marginBottom: '24px',
          borderLeft: '4px solid #1cf491'
        }}>
          <Text style={{ fontSize: '16px', color: '#166534', marginBottom: '0', fontWeight: '500' }}>
            ✓ You are now connected with {accepterName}
          </Text>
        </Container>

        <Text style={{ fontSize: '16px', marginBottom: '16px', color: '#374151' }}>
          You can now view their full StackPass and stay connected with their latest projects and updates.
        </Text>

        <Button
          href={cardUrl}
          style={{
            backgroundColor: '#1cf491',
            color: '#000000',
            borderRadius: '6px',
            padding: '12px 24px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            fontSize: '16px',
            marginTop: '8px',
            marginBottom: '16px'
          }}
        >
          View {accepterName}&apos;s StackPass →
        </Button>

        <Text style={{ marginTop: '24px', color: '#9ca3af', fontSize: '14px', lineHeight: '20px' }}>
          Keep building your network! Connect with more developers on StackPass to showcase your work and discover amazing projects.
        </Text>
      </Layout>
    </Html>
  );
}
