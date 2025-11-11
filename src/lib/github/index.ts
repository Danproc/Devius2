/**
 * GitHub Integration Library
 *
 * Centralized exports for GitHub API integration functionality
 */

// Client
export {
  getGitHubAccessToken,
  getGitHubClient,
  createGitHubClient,
  validateGitHubToken,
  getGitHubRateLimit,
  GitHubAuthError,
} from './client';

// Profile Fetching
export {
  fetchGitHubProfile,
  fetchGitHubProfileByToken,
  fetchPublicGitHubProfile,
  checkGitHubUserExists,
  extractProfileData,
} from './fetch-profile';

// Repository Fetching
export {
  fetchUserRepositories,
  fetchUserRepositoriesByToken,
  fetchPublicRepositories,
  simplifyRepositories,
  getTopRepositoriesByLanguage,
  getRepositoryStats,
} from './fetch-repos';

// Stats Calculation
export {
  calculateTotalStars,
  calculateBasicStats,
  fetchContributionStats,
  fetchContributionStatsByToken,
  calculateCompleteStats,
  calculateCompleteStatsByToken,
  calculateLanguageStats,
} from './calculate-stats';

// Caching
export {
  cacheGitHubProfile,
  getCachedGitHubProfile,
  cacheGitHubRepos,
  getCachedGitHubRepos,
  cacheGitHubStats,
  getCachedGitHubStats,
  cacheGitHubUserData,
  getCachedGitHubUserData,
  invalidateGitHubCache,
  invalidateCacheByType,
  getCacheStatus,
  warmUpCache,
} from './cache';
