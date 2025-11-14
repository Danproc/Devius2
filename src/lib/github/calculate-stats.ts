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
 * Calculates streaks from daily contribution data (used by GraphQL)
 * More accurate than event-based calculation
 */
function calculateStreaksFromDailyData(days: Array<{ date: string; contributionCount: number }>): {
  currentStreak: number;
  longestStreak: number;
} {
  if (days.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkingCurrent = true;

  // Days are sorted newest first
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const date = new Date(day.date);
    date.setHours(0, 0, 0, 0);

    // Check if this is still part of current streak
    if (checkingCurrent) {
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > tempStreak + 1) {
        // Gap found - current streak is over
        checkingCurrent = false;
        currentStreak = tempStreak;
      }
    }

    if (day.contributionCount > 0) {
      tempStreak++;
      if (checkingCurrent) {
        currentStreak = tempStreak;
      }
    } else {
      // Day with no contributions breaks streak
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      if (checkingCurrent && i > 0) {
        checkingCurrent = false;
        currentStreak = 0;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * Fetches contribution stats using GitHub GraphQL API
 * More accurate than REST API Events endpoint
 */
export async function fetchContributionStatsGraphQL(
  userId: string
): Promise<GitHubContributions> {
  try {
    const octokit = await getGitHubClient(userId);
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    // Get current year contributions (Jan 1 to now)
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response: any = await octokit.graphql(query, {
      username,
      from: yearStart.toISOString(),
      to: now.toISOString(),
    });

    // Calculate streak from daily data
    const days = response.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const { currentStreak, longestStreak } = calculateStreaksFromDailyData(days);

    return {
      last_year_total: response.user.contributionsCollection.contributionCalendar.totalContributions,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    };
  } catch (error: any) {
    console.error('Failed to fetch contribution stats via GraphQL:', error);
    console.log('Falling back to REST API events...');
    // Fallback to REST API
    return fetchContributionStats(userId);
  }
}

/**
 * Fetches contribution stats using an access token via GraphQL
 */
export async function fetchContributionStatsByTokenGraphQL(
  accessToken: string
): Promise<GitHubContributions> {
  try {
    const octokit = createGitHubClient(accessToken);
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response: any = await octokit.graphql(query, {
      username,
      from: yearStart.toISOString(),
      to: now.toISOString(),
    });

    const days = response.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const { currentStreak, longestStreak } = calculateStreaksFromDailyData(days);

    return {
      last_year_total: response.user.contributionsCollection.contributionCalendar.totalContributions,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    };
  } catch (error: any) {
    console.error('Failed to fetch contribution stats via GraphQL:', error);
    console.log('Falling back to REST API events...');
    return fetchContributionStatsByToken(accessToken);
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
  // Use GraphQL for accurate contribution stats
  const contributions = await fetchContributionStatsGraphQL(userId);

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
  // Use GraphQL for accurate contribution stats
  const contributions = await fetchContributionStatsByTokenGraphQL(accessToken);

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

/**
 * Get the most starred repository
 *
 * @param repos - Array of user repositories
 * @returns Most starred repository or null
 */
export function getMostStarredRepo(repos: GitHubRepo[]): {
  name: string;
  full_name: string;
  stars: number;
  url: string;
  description: string | null;
  language: string | null;
} | null {
  if (!repos || repos.length === 0) return null;

  const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const mostStarred = sorted[0];

  return {
    name: mostStarred.name,
    full_name: mostStarred.full_name,
    stars: mostStarred.stargazers_count,
    url: mostStarred.html_url,
    description: mostStarred.description,
    language: mostStarred.language,
  };
}

/**
 * Get top N languages with percentages
 *
 * @param repos - Array of user repositories
 * @param limit - Number of top languages to return (default: 3)
 * @returns Array of top languages with stats
 */
export function getTopLanguages(repos: GitHubRepo[], limit: number = 3): Array<{
  name: string;
  count: number;
  stars: number;
  percentage: number;
  color?: string;
}> {
  const allLanguages = calculateLanguageStats(repos);
  return allLanguages.slice(0, limit).map(lang => ({
    name: lang.language, // Map 'language' field to 'name'
    count: lang.repos,
    stars: lang.stars,
    percentage: lang.percentage,
    color: LANGUAGE_COLORS[lang.language] || '#808080',
  }));
}

/**
 * Language color mapping (matching GitHub's official colors)
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#777bb4',
  'C++': '#00599c',
  C: '#555555',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};
