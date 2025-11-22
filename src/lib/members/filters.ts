import { DirectoryFilters } from './types';

/**
 * Build query parameters string from filter state
 */
export function buildQueryParams(filters: Partial<DirectoryFilters>, page: number, limit: number = 20): string {
  const params = new URLSearchParams();

  // Pagination
  params.set('page', page.toString());
  params.set('limit', limit.toString());

  // Search
  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  // Location
  if (filters.location) {
    params.set('location', filters.location);
  }

  // Tech stack (multiple values)
  if (filters.tech_stack && filters.tech_stack.length > 0) {
    filters.tech_stack.forEach(tech => {
      params.append('tech', tech);
    });
  }

  // Achievement types (multiple values)
  if (filters.achievement_types && filters.achievement_types.length > 0) {
    filters.achievement_types.forEach(achievement => {
      params.append('achievement', achievement);
    });
  }

  // Winners only
  if (filters.winners_only) {
    params.set('winners', 'true');
  }

  // Sort
  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  return params.toString();
}

/**
 * Parse query parameters from URL search params
 */
export function parseQueryParams(searchParams: URLSearchParams): Partial<DirectoryFilters> & { page: number; limit: number } {
  return {
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || null,
    tech_stack: searchParams.getAll('tech'),
    achievement_types: searchParams.getAll('achievement'),
    winners_only: searchParams.get('winners') === 'true',
    sort: (searchParams.get('sort') as 'newest' | 'oldest') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };
}

/**
 * Convert filter state to URL-friendly params object
 */
export function filterStateToParams(filters: Partial<DirectoryFilters>): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.tech_stack && filters.tech_stack.length > 0) params.tech = filters.tech_stack;
  if (filters.achievement_types && filters.achievement_types.length > 0) params.achievement = filters.achievement_types;
  if (filters.winners_only) params.winners = 'true';
  if (filters.sort) params.sort = filters.sort;

  return params;
}

/**
 * Convert URL params to filter state
 */
export function paramsToFilterState(params: URLSearchParams): Partial<DirectoryFilters> {
  return {
    search: params.get('search') || '',
    location: params.get('location') || null,
    tech_stack: params.getAll('tech'),
    achievement_types: params.getAll('achievement'),
    winners_only: params.get('winners') === 'true',
    sort: (params.get('sort') as 'newest' | 'oldest') || 'newest',
  };
}
