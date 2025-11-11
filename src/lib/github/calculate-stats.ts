/**
 * GitHub Stats Calculation
 *
 * Functions to calculate GitHub statistics including stars, contributions, and streaks
 */

import { getGitHubClient, createGitHubClient } from './client';
import type {
  GitHubProfile,
  GitHubRepo,
  GitHubStats,
  GitHubContributions,
  GitHubAPIError,
} from '@/types/github';

/**
 * Calculates total stars across all user repositories
 *
 * @param repos - Array of user repositories
 * @returns Total star count
 */
export function calculateTotalStars(repos: GitHubRepo[]): number {
  return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

/**
 * Calculates basic GitHub stats from profile and repositories
 *
 * @param profile - GitHub profile data
 * @param repos - Array of repositories
 * @returns GitHub statistics
 */
export function calculateBasicStats(
  profile: GitHubProfile,
  repos: GitHubRepo[]
): Omit<GitHubStats, 'contribution_streak' | 'contributions'> {
  return {
    total_stars: calculateTotalStars(repos),
    public_repos: profile.public_repos,
    public_gists: profile.public_gists,
    followers: profile.followers,
    following: profile.following,
  };
}

/**
 * Fetches contribution activity using GitHub GraphQL API
 * Note: This requires GraphQL API access and is more complex
 * For MVP, we'll use a simplified approach with REST API
 *
 * @param userId - User ID
 * @returns Contribution statistics
 */
export async function fetchContributionStats(userId: string): Promise<GitHubContributions> {
  try {
    const octokit = await getGitHubClient(userId);

    // Get the authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    // Fetch events (public activity)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let page = 1;
    const perPage = 100;
    let allEvents: any[] = [];
    let hasMorePages = true;

    // Fetch up to 3 pages of events (300 events)
    while (hasMorePages && page <= 3) {
      const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
        username,
        per_page: perPage,
        page,
      });

      if (events.length === 0) {
        hasMorePages = false;
        break;
      }

      allEvents = [...allEvents, ...events];
      page++;
    }

    // Calculate contribution stats from events
    const contributions = calculateContributionsFromEvents(allEvents);

    return contributions;
  } catch (error: any) {
    // Return default values if fetch fails
    console.error('Failed to fetch contribution stats:', error);
    return {
      last_year_total: 0,
      current_streak: 0,
      longest_streak: 0,
    };
  }
}

/**
 * Fetches contribution stats using an access token
 *
 * @param accessToken - GitHub OAuth access token
 * @returns Contribution statistics
 */
export async function fetchContributionStatsByToken(
  accessToken: string
): Promise<GitHubContributions> {
  try {
    const octokit = createGitHubClient(accessToken);

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    let page = 1;
    const perPage = 100;
    let allEvents: any[] = [];
    let hasMorePages = true;

    while (hasMorePages && page <= 3) {
      const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
        username,
        per_page: perPage,
        page,
      });

      if (events.length === 0) {
        hasMorePages = false;
        break;
      }

      allEvents = [...allEvents, ...events];
      page++;
    }

    return calculateContributionsFromEvents(allEvents);
  } catch (error: any) {
    console.error('Failed to fetch contribution stats:', error);
    return {
      last_year_total: 0,
      current_streak: 0,
      longest_streak: 0,
    };
  }
}

/**
 * Calculates contribution statistics from GitHub events
 *
 * @param events - Array of GitHub events
 * @returns Contribution statistics
 */
function calculateContributionsFromEvents(events: any[]): GitHubContributions {
  // Filter relevant contribution events
  const contributionEventTypes = [
    'PushEvent',
    'PullRequestEvent',
    'IssuesEvent',
    'IssueCommentEvent',
    'CreateEvent',
    'DeleteEvent',
  ];

  const contributionEvents = events.filter((event) =>
    contributionEventTypes.includes(event.type)
  );

  // Group events by date
  const eventsByDate = new Map<string, number>();

  contributionEvents.forEach((event) => {
    const date = new Date(event.created_at).toISOString().split('T')[0];
    eventsByDate.set(date, (eventsByDate.get(date) || 0) + 1);
  });

  // Calculate total contributions in last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let lastYearTotal = 0;
  eventsByDate.forEach((count, dateStr) => {
    const date = new Date(dateStr);
    if (date >= oneYearAgo) {
      lastYearTotal += count;
    }
  });

  // Calculate streaks
  const dates = Array.from(eventsByDate.keys()).sort().reverse();
  const { currentStreak, longestStreak } = calculateStreaks(dates);

  return {
    last_year_total: lastYearTotal,
    current_streak: currentStreak,
    longest_streak: longestStreak,
  };
}

/**
 * Calculates current and longest contribution streaks
 *
 * @param sortedDates - Array of dates with contributions (sorted descending)
 * @returns Current and longest streak in days
 */
function calculateStreaks(sortedDates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  // Check if there's activity today or yesterday
  const mostRecentDate = new Date(sortedDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only count current streak if last activity was today or yesterday
  const countingCurrentStreak = daysDifference <= 1;

  sortedDates.forEach((dateStr) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    if (lastDate === null) {
      tempStreak = 1;
      if (countingCurrentStreak) currentStreak = 1;
    } else {
      const diffDays = Math.floor(
        (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day
        tempStreak++;
        if (countingCurrentStreak && currentStreak > 0) {
          currentStreak++;
        }
      } else {
        // Streak broken
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        if (countingCurrentStreak && currentStreak > 0) {
          currentStreak = 0; // Stop counting current streak
        }
      }
    }

    lastDate = date;
  });

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Calculates complete GitHub stats including contributions
 *
 * @param userId - User ID
 * @param profile - GitHub profile data
 * @param repos - Array of repositories
 * @returns Complete GitHub statistics
 */
export async function calculateCompleteStats(
  userId: string,
  profile: GitHubProfile,
  repos: GitHubRepo[]
): Promise<GitHubStats> {
  const basicStats = calculateBasicStats(profile, repos);
  const contributions = await fetchContributionStats(userId);

  return {
    ...basicStats,
    contribution_streak: contributions.current_streak,
    contributions,
  };
}

/**
 * Calculates complete stats using an access token
 *
 * @param accessToken - GitHub OAuth access token
 * @param profile - GitHub profile data
 * @param repos - Array of repositories
 * @returns Complete GitHub statistics
 */
export async function calculateCompleteStatsByToken(
  accessToken: string,
  profile: GitHubProfile,
  repos: GitHubRepo[]
): Promise<GitHubStats> {
  const basicStats = calculateBasicStats(profile, repos);
  const contributions = await fetchContributionStatsByToken(accessToken);

  return {
    ...basicStats,
    contribution_streak: contributions.current_streak,
    contributions,
  };
}

/**
 * Gets language statistics from repositories
 *
 * @param repos - Array of repositories
 * @returns Language usage statistics
 */
export function calculateLanguageStats(repos: GitHubRepo[]) {
  const languageCount = new Map<string, { count: number; stars: number }>();

  repos.forEach((repo) => {
    if (repo.language) {
      const current = languageCount.get(repo.language) || { count: 0, stars: 0 };
      languageCount.set(repo.language, {
        count: current.count + 1,
        stars: current.stars + repo.stargazers_count,
      });
    }
  });

  return Array.from(languageCount.entries())
    .map(([language, data]) => ({
      language,
      repos: data.count,
      stars: data.stars,
      percentage: (data.count / repos.length) * 100,
    }))
    .sort((a, b) => b.stars - a.stars);
}
