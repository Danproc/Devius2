-- Migration: Add custom_projects column to devcards table
-- This replaces the featured_repos field with a more flexible custom projects system

-- Add the custom_projects column
ALTER TABLE "devcards" ADD COLUMN "custom_projects" jsonb;

-- Add a comment to explain the column structure
COMMENT ON COLUMN "devcards"."custom_projects" IS 'Array of up to 3 custom projects with structure: {id, title, description, projectUrl?, githubUrl?, techStack[], order, stars?, forks?, language?, lastFetched?}';

-- Optional: Migrate existing featured_repos data to custom_projects
-- This is a one-time migration that converts the first 3 featured repos
-- Note: This assumes featured_repos contains GitHub repo full names like "owner/repo"
UPDATE "devcards"
SET "custom_projects" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'title', split_part(repo_name, '/', 2),
      'description', '',
      'githubUrl', 'https://github.com/' || repo_name,
      'techStack', '[]'::jsonb,
      'order', row_num - 1
    )
  )
  FROM (
    SELECT
      repo_name,
      ROW_NUMBER() OVER () as row_num
    FROM jsonb_array_elements_text("devcards"."featured_repos") AS repo_name
    LIMIT 3
  ) AS repos
)
WHERE "featured_repos" IS NOT NULL
  AND jsonb_array_length("featured_repos") > 0
  AND "custom_projects" IS NULL;

-- Add index for better query performance on custom_projects
CREATE INDEX IF NOT EXISTS "idx_devcards_custom_projects" ON "devcards" USING gin ("custom_projects");
