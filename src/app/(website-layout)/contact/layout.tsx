import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { appConfig } from '@/lib/config';

export const metadata: Metadata = generatePageMetadata({
  title: `Contact Us - ${appConfig.projectName}`,
  description: 'Get in touch with the StackPass team. We\'re here to help with questions about developer profiles, hackathons, and platform features.',
  path: '/contact',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
