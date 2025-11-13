-- Migration: Add comprehensive GitHub stats fields to github_cache table

-- Add organizations array
ALTER TABLE "github_cache" ADD COLUMN "organizations" jsonb;

-- Add most starred repo object
ALTER TABLE "github_cache" ADD COLUMN "most_starred_repo" jsonb;

-- Add top languages array
ALTER TABLE "github_cache" ADD COLUMN "top_languages" jsonb;

-- Add comments for documentation
COMMENT ON COLUMN "github_cache"."organizations" IS 'Array of organization logins the user belongs to';
COMMENT ON COLUMN "github_cache"."most_starred_repo" IS 'Most starred repository: {name, full_name, stars, url, description, language}';
COMMENT ON COLUMN "github_cache"."top_languages" IS 'Top 3 languages with percentages: [{name, count, stars, percentage, color}]';
