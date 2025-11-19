/**
 * TypeScript types for StackPass Hackathons
 */

import type {
  Hackathon,
  NewHackathon
} from '@/db/schema/hackathons';

import type {
  HackathonTeam,
  NewHackathonTeam
} from '@/db/schema/hackathon-teams';

import type {
  HackathonTeamInvite,
  NewHackathonTeamInvite
} from '@/db/schema/hackathon-team-invites';

import type {
  HackathonSubmission,
  NewHackathonSubmission
} from '@/db/schema/hackathon-submissions';

import type {
  HackathonVote,
  NewHackathonVote
} from '@/db/schema/hackathon-votes';

import type {
  HackathonBadge,
  NewHackathonBadge
} from '@/db/schema/hackathon-badges';

// Re-export database types
export type {
  Hackathon,
  NewHackathon,
  HackathonTeam,
  NewHackathonTeam,
  HackathonTeamInvite,
  NewHackathonTeamInvite,
  HackathonSubmission,
  NewHackathonSubmission,
  HackathonVote,
  NewHackathonVote,
  HackathonBadge,
  NewHackathonBadge,
};

// API Response types
export interface HackathonWithStats extends Hackathon {
  submission_count?: number;
  participant_count?: number;
  days_remaining?: number;
}

export interface SubmissionWithTeam extends HackathonSubmission {
  team?: HackathonTeam;
  team_members?: Array<{
    user_id: string;
    name: string;
    avatar_url: string;
    username: string;
  }>;
  user_has_voted?: boolean;
}

export interface HackathonWithSubmissions extends Hackathon {
  submissions: SubmissionWithTeam[];
}

export interface BadgeWithContext extends HackathonBadge {
  hackathon_title: string;
  hackathon_slug: string;
  project_title: string;
}

// Form types
export interface CreateHackathonInput {
  slug: string;
  title: string;
  theme?: string;
  description: string;
  rules?: string;
  registration_start_at?: string; // ISO timestamp
  registration_end_at?: string;
  start_at: string; // ISO timestamp
  submission_deadline_at: string;
  voting_start_at?: string;
  voting_end_at?: string;
  prizes: {
    currency: string;
    first: number;
    second: number;
    third: number;
  };
  max_participants?: number;
}

export interface CreateSubmissionInput {
  hackathon_id: string;
  team_id?: string;
  project_title: string;
  description: string;
  github_url: string;
  demo_url?: string;
  video_url?: string;
  tech_stack: string[];
}

export interface CreateTeamInput {
  hackathon_id: string;
  team_name?: string;
}

export interface TeamInviteInput {
  team_id: string;
  invitee_username: string;
}

export interface DeclareWinnersInput {
  hackathon_id: string;
  first_place_submission_id: string;
  second_place_submission_id?: string;
  third_place_submission_id?: string;
}

// Utility types
export type HackathonStatus = 'draft' | 'upcoming' | 'registration' | 'active' | 'voting' | 'completed';
export type SubmissionStatus = 'draft' | 'submitted' | 'disqualified' | 'winner_first' | 'winner_second' | 'winner_third';
export type BadgeType = 'gold' | 'silver' | 'bronze';
export type TeamInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type ParticipationType = 'solo' | 'team';
