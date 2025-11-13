-- Migration: Remove analytics tables and custom domain fields

-- Drop analytics tables (if they exist)
DROP TABLE IF EXISTS analytics_daily CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

-- Remove custom domain fields from devcards table
ALTER TABLE devcards DROP COLUMN IF EXISTS custom_domain;
ALTER TABLE devcards DROP COLUMN IF EXISTS custom_domain_verified;

-- Add comment for documentation
COMMENT ON TABLE devcards IS 'Developer cards - user profiles with GitHub integration and custom projects';
