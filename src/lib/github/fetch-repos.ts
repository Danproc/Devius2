/**
 * GitHub Repository Fetching
 *
 * Functions to fetch and process user repositories from GitHub
 */

import { getGitHubClient, createGitHubClient } from './client';
import type { GitHubRepo, GitHubRepoSimplified, GitHubAPIError } from '@/types/github';

/**
 * Fetches all repositories for a user, sorted by stars
 *
 * @param userId - The user's ID (retrieves token from database)
 * @param options - Fetch options
 * @returns Array of repositories sorted by stars (descending)
 * @throws {GitHubAPIError} If fetch fails
 */
export async function fetchUserRepositories(
  userId: string,
  options: {
    maxRepos?: number;
    includeForked?: boolean;
    includePrivate?: boolean;
  } = {}
): Promise<GitHubRepo[]> {
  const {
    maxRepos = 100,
    includeForked = false,
    includePrivate = false,
  } = options;

  try {
    const octokit = await getGitHubClient(userId);

    // Fetch all repositories (paginated)
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (repos.length < maxRepos) {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
        type: includePrivate ? 'all' : 'public',
      });

      if (data.length === 0) break;

      // Filter repositories
      const filtered = data.filter((repo: any) => {
        // Skip forked repos if not included
        if (!includeForked && repo.fork) return false;
        return true;
      });

      repos.push(...(filtered as GitHubRepo[]));

      // Break if we've fetched all repos
      if (data.length < perPage) break;

      page++;
    }

    // Sort by stars descending
    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, maxRepos);
  } catch (error: any) {
    throw {
      message: error.message || 'Failed to fetch GitHub repositories',
      status: error.status || 500,
      documentation_url: error.response?.data?.documentation_url,
    } as GitHubAPIError;
  }
}

/**
 * Fetches repositories using an access token
 *
 * @param accessToken - GitHub OAuth access token
 * @param options - Fetch options
 * @returns Array of repositories sorted by stars
 * @throws {GitHubAPIError} If fetch fails
 */
export async function fetchUserRepositoriesByToken(
  accessToken: string,
  options: {
    maxRepos?: number;
    includeForked?: boolean;
    includePrivate?: boolean;
  } = {}
): Promise<GitHubRepo[]> {
  const {
    maxRepos = 100,
    includeForked = false,
    includePrivate = false,
  } = options;

  try {
    const octokit = createGitHubClient(accessToken);

    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (repos.length < maxRepos) {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
        type: includePrivate ? 'all' : 'public',
      });

      if (data.length === 0) break;

      const filtered = data.filter((repo: any) => {
        if (!includeForked && repo.fork) return false;
        return true;
      });

      repos.push(...(filtered as GitHubRepo[]));

      if (data.length < perPage) break;
      page++;
    }

    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, maxRepos);
  } catch (error: any) {
    throw {
      message: error.message || 'Failed to fetch GitHub repositories',
      status: error.status || 500,
      documentation_url: error.response?.data?.documentation_url,
    } as GitHubAPIError;
  }
}

/**
 * Fetches public repositories for a GitHub username (no auth required)
 *
 * @param username - GitHub username
 * @param maxRepos - Maximum number of repos to fetch
 * @returns Array of public repositories sorted by stars
 * @throws {GitHubAPIError} If fetch fails
 */
export async function fetchPublicRepositories(
  username: string,
  maxRepos: number = 100
): Promise<GitHubRepo[]> {
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({
      userAgent: 'StackPass DevCard Platform v1.0',
    });

    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (repos.length < maxRepos) {
      const { data } = await octokit.rest.repos.listForUser({
        username,
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      });

      if (data.length === 0) break;

      repos.push(...(data as GitHubRepo[]));

      if (data.length < perPage) break;
      page++;
    }

    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, maxRepos);
  } catch (error: any) {
    throw {
      message: error.message || `Failed to fetch repositories for ${username}`,
      status: error.status || 500,
      documentation_url: error.response?.data?.documentation_url,
    } as GitHubAPIError;
  }
}

/**
 * Simplifies repository data for DevCard display
 *
 * @param repos - Array of full repository data
 * @param topN - Number of top repositories to return
 * @returns Simplified repository data
 */
export function simplifyRepositories(
  repos: GitHubRepo[],
  topN: number = 10
): GitHubRepoSimplified[] {
  return repos.slice(0, topN).map((repo) => ({
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at,
    topics: repo.topics || [],
  }));
}

/**
 * Gets top repositories by language
 *
 * @param repos - Array of repositories
 * @param language - Programming language to filter by
 * @param topN - Number of repositories to return
 * @returns Top repositories for the specified language
 */
export function getTopRepositoriesByLanguage(
  repos: GitHubRepo[],
  language: string,
  topN: number = 5
): GitHubRepoSimplified[] {
  const filtered = repos.filter(
    (repo) => repo.language?.toLowerCase() === language.toLowerCase()
  );

  return simplifyRepositories(filtered, topN);
}

/**
 * Gets repository statistics
 *
 * @param repos - Array of repositories
 * @returns Repository statistics
 */
export function getRepositoryStats(repos: GitHubRepo[]) {
  const languages = new Map<string, number>();
  const topics = new Map<string, number>();

  repos.forEach((repo) => {
    // Count languages
    if (repo.language) {
      languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
    }

    // Count topics
    repo.topics?.forEach((topic) => {
      topics.set(topic, (topics.get(topic) || 0) + 1);
    });
  });

  return {
    total_repos: repos.length,
    languages: Array.from(languages.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    topics: Array.from(topics.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}
