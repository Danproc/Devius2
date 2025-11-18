import * as React from "react";
import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Container } from "@react-email/container";
import Layout from "./components/Layout";

interface TeamInviteEmailProps {
  inviteeName: string;
  inviterName: string;
  teamName: string | null;
  hackathonTitle: string;
  hackathonTheme: string | null;
  acceptUrl: string;
}

export default function TeamInvite({
  inviteeName,
  inviterName,
  teamName,
  hackathonTitle,
  hackathonTheme,
  acceptUrl,
}: TeamInviteEmailProps) {
  return (
    <Html>
      <Layout previewText={`${inviterName} invited you to join their hackathon team`}>
        <Text className="text-foreground text-xl font-bold">
          Team Invitation
        </Text>

        <Text className="text-foreground">
          Hey {inviteeName}! 👋
        </Text>

        <Text className="text-foreground">
          <strong>{inviterName}</strong> has invited you to join their team for <strong>{hackathonTitle}</strong>
          {hackathonTheme && ` (${hackathonTheme})`}.
        </Text>

        {teamName && (
          <Container className="bg-muted rounded-md p-4 my-4">
            <Text className="text-foreground font-semibold mb-1">Team Name</Text>
            <Text className="text-foreground">{teamName}</Text>
          </Container>
        )}

        <Text className="text-foreground">
          Ready to compete together? Join the team and start building!
        </Text>

        <Button
          href={acceptUrl}
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
          Accept Invitation
        </Button>

        <Text className="mt-4 text-muted text-sm">
          This invitation will remain open until the hackathon starts. You can accept or decline from your hackathon dashboard.
        </Text>
      </Layout>
    </Html>
  );
}
