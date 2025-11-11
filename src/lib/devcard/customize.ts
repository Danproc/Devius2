/**
 * DevCard Customization Validation
 *
 * Provides Zod schemas and validation functions for customizing DevCard profiles.
 * Enforces business rules for:
 * - Custom bio (500 char max)
 * - Featured repos (6 max)
 * - Tech stack (20 max)
 * - Social links (URL validation)
 * - Availability status
 */

import { z } from 'zod';

// Constants
export const MAX_BIO_LENGTH = 500;
export const MAX_FEATURED_REPOS = 6;
export const MAX_TECH_STACK = 20;
export const AVAILABILITY_STATUSES = ['open', 'available', 'not-available', 'custom'] as const;

/**
 * Custom Bio Validation Schema
 * - Must be a string
 * - Maximum 500 characters
 */
export const customBioSchema = z
  .string()
  .max(MAX_BIO_LENGTH, `Custom bio must be ${MAX_BIO_LENGTH} characters or less`)
  .optional();

/**
 * Featured Repositories Validation Schema
 * - Must be an array of strings
 * - Maximum 6 repositories
 * - Each repo name must be in format "owner/repo"
 */
export const featuredReposSchema = z
  .array(
    z.string().regex(
      /^[\w.-]+\/[\w.-]+$/,
      'Repository must be in format "owner/repo"'
    )
  )
  .max(MAX_FEATURED_REPOS, `You can feature a maximum of ${MAX_FEATURED_REPOS} repositories`)
  .optional();

/**
 * Tech Stack Validation Schema
 * - Must be an array of strings
 * - Maximum 20 items
 * - Each item must be non-empty and trimmed
 */
export const techStackSchema = z
  .array(
    z.string()
      .min(1, 'Tech stack item cannot be empty')
      .max(50, 'Tech stack item must be 50 characters or less')
      .trim()
  )
  .max(MAX_TECH_STACK, `Tech stack can contain a maximum of ${MAX_TECH_STACK} items`)
  .optional();

/**
 * Social Links Validation Schema
 * - All fields are optional
 * - Must be valid URLs when provided
 */
export const socialLinksSchema = z
  .object({
    twitter: z.string().url('Twitter must be a valid URL').optional(),
    linkedin: z.string().url('LinkedIn must be a valid URL').optional(),
    website: z.string().url('Website must be a valid URL').optional(),
    portfolio: z.string().url('Portfolio must be a valid URL').optional(),
  })
  .strict()
  .optional();

/**
 * Availability Status Validation Schema
 * - Must be one of: 'open', 'available', 'not-available', 'custom'
 */
export const availabilityStatusSchema = z
  .enum(AVAILABILITY_STATUSES, {
    errorMap: () => ({
      message: `Availability status must be one of: ${AVAILABILITY_STATUSES.join(', ')}`,
    }),
  })
  .optional();

/**
 * Availability Message Validation Schema
 * - Optional string
 * - Maximum 200 characters
 */
export const availabilityMessageSchema = z
  .string()
  .max(200, 'Availability message must be 200 characters or less')
  .optional();

/**
 * Display Name Validation Schema
 * - Optional string
 * - Maximum 100 characters
 */
export const displayNameSchema = z
  .string()
  .min(1, 'Display name cannot be empty')
  .max(100, 'Display name must be 100 characters or less')
  .optional();

/**
 * Location Validation Schema
 * - Optional string
 * - Maximum 100 characters
 */
export const locationSchema = z
  .string()
  .max(100, 'Location must be 100 characters or less')
  .optional();

/**
 * Theme Validation Schema
 * - Optional object with name and optional colors/font
 */
export const themeSchema = z
  .object({
    name: z.string(),
    colors: z
      .object({
        primary: z.string().optional(),
        background: z.string().optional(),
        text: z.string().optional(),
      })
      .optional(),
    font: z.string().optional(),
  })
  .optional();

/**
 * Complete DevCard Update Schema
 * Validates all fields that can be updated via PATCH /api/cards/me
 */
export const devCardUpdateSchema = z
  .object({
    display_name: displayNameSchema,
    custom_bio: customBioSchema,
    location: locationSchema,
    social_links: socialLinksSchema,
    featured_repos: featuredReposSchema,
    tech_stack: techStackSchema,
    availability_status: availabilityStatusSchema,
    availability_message: availabilityMessageSchema,
    theme: themeSchema,
  })
  .strict()
  .refine(
    (data) => {
      // If availability_status is 'custom', availability_message should be provided
      if (data.availability_status === 'custom' && !data.availability_message) {
        return false;
      }
      return true;
    },
    {
      message: 'Availability message is required when status is "custom"',
      path: ['availability_message'],
    }
  );

/**
 * Validation Functions
 */

/**
 * Validates custom bio
 * @param bio - The bio to validate
 * @returns Validation result
 */
export function validateCustomBio(bio: string | undefined) {
  return customBioSchema.safeParse(bio);
}

/**
 * Validates featured repositories
 * @param repos - Array of repository names
 * @returns Validation result
 */
export function validateFeaturedRepos(repos: string[] | undefined) {
  return featuredReposSchema.safeParse(repos);
}

/**
 * Validates tech stack
 * @param stack - Array of technology names
 * @returns Validation result
 */
export function validateTechStack(stack: string[] | undefined) {
  return techStackSchema.safeParse(stack);
}

/**
 * Validates social links
 * @param links - Social links object
 * @returns Validation result
 */
export function validateSocialLinks(
  links:
    | {
        twitter?: string;
        linkedin?: string;
        website?: string;
        portfolio?: string;
      }
    | undefined
) {
  return socialLinksSchema.safeParse(links);
}

/**
 * Validates availability status
 * @param status - Availability status
 * @returns Validation result
 */
export function validateAvailabilityStatus(status: string | undefined) {
  return availabilityStatusSchema.safeParse(status);
}

/**
 * Validates complete DevCard update data
 * @param data - Update data object
 * @returns Validation result with detailed errors
 */
export function validateDevCardUpdate(data: unknown) {
  return devCardUpdateSchema.safeParse(data);
}

/**
 * Type exports for TypeScript
 */
export type DevCardUpdateInput = z.infer<typeof devCardUpdateSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
