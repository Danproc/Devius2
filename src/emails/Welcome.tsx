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
        previewText={`Welcome to StackPass, ${userName}`}
      >
        <Text className="text-foreground text-xl font-bold">
          Welcome to StackPass, {userName}
        </Text>

        <Text className="text-foreground">We're excited to have you on board!</Text>

        <Container className="ml-4 mt-4">
          <Text className="mb-2 text-foreground">
            Here's what you can do with StackPass:
          </Text>
          <Text className="ml-4 mb-2 text-foreground">• Download your wallet pass and scan to connect at events</Text>
          <Text className="ml-4 mb-2 text-foreground">• Showcase your GitHub stats and featured projects</Text>
          <Text className="ml-4 mb-2 text-foreground">• Connect with other developers in your tech stack</Text>
          <Text className="ml-4 mb-2 text-foreground">• Join hackathons and compete for prizes (Pro members)</Text>
        </Container>

        <Text className="mt-4 text-foreground">Ready to customize your profile?</Text>

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
