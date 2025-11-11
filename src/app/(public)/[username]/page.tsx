import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getDevCardBySlug } from '@/lib/devcard';
import { getCachedGitHubUserData, fetchPublicRepositories } from '@/lib/github';
import { CardPreview } from '@/components/devcard/card-preview';
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

// Prefer static rendering with ISR
export const dynamic = 'force-static';
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
      if (!featuredRepoNames || featuredRepoNames.length === 0) {
        return [];
      }

      try {
        const allRepos = await fetchPublicRepositories(githubUsername, {
          maxRepos: 100,
        });

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

        // Sort by the order in featured_repos array
        repos.sort((a, b) => {
          const aIndex = featuredRepoNames.indexOf(a.full_name);
          const bIndex = featuredRepoNames.indexOf(b.full_name);
          return aIndex - bIndex;
        });

        return repos;
      } catch (error) {
        console.error('Failed to fetch featured repositories:', error);
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
  const devcard = await getCachedDevCard(username);

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

  // Fetch DevCard using cached function
  const devcard = await getCachedDevCard(username);

  // Return 404 if DevCard not found or not public
  if (!devcard) {
    notFound();
  }

  // Increment view count (async, non-blocking)
  // Note: This runs outside cache to ensure views are counted
  db.update(devcards)
    .set({
      view_count: devcard.view_count + 1,
    })
    .where(eq(devcards.id, devcard.id))
    .catch((error) => {
      console.error('Failed to increment view count:', error);
    });

  // Parallel data fetching for optimal performance
  const [cachedData, featuredRepos] = await Promise.all([
    getCachedGitHubData(devcard.user_id),
    getCachedFeaturedRepos(
      devcard.github_username,
      (devcard.featured_repos as string[]) || []
    ),
  ]);

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
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
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
    </main>
  );
}
