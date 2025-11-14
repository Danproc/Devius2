import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { headers } from 'next/headers';
import { getDevCardBySlug } from '@/lib/devcard';
import { getCachedGitHubUserData, fetchPublicRepositories } from '@/lib/github';
import { CardPreview } from '@/components/devcard/card-preview';
import { ShareButtonWrapper } from '@/components/sharing/share-button-wrapper';
import { ConnectButton } from '@/components/devcard/connect-button';
import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';

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
  // Always use username lookup (custom domains removed)
  devcard = await getCachedDevCard(username);

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

  // Standard username-based routing (custom domains removed)
  devcard = await getCachedDevCard(username);

  // Return 404 if DevCard not found or not public
  if (!devcard) {
    notFound();
  }

  // Increment view count and track analytics (async, non-blocking)
  // Note: This runs outside cache to ensure views are counted
  // Increment view count (async, non-blocking)
  db.update(devcards)
    .set({
      view_count: devcard.view_count + 1,
    })
    .where(eq(devcards.id, devcard.id))
    .catch((error) => {
      console.error('Failed to increment view count:', error);
    });

  // Parallel data fetching for optimal performance
  console.log('🔍 Fetching cached data for devcard.id:', devcard.id);
  const [cachedData, featuredRepos, connectionsData] = await Promise.all([
    getCachedGitHubData(devcard.id), // Use devcard.id, not user_id!
    getCachedFeaturedRepos(
      devcard.github_username,
      (devcard.featured_repos as string[]) || []
    ),
    // Use relative URL to work in all environments
    fetch(`/api/cards/${devcard.url_slug}/connections`)
      .then(res => res.ok ? res.json() : null)
      .catch(() => null),
  ]);
  console.log('📊 Cached data result:', cachedData ? 'FOUND' : 'NULL');
  console.log('📦 Featured repos count:', featuredRepos?.length || 0);
  console.log('🔗 Connections count:', connectionsData?.count || 0);

  // Build comprehensive GitHub stats object
  const githubStats = cachedData
    ? {
        public_repos: cachedData.stats?.public_repos || cachedData.profile?.public_repos || 0,
        followers: cachedData.stats?.followers || cachedData.profile?.followers || 0,
        following: cachedData.stats?.following || cachedData.profile?.following || 0,
        total_stars: cachedData.stats?.total_stars || 0,
        contribution_streak: cachedData.contributions?.current_streak || cachedData.stats?.contribution_streak || 0,
        public_gists: cachedData.profile?.public_gists || cachedData.stats?.public_gists || 0,
        contributions: cachedData.contributions,
        organizations: cachedData.organizations,
        most_starred_repo: cachedData.most_starred_repo,
        top_languages: cachedData.top_languages,
      }
    : null;

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-devcard-base animate-fade-in relative">
      {/* Share Button - Top right corner, green and smaller */}
      <div className="fixed top-4 right-4 z-50">
        <ShareButtonWrapper
          username={devcard.url_slug}
          displayName={devcard.display_name || devcard.github_username}
          customBio={devcard.custom_bio || undefined}
          avatarUrl={devcard.avatar_url}
          variant="default"
          size="sm"
          className="bg-devcard-green hover:bg-devcard-green/90 text-black font-medium px-4 py-2 text-sm"
          showWalletOptions={false}
        />
      </div>

      <div className="animate-slide-up">
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
          customProjects={devcard.custom_projects as any}
          viewCount={devcard.view_count + 1}
          ranking={devcard.member_number}
          theme={devcard.theme}
          connections={connectionsData || undefined}
          targetUserId={devcard.user_id}
          targetUsername={devcard.display_name || devcard.github_username}
        />
      </div>
    </main>
  );
}
