import * as React from "react";
import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Container } from "@react-email/container";
import Layout from "./components/Layout";

interface RegistrationConfirmationEmailProps {
  userName: string;
  hackathonTitle: string;
  hackathonTheme: string | null;
  participationType: 'solo' | 'team';
  hackathonUrl: string;
  startDate: string;
  submissionDeadline: string;
}

export default function RegistrationConfirmation({
  userName,
  hackathonTitle,
  hackathonTheme,
  participationType,
  hackathonUrl,
  startDate,
  submissionDeadline,
}: RegistrationConfirmationEmailProps) {
  return (
    <Html>
      <Layout previewText={`You're registered for ${hackathonTitle}!`}>
        <Text className="text-foreground text-xl font-bold">
          Registration Confirmed! 🎉
        </Text>

        <Text className="text-foreground">
          Hey {userName}!
        </Text>

        <Text className="text-foreground">
          You're now registered for <strong>{hackathonTitle}</strong>
          {hackathonTheme && ` (${hackathonTheme})`} as a <strong>{participationType}</strong> participant.
        </Text>

        <Container className="bg-muted rounded-md p-4 my-4">
          <Text className="text-foreground font-semibold mb-2">Important Dates</Text>
          <Text className="text-foreground mb-1">📅 Starts: {startDate}</Text>
          <Text className="text-foreground">⏰ Deadline: {submissionDeadline}</Text>
        </Container>

        <Text className="text-foreground">
          {participationType === 'team'
            ? "You can now form your team and invite other registered participants!"
            : "Get ready to build something amazing!"}
        </Text>

        <Button
          href={hackathonUrl}
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
          View Hackathon
        </Button>

        <Text className="mt-4 text-muted text-sm">
          Good luck! We can't wait to see what you build.
        </Text>
      </Layout>
    </Html>
  );
}
