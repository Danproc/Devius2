/**
 * GitHub Profile Fetching
 *
 * Functions to fetch and process GitHub user profile data
 */

import { Octokit } from '@octokit/rest';
import { getGitHubClient, createGitHubClient } from './client';
import type { GitHubProfile, GitHubAPIError } from '@/types/github';

/**
 * Fetches GitHub user profile data for a given user
 *
 * @param userId - The user's ID (retrieves token from database)
 * @returns GitHub profile data
 * @throws {GitHubAPIError} If profile fetch fails
 */
export async function fetchGitHubProfile(userId: string): Promise<GitHubProfile> {
  try {
    const octokit = await getGitHubClient(userId);
    const { data } = await octokit.rest.users.getAuthenticated();

    return data as GitHubProfile;
  } catch (error: any) {
    throw {
      message: error.message || 'Failed to fetch GitHub profile',
      status: error.status || 500,
      documentation_url: error.response?.data?.documentation_url,
    } as GitHubAPIError;
  }
}

/**
 * Fetches GitHub user profile data using an access token
 *
 * @param accessToken - GitHub OAuth access token
 * @returns GitHub profile data
 * @throws {GitHubAPIError} If profile fetch fails
 */
export async function fetchGitHubProfileByToken(accessToken: string): Promise<GitHubProfile> {
  try {
    const octokit = createGitHubClient(accessToken);
    const { data } = await octokit.rest.users.getAuthenticated();

    return data as GitHubProfile;
  } catch (error: any) {
    throw {
      message: error.message || 'Failed to fetch GitHub profile',
      status: error.status || 500,
      documentation_url: error.response?.data?.documentation_url,
    } as GitHubAPIError;
  }
}

/**
 * Fetches public GitHub profile data by username (no auth required)
 *
 * @param username - GitHub username
 * @returns GitHub profile data
 * @throws {GitHubAPIError} If profile fetch fails
 */
export async function fetchPublicGitHubProfile(username: string): Promise<GitHubProfile> {
  try {
    const octokit = new Octokit({
      userAgent: 'Devius DevCard Platform v1.0',
    });

    const { data } = await octokit.rest.users.getByUsername({ username });

    return data as GitHubProfile;
  } catch (error: any) {
    throw {
      message: error.message || `Failed to fetch GitHub profile for ${username}`,
      status: error.status || 500,
      documentation_url: error.response?.data?.documentation_url,
    } as GitHubAPIError;
  }
}

/**
 * Checks if a GitHub user profile exists
 *
 * @param username - GitHub username
 * @returns True if profile exists, false otherwise
 */
export async function checkGitHubUserExists(username: string): Promise<boolean> {
  try {
    await fetchPublicGitHubProfile(username);
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Fetches user's organizations
 *
 * @param userId - The user's ID (retrieves token from database)
 * @returns Array of organization logins
 * @throws {GitHubAPIError} If fetch fails
 */
export async function fetchGitHubOrganizations(userId: string): Promise<string[]> {
  try {
    const octokit = await getGitHubClient(userId);
    const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser({
      per_page: 100, // Max allowed
    });

    return orgs.map(org => org.login);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    // Return empty array on error rather than failing
    return [];
  }
}

/**
 * Fetches user's organizations by access token
 *
 * @param accessToken - GitHub OAuth access token
 * @returns Array of organization logins
 */
export async function fetchGitHubOrganizationsByToken(accessToken: string): Promise<string[]> {
  try {
    const octokit = createGitHubClient(accessToken);
    const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser({
      per_page: 100,
    });

    return orgs.map(org => org.login);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

/**
 * Extracts essential profile fields for DevCard display
 *
 * @param profile - Full GitHub profile data
 * @returns Simplified profile data for DevCard
 */
export function extractProfileData(profile: GitHubProfile) {
  return {
    login: profile.login,
    name: profile.name || profile.login,
    bio: profile.bio,
    location: profile.location,
    email: profile.email,
    avatar_url: profile.avatar_url,
    html_url: profile.html_url,
    public_repos: profile.public_repos,
    public_gists: profile.public_gists,
    followers: profile.followers,
    following: profile.following,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}
