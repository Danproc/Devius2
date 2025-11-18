import * as React from "react";
import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Container } from "@react-email/container";
import Layout from "./components/Layout";

interface VotingOpenEmailProps {
  userName: string;
  hackathonTitle: string;
  hackathonTheme: string | null;
  submissionCount: number;
  votingUrl: string;
  votingEndDate: string;
}

export default function VotingOpen({
  userName,
  hackathonTitle,
  hackathonTheme,
  submissionCount,
  votingUrl,
  votingEndDate,
}: VotingOpenEmailProps) {
  return (
    <Html>
      <Layout previewText={`Voting is now open for ${hackathonTitle}!`}>
        <Text className="text-foreground text-xl font-bold">
          Voting Is Now Open! 🗳️
        </Text>

        <Text className="text-foreground">
          Hey {userName}!
        </Text>

        <Text className="text-foreground">
          The community voting period has begun for <strong>{hackathonTitle}</strong>
          {hackathonTheme && ` (${hackathonTheme})`}!
        </Text>

        <Container className="bg-muted rounded-md p-4 my-4">
          <Text className="text-foreground font-semibold mb-2">Voting Details</Text>
          <Text className="text-foreground mb-1">📊 {submissionCount} projects submitted</Text>
          <Text className="text-foreground">⏰ Voting ends: {votingEndDate}</Text>
        </Container>

        <Text className="text-foreground">
          Check out the submissions and vote for your favorites! Remember:
        </Text>

        <Container className="ml-4">
          <Text className="text-foreground">• Vote for as many projects as you like</Text>
          <Text className="text-foreground">• You can change your votes anytime</Text>
          <Text className="text-foreground">• You cannot vote on your own submission</Text>
        </Container>

        <Button
          href={votingUrl}
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
          Vote Now
        </Button>

        <Text className="mt-4 text-muted text-sm">
          The projects with the most votes will be considered for prizes!
        </Text>
      </Layout>
    </Html>
  );
}
