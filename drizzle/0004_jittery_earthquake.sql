CREATE TYPE "public"."achievement_type" AS ENUM('founding_member', 'early_adopter', 'pioneer', 'charter_member', 'pro_pioneer', 'well_connected', 'super_connector', 'network_king', 'popular_profile', 'viral', 'code_master', 'star_collector', 'polyglot', 'open_source_hero', 'commit_streak', 'organization_member', 'hackathon_champion', 'hat_trick', 'serial_winner', 'hackathon_legend', 'team_player', 'solo_winner', 'profile_perfectionist', 'theme_customizer', 'early_bird', 'project_showcase', 'designer', 'storyteller', 'link_master', 'tech_stack_expert', 'launch_day', 'beta_tester', 'pro_member', 'loyal_pro', 'pro_veteran', 'premium_supporter');--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_type" "achievement_type" NOT NULL,
	"is_displayed" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0,
	"metadata" text,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;