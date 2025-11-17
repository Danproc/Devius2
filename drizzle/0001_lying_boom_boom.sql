CREATE TYPE "public"."badge_type" AS ENUM('gold', 'silver', 'bronze');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('draft', 'submitted', 'disqualified', 'winner_first', 'winner_second', 'winner_third');--> statement-breakpoint
CREATE TYPE "public"."team_invite_status" AS ENUM('pending', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."hackathon_status" AS ENUM('draft', 'upcoming', 'active', 'voting', 'completed');--> statement-breakpoint
CREATE TABLE "hackathon_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"badge_type" "badge_type" NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"team_id" uuid,
	"user_id" uuid NOT NULL,
	"project_title" text NOT NULL,
	"description" text NOT NULL,
	"github_url" text NOT NULL,
	"demo_url" text,
	"video_url" text,
	"tech_stack" jsonb NOT NULL,
	"status" "submission_status" DEFAULT 'draft' NOT NULL,
	"placement" integer,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_team_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"inviter_user_id" uuid NOT NULL,
	"invitee_user_id" uuid NOT NULL,
	"status" "team_invite_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hackathon_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"creator_user_id" uuid NOT NULL,
	"team_name" text,
	"members" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"voter_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"theme" text,
	"description" text NOT NULL,
	"rules" text,
	"status" "hackathon_status" DEFAULT 'draft' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"submission_deadline_at" timestamp with time zone NOT NULL,
	"voting_start_at" timestamp with time zone,
	"voting_end_at" timestamp with time zone,
	"prizes" jsonb NOT NULL,
	"max_participants" jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hackathons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "analytics_daily" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "analytics_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "analytics_daily" CASCADE;--> statement-breakpoint
DROP TABLE "analytics_events" CASCADE;--> statement-breakpoint
ALTER TABLE "devcards" ADD COLUMN "custom_projects" jsonb;--> statement-breakpoint
ALTER TABLE "devcards" ADD COLUMN "organization_profile" jsonb;--> statement-breakpoint
ALTER TABLE "devcards" ADD COLUMN "member_number" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "github_cache" ADD COLUMN "organizations" jsonb;--> statement-breakpoint
ALTER TABLE "github_cache" ADD COLUMN "most_starred_repo" jsonb;--> statement-breakpoint
ALTER TABLE "github_cache" ADD COLUMN "top_languages" jsonb;--> statement-breakpoint
ALTER TABLE "hackathon_badges" ADD CONSTRAINT "hackathon_badges_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_badges" ADD CONSTRAINT "hackathon_badges_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_badges" ADD CONSTRAINT "hackathon_badges_submission_id_hackathon_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."hackathon_submissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_team_id_hackathon_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."hackathon_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_team_invites" ADD CONSTRAINT "hackathon_team_invites_team_id_hackathon_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."hackathon_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_team_invites" ADD CONSTRAINT "hackathon_team_invites_inviter_user_id_app_user_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_team_invites" ADD CONSTRAINT "hackathon_team_invites_invitee_user_id_app_user_id_fk" FOREIGN KEY ("invitee_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_teams" ADD CONSTRAINT "hackathon_teams_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_teams" ADD CONSTRAINT "hackathon_teams_creator_user_id_app_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."app_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_votes" ADD CONSTRAINT "hackathon_votes_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_votes" ADD CONSTRAINT "hackathon_votes_submission_id_hackathon_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."hackathon_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_votes" ADD CONSTRAINT "hackathon_votes_voter_user_id_app_user_id_fk" FOREIGN KEY ("voter_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devcards" DROP COLUMN "custom_domain";--> statement-breakpoint
ALTER TABLE "devcards" DROP COLUMN "custom_domain_verified";--> statement-breakpoint
ALTER TABLE "devcards" ADD CONSTRAINT "devcards_member_number_unique" UNIQUE("member_number");