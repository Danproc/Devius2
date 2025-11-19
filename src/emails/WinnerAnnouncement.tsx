import * as React from "react";
import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Container } from "@react-email/container";
import Layout from "./components/Layout";

interface WinnerAnnouncementEmailProps {
  userName: string;
  hackathonTitle: string;
  hackathonTheme: string | null;
  placement: 'first' | 'second' | 'third';
  prizeAmount: number;
  projectTitle: string;
  profileUrl: string;
  galleryUrl: string;
}

export default function WinnerAnnouncement({
  userName,
  hackathonTitle,
  hackathonTheme,
  placement,
  prizeAmount,
  projectTitle,
  profileUrl,
  galleryUrl,
}: WinnerAnnouncementEmailProps) {
  const placementConfig = {
    first: { emoji: '🥇', text: '1st Place', color: '#FFD700' },
    second: { emoji: '🥈', text: '2nd Place', color: '#C0C0C0' },
    third: { emoji: '🥉', text: '3rd Place', color: '#CD7F32' },
  };

  const config = placementConfig[placement];

  return (
    <Html>
      <Layout previewText={`Congratulations! You won ${config.text} in ${hackathonTitle}!`}>
        <Text className="text-foreground text-xl font-bold">
          {config.emoji} Congratulations, {userName}!
        </Text>

        <Text className="text-foreground text-2xl font-bold" style={{ color: config.color }}>
          You Won {config.text}!
        </Text>

        <Text className="text-foreground">
          Your project <strong>{projectTitle}</strong> has won <strong>{config.text}</strong> in <strong>{hackathonTitle}</strong>
          {hackathonTheme && ` (${hackathonTheme})`}!
        </Text>

        <Container className="bg-muted rounded-md p-4 my-4">
          <Text className="text-foreground font-semibold mb-2">Prize</Text>
          <Text className="text-foreground text-xl font-bold" style={{ color: '#1cf491' }}>
            ${prizeAmount}
          </Text>
        </Container>

        <Text className="text-foreground">
          Your winning project is now featured in the StackPass Gallery, and a {config.text} badge has been added to your profile!
        </Text>

        <Container className="flex gap-3">
          <Button
            href={profileUrl}
            style={{
              backgroundColor: '#1cf491',
              color: '#000000',
              borderRadius: '6px',
              padding: '12px 24px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600',
              marginTop: '16px',
              marginRight: '8px'
            }}
          >
            View Your Badge
          </Button>

          <Button
            href={galleryUrl}
            style={{
              backgroundColor: 'transparent',
              color: '#1cf491',
              border: '1px solid #1cf491',
              borderRadius: '6px',
              padding: '12px 24px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600',
              marginTop: '16px'
            }}
          >
            View Gallery
          </Button>
        </Container>

        <Text className="mt-4 text-muted text-sm">
          Keep an eye out for prize distribution details coming soon!
        </Text>
      </Layout>
    </Html>
  );
}
