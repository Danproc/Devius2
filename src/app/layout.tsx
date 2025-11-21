import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { appConfig } from "@/lib/config";
import Providers from "./Providers";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateOrganizationSchema } from "@/lib/seo/structured-data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${appConfig.projectName}`,
    default: `${appConfig.projectName} - GitHub-Powered Developer Profiles`,
  },
  description: appConfig.description,
  keywords: appConfig.keywords,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
  openGraph: {
    title: `${appConfig.projectName} - GitHub-Powered Developer Profiles`,
    description: appConfig.description,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: appConfig.projectName,
    locale: "en_US",
    type: "website",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appConfig.projectName} - GitHub-Powered Developer Profiles`,
    description: appConfig.description,
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <StructuredData schema={generateOrganizationSchema()} />
      </head>
      <body className={`${inter.variable} antialiased bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
