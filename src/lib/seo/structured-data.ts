/**
 * Schema.org structured data generators for SEO
 * Generates JSON-LD markup for different content types
 */

/**
 * Generate Organization schema for root site
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StackPass",
    url: baseUrl,
    logo: `${baseUrl}/assets/logo.png`,
    description: "GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.",
    sameAs: [
      "https://twitter.com/cjsingg",
      "https://github.com/stackpass"
    ]
  };
}

/**
 * Generate Event schema for hackathon pages
 */
export function generateEventSchema(hackathon: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: hackathon.title,
    description: hackathon.description,
    startDate: new Date(hackathon.start_at).toISOString(),
    endDate: new Date(hackathon.submission_deadline_at).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `${baseUrl}/hackathons/${hackathon.slug}`
    },
    organizer: {
      "@type": "Organization",
      name: "StackPass",
      url: baseUrl
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    }
  };
}

/**
 * Generate Person schema for profile pages
 */
export function generatePersonSchema(profile: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const displayName = profile.display_name || profile.github_username;

  const sameAs = [`https://github.com/${profile.github_username}`];
  if (profile.social_links?.twitter) sameAs.push(profile.social_links.twitter);
  if (profile.social_links?.linkedin) sameAs.push(profile.social_links.linkedin);
  if (profile.social_links?.website) sameAs.push(profile.social_links.website);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    image: profile.avatar_url,
    url: `${baseUrl}/${profile.url_slug}`,
    description: profile.custom_bio || undefined,
    sameAs
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: { label: string; href: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`
    }))
  };
}
