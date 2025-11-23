CREATE TABLE "hackathon_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"judge_user_id" text NOT NULL,
	"innovation" integer DEFAULT 0 NOT NULL,
	"technical_execution" integer DEFAULT 0 NOT NULL,
	"design_ux" integer DEFAULT 0 NOT NULL,
	"completeness" integer DEFAULT 0 NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"stripeEventId" text NOT NULL,
	"eventType" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processedAt" timestamp DEFAULT now(),
	"processingStatus" text DEFAULT 'success' NOT NULL,
	"errorMessage" text,
	CONSTRAINT "subscription_events_stripeEventId_unique" UNIQUE("stripeEventId")
);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "tier_code" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "premium_tier" text;--> statement-breakpoint
ALTER TABLE "hackathon_scores" ADD CONSTRAINT "hackathon_scores_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_scores" ADD CONSTRAINT "hackathon_scores_submission_id_hackathon_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."hackathon_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_scores" ADD CONSTRAINT "hackathon_scores_judge_user_id_app_user_id_fk" FOREIGN KEY ("judge_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_tier_code_unique" UNIQUE("tier_code");