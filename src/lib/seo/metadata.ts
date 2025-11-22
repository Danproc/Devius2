import { Metadata } from 'next';

/**
 * Generate standardized page metadata with OpenGraph and Twitter cards
 *
 * @param config - Metadata configuration
 * @returns Next.js Metadata object
 */
export function generatePageMetadata({
  title,
  description,
  path,
  ogImage,
  type = 'website'
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'profile';
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}${path}`;
  const defaultOgImage = `${baseUrl}/images/og.png`;

  // Enforce character limits for SEO best practices
  const truncatedDescription = description.slice(0, 160);
  const truncatedTitle = title.slice(0, 60);

  return {
    title: truncatedTitle,
    description: truncatedDescription,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: truncatedTitle,
      description: truncatedDescription,
      url,
      type,
      images: [ogImage || defaultOgImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: truncatedTitle,
      description: truncatedDescription,
      images: [ogImage || defaultOgImage]
    }
  };
}
