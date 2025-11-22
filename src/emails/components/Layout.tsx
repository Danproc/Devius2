import { appConfig } from "@/lib/config";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export const Layout = ({ children, previewText }: LayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText || ""}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: "#1cf491", // StackPass green
                background: "#04080f", // Dark navy
                foreground: "#dde3ed", // Light text
                border: "#121824", // Dark border
                muted: "#5b6a7f", // Muted text
                ["primary-foreground"]: "#000000", // Black text on green
              },
            },
          },
        }}
      >
        <Body className="bg-background my-auto mx-auto font-sans">
          <Container className="relative border border-solid border-border my-[40px] mx-auto p-[32px] max-w-[600px]" style={{ position: 'relative' }}>
            {/* Corner brackets for techy look */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '16px', height: '16px', borderTop: '2px solid #1cf491', borderLeft: '2px solid #1cf491' }}></div>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', borderTop: '2px solid #1cf491', borderRight: '2px solid #1cf491' }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '16px', height: '16px', borderBottom: '2px solid #1cf491', borderLeft: '2px solid #1cf491' }}></div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', borderBottom: '2px solid #1cf491', borderRight: '2px solid #1cf491' }}></div>

            <div className="text-center mb-4">
              <Text className="text-foreground text-2xl font-bold" style={{ margin: 0 }}>
                <span style={{ color: '#dde3ed' }}>Stack</span>
                <span style={{ color: '#1cf491' }}>Pass</span>
              </Text>
            </div>

            {children}

            <Hr className="border border-solid border-border my-[26px] mx-0 w-full" />

            <Text className="text-muted text-[11px] leading-[20px] text-center">
              This email was sent to you by StackPass.
              <br />
              <br />
              StackPass is a developer network that helps you connect with builders and ship in focused hackathons.
              <br />
              <br />
              Questions? Visit{" "}
              <Link
                style={{ color: '#1cf491' }}
                href={`${baseUrl}`}
              >
                {baseUrl?.replace('https://', '').replace('http://', '')}
              </Link>
              {" "}or reply to this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Layout;
