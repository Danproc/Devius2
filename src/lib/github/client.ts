/**
 * GitHub API Client
 *
 * Provides authenticated Octokit client instances for GitHub API interactions.
 * Retrieves access tokens from the database and handles token validation.
 */

import { Octokit } from '@octokit/rest';
import { db } from '@/db';
import { accounts } from '@/db/schema/user';
import { eq, and } from 'drizzle-orm';

/**
 * Error thrown when GitHub access token is not found or invalid
 */
export class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthError';
  }
}

/**
 * Retrieves the GitHub access token for a user from the database
 *
 * @param userId - The user's ID
 * @returns The GitHub access token
 * @throws {GitHubAuthError} If token is not found or expired
 */
export async function getGitHubAccessToken(userId: string): Promise<string> {
  // Query the accounts table for GitHub provider
  const [account] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.provider, 'github')
      )
    )
    .limit(1);

  if (!account) {
    throw new GitHubAuthError('GitHub account not connected for this user');
  }

  if (!account.access_token) {
    throw new GitHubAuthError('GitHub access token not found');
  }

  // Check if token is expired
  if (account.expires_at) {
    const expiresAt = account.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();

    if (now >= expiresAt) {
      throw new GitHubAuthError('GitHub access token has expired');
    }
  }

  return account.access_token;
}

/**
 * Creates an authenticated Octokit client for a user
 *
 * @param userId - The user's ID
 * @returns Authenticated Octokit instance
 * @throws {GitHubAuthError} If authentication fails
 */
export async function getGitHubClient(userId: string): Promise<Octokit> {
  const accessToken = await getGitHubAccessToken(userId);

  return new Octokit({
    auth: accessToken,
    userAgent: 'StackPass DevCard Platform v1.0',
    timeZone: 'UTC',
    baseUrl: 'https://api.github.com',
  });
}

/**
 * Creates an authenticated Octokit client using a provided access token
 * Useful for scenarios where you already have the token
 *
 * @param accessToken - GitHub OAuth access token
 * @returns Authenticated Octokit instance
 */
export function createGitHubClient(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    userAgent: 'StackPass DevCard Platform v1.0',
    timeZone: 'UTC',
    baseUrl: 'https://api.github.com',
  });
}

/**
 * Validates that a GitHub access token is still valid
 *
 * @param accessToken - GitHub OAuth access token
 * @returns True if token is valid, false otherwise
 */
export async function validateGitHubToken(accessToken: string): Promise<boolean> {
  try {
    const octokit = createGitHubClient(accessToken);
    await octokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the rate limit status for a GitHub client
 *
 * @param userId - The user's ID
 * @returns Rate limit information
 */
export async function getGitHubRateLimit(userId: string) {
  const octokit = await getGitHubClient(userId);
  const { data } = await octokit.rest.rateLimit.get();
  return data;
}
