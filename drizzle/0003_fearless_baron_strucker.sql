CREATE TYPE "public"."participation_type" AS ENUM('solo', 'team');--> statement-breakpoint
ALTER TYPE "public"."hackathon_status" ADD VALUE 'registration' BEFORE 'active';--> statement-breakpoint
CREATE TABLE "hackathon_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"participation_type" "participation_type" NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unregistered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hackathon_registrations_hackathon_id_user_id_unique" UNIQUE("hackathon_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "registration_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "registration_end_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;