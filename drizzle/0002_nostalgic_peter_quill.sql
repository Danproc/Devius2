ALTER TABLE "hackathon_badges" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hackathon_submissions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hackathon_team_invites" ALTER COLUMN "inviter_user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hackathon_team_invites" ALTER COLUMN "invitee_user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hackathon_teams" ALTER COLUMN "creator_user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hackathon_votes" ALTER COLUMN "voter_user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hackathons" ALTER COLUMN "created_by" SET DATA TYPE text;