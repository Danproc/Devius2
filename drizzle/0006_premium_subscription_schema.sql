-- Premium Subscription Schema Migration
-- Adds premium_tier to users, tier_code/active to plans, and subscription_events table

-- Create subscription_events table for webhook audit trail
CREATE TABLE IF NOT EXISTS "subscription_events" (
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

-- Add premium tier fields to plans table
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "tier_code" text;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;

-- Add premium_tier to users table
ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "premium_tier" text;

-- Add foreign key constraint for subscription_events (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_events_userId_app_user_id_fk'
  ) THEN
    ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_userId_app_user_id_fk"
      FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- Add unique constraint for plans.tier_code (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plans_tier_code_unique'
  ) THEN
    ALTER TABLE "plans" ADD CONSTRAINT "plans_tier_code_unique" UNIQUE("tier_code");
  END IF;
END $$;
