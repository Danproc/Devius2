-- Cleanup Test Hackathon and Achievements
-- Run this in Supabase SQL Editor
-- Deletes in correct order to avoid foreign key constraint violations

-- First, get the hackathon ID for reference
-- SELECT id FROM hackathons WHERE slug = 'stackathon-001';

-- Step 1: Delete badges FIRST (they reference both hackathons AND submissions)
DELETE FROM hackathon_badges WHERE submission_id IN (
  SELECT id FROM hackathon_submissions WHERE hackathon_id IN (
    SELECT id FROM hackathons WHERE slug = 'stackathon-001'
  )
);

-- Step 2: Delete scores (references submissions)
DELETE FROM hackathon_scores WHERE submission_id IN (
  SELECT id FROM hackathon_submissions WHERE hackathon_id IN (
    SELECT id FROM hackathons WHERE slug = 'stackathon-001'
  )
);

-- Step 3: Delete votes (references submissions)
DELETE FROM hackathon_votes WHERE submission_id IN (
  SELECT id FROM hackathon_submissions WHERE hackathon_id IN (
    SELECT id FROM hackathons WHERE slug = 'stackathon-001'
  )
);

-- Step 4: Delete team invites (references teams)
DELETE FROM hackathon_team_invites WHERE team_id IN (
  SELECT id FROM hackathon_teams WHERE hackathon_id IN (
    SELECT id FROM hackathons WHERE slug = 'stackathon-001'
  )
);

-- Step 5: Delete submissions (after badges, scores, votes are deleted)
DELETE FROM hackathon_submissions WHERE hackathon_id IN (
  SELECT id FROM hackathons WHERE slug = 'stackathon-001'
);

-- Step 6: Delete teams
DELETE FROM hackathon_teams WHERE hackathon_id IN (
  SELECT id FROM hackathons WHERE slug = 'stackathon-001'
);

-- Step 7: Delete registrations
DELETE FROM hackathon_registrations WHERE hackathon_id IN (
  SELECT id FROM hackathons WHERE slug = 'stackathon-001'
);

-- Step 8: Finally delete the hackathon itself
DELETE FROM hackathons WHERE slug = 'stackathon-001';

-- Step 9: Delete all achievements for your user
DELETE FROM user_achievements
WHERE user_id = (
  SELECT id FROM app_user WHERE email = 'hello@thenorthern-web.co.uk'
);

-- Verify cleanup
SELECT COUNT(*) as hackathon_count FROM hackathons;
SELECT COUNT(*) as achievement_count FROM user_achievements WHERE user_id = (
  SELECT id FROM app_user WHERE email = 'hello@thenorthern-web.co.uk'
);
