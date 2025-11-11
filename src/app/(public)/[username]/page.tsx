import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { headers } from 'next/headers';
import { getDevCardBySlug } from '@/lib/devcard';
import { getDevCardByCustomDomain } from '@/lib/devcard/domain-verification';
import { getCachedGitHubUserData, fetchPublicRepositories } from '@/lib/github';
import { CardPreview } from '@/components/devcard/card-preview';
import { ShareButtonWrapper } from '@/components/sharing/share-button-wrapper';
import { ConnectButton } from '@/components/devcard/connect-button';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';
import { trackCardView } from '@/lib/analytics/track';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// Note: Cannot use edge runtime because postgres-js driver requires Node.js 'net' module
// Using Node.js runtime with ISR for caching

// Incremental Static Regeneration (ISR) - revalidate every 3600 seconds (1 hour)
export const revalidate = 3600;

// Use dynamic rendering to support custom domains via headers
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

/**
 * Cached DevCard fetching with deduplication
 * Uses React cache() for request deduplication and Next.js unstable_cache for data caching
 */
const getCachedDevCard = cache(
  unstable_cache(
    async (username: string) => {
      const devcard = await getDevCardBySlug(username);
      if (!devcard || !devcard.is_public) {
        return null;
      }
      return devcard;
    },
    ['devcard-by-slug'],
    {
      revalidate: 3600, // 1 hour
      tags: ['devcards'],
    }
  )
);

/**
 * Cached GitHub data fetching
 * Optimized for edge runtime with request deduplication
 */
const getCachedGitHubData = cache(
  unstable_cache(
    async (userId: string) => {
      return await getCachedGitHubUserData(userId);
    },
    ['github-user-data'],
    {
      revalidate: 1800, // 30 minutes
      tags: ['github-stats'],
    }
  )
);

/**
 * Cached featured repositories fetching
 * Only fetches when needed and caches the result
 */
const getCachedFeaturedRepos = cache(
  unstable_cache(
    async (githubUsername: string, featuredRepoNames: string[]) => {
      console.log('🔍 getCachedFeaturedRepos called with:', { githubUsername, featuredRepoNames });

      if (!featuredRepoNames || featuredRepoNames.length === 0) {
        console.log('❌ No featured repo names provided');
        return [];
      }

      try {
        console.log('🔍 Fetching public repos for', githubUsername);
        const allRepos = await fetchPublicRepositories(githubUsername, 100); // Pass number, not object!
        console.log('📦 Fetched', allRepos.length, 'public repos');

        const repos = allRepos
          .filter((repo) => featuredRepoNames.includes(repo.full_name))
          .map((repo) => ({
            full_name: repo.full_name,
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            topics: repo.topics || [],
          }));

        console.log('✅ Filtered to', repos.length, 'featured repos');

        // Sort by the order in featured_repos array
        repos.sort((a, b) => {
          const aIndex = featuredRepoNames.indexOf(a.full_name);
          const bIndex = featuredRepoNames.indexOf(b.full_name);
          return aIndex - bIndex;
        });

        return repos;
      } catch (error) {
        console.error('❌ Failed to fetch featured repositories:', error);
        return [];
      }
    },
    ['featured-repos'],
    {
      revalidate: 1800, // 30 minutes
      tags: ['github-repos'],
    }
  )
);

// Generate metadata for SEO with caching
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || '';

  let devcard;

  // Check if this is a custom domain request
  const isCustomDomain = !host.includes('localhost') &&
                         !host.includes('vercel.app') &&
                         !host.includes('devius.com') &&
                         host.includes('.');

  if (isCustomDomain) {
    devcard = await getDevCardByCustomDomain(host);
  } else {
    devcard = await getCachedDevCard(username);
  }

  if (!devcard) {
    return {
      title: 'DevCard Not Found',
      description: 'The requested DevCard could not be found.',
    };
  }

  const title = `${devcard.display_name || devcard.github_username} - DevCard`;
  const description =
    devcard.custom_bio ||
    `Check out ${devcard.display_name || devcard.github_username}'s developer profile and featured projects.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [devcard.avatar_url],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [devcard.avatar_url],
    },
  };
}

export default async function PublicDevCardPage({ params }: PageProps) {
  const { username } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || '';

  let devcard;

  // Check if this is a custom domain request
  // Custom domains won't have common platform domains
  const isCustomDomain = !host.includes('localhost') &&
                         !host.includes('vercel.app') &&
                         !host.includes('devius.com') &&
                         host.includes('.');

  if (isCustomDomain) {
    console.log('🔍 Custom domain detected:', host);

    // Try to fetch DevCard by custom domain
    devcard = await getDevCardByCustomDomain(host);

    if (!devcard) {
      console.log('❌ No DevCard found for custom domain:', host);
      notFound();
    }

    // Verify the domain is verified
    if (!devcard.custom_domain_verified) {
      console.log('⚠️ Custom domain not verified:', host);
      notFound();
    }

    console.log('✅ DevCard found for custom domain:', devcard.url_slug);
  } else {
    // Standard username-based routing
    devcard = await getCachedDevCard(username);

    // Return 404 if DevCard not found or not public
    if (!devcard) {
      notFound();
    }
  }

  // Increment view count and track analytics (async, non-blocking)
  // Note: This runs outside cache to ensure views are counted
  Promise.all([
    db.update(devcards)
      .set({
        view_count: devcard.view_count + 1,
      })
      .where(eq(devcards.id, devcard.id))
      .catch((error) => {
        console.error('Failed to increment view count:', error);
      }),
    trackCardView(
      devcard.github_username,
      devcard.id,
      headersList
    ).catch((error) => {
      console.error('Failed to track card view:', error);
    })
  ]);

  // Parallel data fetching for optimal performance
  console.log('🔍 Fetching cached data for devcard.id:', devcard.id);
  const [cachedData, featuredRepos] = await Promise.all([
    getCachedGitHubData(devcard.id), // Use devcard.id, not user_id!
    getCachedFeaturedRepos(
      devcard.github_username,
      (devcard.featured_repos as string[]) || []
    ),
  ]);
  console.log('📊 Cached data result:', cachedData ? 'FOUND' : 'NULL');
  console.log('📦 Featured repos count:', featuredRepos?.length || 0);

  // Build GitHub stats object
  const githubStats = cachedData
    ? {
        public_repos: cachedData.stats.public_repos,
        followers: cachedData.stats.followers,
        following: cachedData.stats.following,
        total_stars: cachedData.stats.total_stars,
        contribution_streak: cachedData.stats.contribution_streak,
      }
    : null;

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#04080f] animate-fade-in">
      <div className="animate-slide-up">
        {/* Action Buttons - Positioned at top right */}
        <div className="w-full max-w-2xl mx-auto mb-4 flex justify-end gap-3">
          <ConnectButton
            targetUserId={devcard.user_id}
            targetUsername={devcard.display_name || devcard.github_username}
            className="bg-[#1cf491] hover:bg-[#1cf491]/90 text-black font-semibold"
          />
          <ShareButtonWrapper
            username={devcard.url_slug}
            displayName={devcard.display_name || devcard.github_username}
            customBio={devcard.custom_bio || undefined}
            avatarUrl={devcard.avatar_url}
            variant="outline"
            className="bg-[#121824] border-[#1e2838] hover:bg-[#1e2838] text-white"
          />
        </div>

        <CardPreview
          displayName={devcard.display_name}
          githubUsername={devcard.github_username}
          avatarUrl={devcard.avatar_url}
          customBio={devcard.custom_bio}
          location={devcard.location}
          availabilityStatus={devcard.availability_status}
          availabilityMessage={devcard.availability_message}
          socialLinks={devcard.social_links}
          githubStats={githubStats}
          techStack={devcard.tech_stack as string[] | null}
          featuredRepos={featuredRepos}
          viewCount={devcard.view_count + 1}
          theme={devcard.theme}
        />
      </div>
    </main>
  );
}
