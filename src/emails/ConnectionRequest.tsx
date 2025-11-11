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
        previewText={`${requesterName} wants to connect with you on ${appConfig.projectName}`}
      >
        <Text className="text-xl font-semibold mb-4">
          New Connection Request
        </Text>

        <Text>
          <strong>{requesterName}</strong> wants to connect with you on{' '}
          {appConfig.projectName}!
        </Text>

        {message && (
          <Container className="bg-gray-50 p-4 rounded-lg my-4 border-l-4 border-primary">
            <Text className="text-sm text-gray-600 mb-1">Message:</Text>
            <Text className="text-base">{message}</Text>
          </Container>
        )}

        <Container className="my-6">
          <Text className="mb-2">View their DevCard to learn more:</Text>
          <Button
            href={cardUrl}
            className="bg-gray-100 text-gray-800 rounded-md py-2 px-4 mb-3 inline-block"
          >
            View {requesterName}&apos;s DevCard
          </Button>
        </Container>

        <Text className="mt-6 mb-4">
          Ready to respond to this connection request?
        </Text>

        <Button
          href={actionUrl}
          className="bg-primary text-primary-foreground rounded-md py-3 px-6 font-semibold"
        >
          View Connection Requests
        </Button>

        <Text className="mt-6 text-muted text-sm">
          You&apos;re receiving this email because {requesterName} wants to
          connect with you on {appConfig.projectName}. If you don&apos;t want
          to connect, you can simply ignore this email.
        </Text>
      </Layout>
    </Html>
  );
}
