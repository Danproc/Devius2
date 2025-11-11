-- Migration: Add organization_profile field for Premium Features (T120)
-- Phase 8 - User Story 6: Premium Features & Monetization

-- Add organization_profile jsonb field to devcards table
ALTER TABLE "devcards" ADD COLUMN "organization_profile" jsonb;

-- Add comment to describe the field
COMMENT ON COLUMN "devcards"."organization_profile" IS 'Premium feature: Organization profile data including name, description, members, etc.';
