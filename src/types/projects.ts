import { z } from 'zod';

/**
 * Custom Project Type
 * Represents a user's custom project on their DevCard
 */
export interface CustomProject {
  id: string;
  title: string;
  description: string;
  projectUrl?: string;
  githubUrl?: string;
  techStack: string[]; // Mix of predefined and custom tags
  order: number;
  // Auto-populated from GitHub if githubUrl provided
  stars?: number;
  forks?: number;
  language?: string;
  lastFetched?: string; // ISO date string
}

/**
 * Zod validation schema for CustomProject
 */
export const customProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  projectUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid GitHub URL').regex(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/, 'Must be a valid GitHub repository URL').optional().or(z.literal('')),
  techStack: z.array(z.string().min(1).max(50)).min(1, 'At least one technology is required').max(20, 'Maximum 20 technologies allowed'),
  order: z.number().int().min(0).max(2),
  stars: z.number().int().min(0).optional(),
  forks: z.number().int().min(0).optional(),
  language: z.string().optional(),
  lastFetched: z.string().datetime().optional(),
});

/**
 * Schema for creating a new project (without id, order, and GitHub stats)
 */
export const createProjectSchema = customProjectSchema.omit({
  id: true,
  order: true,
  stars: true,
  forks: true,
  language: true,
  lastFetched: true,
});

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = customProjectSchema.partial().required({ id: true });

/**
 * Schema for reordering projects
 */
export const reorderProjectsSchema = z.object({
  projectId: z.string().uuid(),
  newOrder: z.number().int().min(0).max(2),
});

/**
 * Schema for array of custom projects (max 3)
 */
export const customProjectsArraySchema = z.array(customProjectSchema).max(3, 'Maximum 3 projects allowed');

/**
 * GitHub Repository Data fetched from API
 */
export interface GitHubRepoData {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string | null;
  topics?: string[];
}

/**
 * Response from GitHub fetch endpoint
 */
export interface FetchGitHubRepoResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
    githubUrl: string;
    stars: number;
    forks: number;
    language?: string;
    suggestedTechStack: string[];
  };
  error?: string;
}

/**
 * Type guards
 */
export const isCustomProject = (obj: unknown): obj is CustomProject => {
  return customProjectSchema.safeParse(obj).success;
};

export const isCustomProjectsArray = (obj: unknown): obj is CustomProject[] => {
  return customProjectsArraySchema.safeParse(obj).success;
};

/**
 * Helper to create a new empty project
 */
export const createEmptyProject = (order: number): Partial<CustomProject> => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  projectUrl: '',
  githubUrl: '',
  techStack: [],
  order,
});

/**
 * Helper to validate GitHub URL format
 */
export const isValidGitHubRepoUrl = (url: string): boolean => {
  const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return regex.test(url);
};

/**
 * Helper to extract owner and repo from GitHub URL
 */
export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  const match = url.match(/^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)\/?$/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
  };
};
