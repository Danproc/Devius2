export type AvailabilityStatus = 'open' | 'available' | 'not-available' | 'custom';

export interface MemberSummary {
  // Identity
  id: string;
  user_id: string;
  url_slug: string;

  // Profile Information
  display_name: string | null;
  github_username: string;
  avatar_url: string;
  location: string | null;
  custom_bio: string | null;

  // Technology & Skills
  tech_stack: string[] | null;

  // Community Status
  member_number: number;
  achievement_count: number;
  hackathon_badges: HackathonBadgeSummary[];
  availability_status: AvailabilityStatus | null;

  // Metadata
  is_public: boolean;
  created_at: Date | string;
}

export interface HackathonBadgeSummary {
  badge_type: 'gold' | 'silver' | 'bronze';
  hackathon_name: string;
  earned_at: Date | string;
}

export interface DirectoryFilters {
  search: string;
  location: string | null;
  tech_stack: string[];
  achievement_types: string[];
  winners_only: boolean;
  sort: 'newest' | 'oldest';
}

export interface MembersSearchResponse {
  members: MemberSummary[];
  pagination: {
    total: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
  filters: {
    locations: string[];
    technologies: string[];
    achievement_types: string[];
  };
}

export interface SearchMembersParams {
  search?: string;
  location?: string;
  tech_stack?: string[];
  achievement_types?: string[];
  winners_only?: boolean;
  page: number;
  limit: number;
  sort?: 'newest' | 'oldest';
}
