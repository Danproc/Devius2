import * as React from "react";
import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Container } from "@react-email/container";
import Layout from "./components/Layout";
import { appConfig } from "@/lib/config";

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export default function Welcome({ userName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Layout
        previewText={`Welcome to ${appConfig.projectName}, ${userName}! 👋`}
      >
        <Text>
          Welcome to {appConfig.projectName}, {userName}! 👋
        </Text>

        <Text>We&apos;re excited to have you on board!</Text>

        <Container className="ml-4 mt-4">
          <Text className="mb-2">
            🚀 Here&apos;s what you can do with StackPass:
          </Text>
          <Text className="ml-4 mb-2">• Download your wallet pass and scan to connect at events</Text>
          <Text className="ml-4 mb-2">• Showcase your GitHub stats and featured projects</Text>
          <Text className="ml-4 mb-2">• Connect with other developers in your tech stack</Text>
          <Text className="ml-4 mb-2">• Join hackathons and compete for prizes (Pro members)</Text>
        </Container>

        <Text className="mt-4">Ready to customize your profile?</Text>

        <Button
          href={dashboardUrl}
          style={{
            backgroundColor: '#1cf491',
            color: '#000000',
            borderRadius: '6px',
            padding: '12px 24px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            marginTop: '16px'
          }}
        >
          Go to Dashboard
        </Button>

        <Text className="mt-4 text-muted">
          Questions? Reply to this email and we&apos;ll help you get set up!
        </Text>
      </Layout>
    </Html>
  );
}
