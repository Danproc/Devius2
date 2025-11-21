import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 * Controls search engine crawler access and references sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/app/',          // Private authenticated routes
        '/api/',          // API endpoints
        '/admin/',        // Admin dashboard
        '/super-admin/',  // Super admin routes
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
