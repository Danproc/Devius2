-- Migration: Promotional Grants System
-- Description: Add promotional grants table and premium_source column for time-limited promotional access
-- Date: 2025-11-26

-- Create promotional_grants table
CREATE TABLE IF NOT EXISTS "promotional_grants" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL REFERENCES "app_user"("id") ON DELETE CASCADE,

  -- Promotion identification
  "promotion_type" TEXT NOT NULL,
  "promotion_name" TEXT NOT NULL,

  -- Access configuration
  "granted_tier" TEXT NOT NULL,
  "granted_duration_days" INTEGER NOT NULL,

  -- Status tracking
  "status" TEXT NOT NULL CHECK ("status" IN ('active', 'expired', 'revoked')),
  "granted_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMP NOT NULL,
  "activated_at" TIMESTAMP,

  -- Extensible metadata
  "metadata" JSONB DEFAULT '{}'::jsonb,

  -- Admin audit trail
  "granted_by" TEXT,
  "revoke_reason" TEXT,

  -- Timestamps
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Unique constraint: one promotion type per user
  CONSTRAINT "unique_user_promotion" UNIQUE("user_id", "promotion_type")
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_promotional_grants_user" ON "promotional_grants"("user_id");
CREATE INDEX IF NOT EXISTS "idx_promotional_grants_status" ON "promotional_grants"("status");
CREATE INDEX IF NOT EXISTS "idx_promotional_grants_expires" ON "promotional_grants"("expires_at") WHERE "status" = 'active';
CREATE INDEX IF NOT EXISTS "idx_promotional_grants_type" ON "promotional_grants"("promotion_type");

-- Add premium_source column to app_user table
ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "premium_source" TEXT;

-- Create index for premium_source
CREATE INDEX IF NOT EXISTS "idx_users_premium_source" ON "app_user"("premium_source") WHERE "premium_source" IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE "promotional_grants" IS 'Time-limited promotional grants for premium access (founding members, Black Friday, referrals, etc.)';
COMMENT ON COLUMN "promotional_grants"."promotion_type" IS 'Unique identifier for promotion (e.g., founding_member_year, black_friday_2026)';
COMMENT ON COLUMN "promotional_grants"."promotion_name" IS 'Human-readable display name for the promotion';
COMMENT ON COLUMN "promotional_grants"."granted_tier" IS 'Premium tier granted by this promotion (references plans.tier_code)';
COMMENT ON COLUMN "promotional_grants"."granted_duration_days" IS 'Duration of the grant in days (e.g., 365 for founding members)';
COMMENT ON COLUMN "promotional_grants"."status" IS 'Current status: active (in use), expired (time elapsed), revoked (admin cancelled)';
COMMENT ON COLUMN "promotional_grants"."metadata" IS 'Extensible JSON metadata for promotion-specific data (badges, campaign info, etc.)';
COMMENT ON COLUMN "promotional_grants"."granted_by" IS 'Admin user ID who granted this promotion';
COMMENT ON COLUMN "promotional_grants"."revoke_reason" IS 'Explanation if promotion was revoked by admin';

COMMENT ON COLUMN "app_user"."premium_source" IS 'Source of premium access: stripe (paid subscription), promotional (time-limited grant), ltd (lifetime deal)';

-- Enable RLS on promotional_grants
ALTER TABLE "promotional_grants" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own promotional grants
CREATE POLICY "Users can view own promotional grants"
  ON "promotional_grants"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- RLS Policy: Only admins can insert/update/delete promotional grants
CREATE POLICY "Admins can manage promotional grants"
  ON "promotional_grants"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "app_user"
      WHERE id = auth.uid()::text
      AND role IN ('admin', 'super_admin')
    )
  );
