-- RLS Policies for StackPass Hackathons
-- Apply these in Supabase SQL Editor

-- ============================================
-- 1. HACKATHONS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

-- Public can read non-draft hackathons
CREATE POLICY "Public can view published hackathons"
ON hackathons FOR SELECT
TO authenticated, anon
USING (status != 'draft');

-- Only super admins can create hackathons
CREATE POLICY "Admins can create hackathons"
ON hackathons FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM app_user
    WHERE app_user.id = auth.uid()::text
    AND app_user.email = 'dan@stackpass.dev'
  )
);

-- Only super admins can update hackathons
CREATE POLICY "Admins can update hackathons"
ON hackathons FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_user
    WHERE app_user.id = auth.uid()::text
    AND app_user.email = 'dan@stackpass.dev'
  )
);

-- Only super admins can delete hackathons
CREATE POLICY "Admins can delete hackathons"
ON hackathons FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_user
    WHERE app_user.id = auth.uid()::text
    AND app_user.email = 'dan@stackpass.dev'
  )
);

-- ============================================
-- 2. HACKATHON_TEAMS TABLE
-- ============================================

ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;

-- All users can read teams
CREATE POLICY "Anyone can view teams"
ON hackathon_teams FOR SELECT
TO authenticated, anon
USING (true);

-- Pro members can create teams
CREATE POLICY "Pro members can create teams"
ON hackathon_teams FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = creator_user_id
  AND EXISTS (
    SELECT 1 FROM app_user
    WHERE app_user.id = auth.uid()::text
    -- Add your Pro membership check here
    -- Example: AND app_user.subscription_status = 'active'
  )
);

-- Team creator can update
CREATE POLICY "Creator can update team"
ON hackathon_teams FOR UPDATE
TO authenticated
USING (auth.uid()::text = creator_user_id);

-- ============================================
-- 3. HACKATHON_TEAM_INVITES TABLE
-- ============================================

ALTER TABLE hackathon_team_invites ENABLE ROW LEVEL SECURITY;

-- Users can view invites sent to them or by them
CREATE POLICY "Users can view their invites"
ON hackathon_team_invites FOR SELECT
TO authenticated
USING (
  auth.uid()::text = inviter_user_id
  OR auth.uid()::text = invitee_user_id
);

-- Team members can create invites
CREATE POLICY "Team members can send invites"
ON hackathon_team_invites FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = inviter_user_id);

-- Invitee can update (accept/decline)
CREATE POLICY "Invitee can respond to invite"
ON hackathon_team_invites FOR UPDATE
TO authenticated
USING (auth.uid()::text = invitee_user_id);

-- ============================================
-- 4. HACKATHON_SUBMISSIONS TABLE
-- ============================================

ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

-- Public can view submitted/winner submissions
CREATE POLICY "Anyone can view submitted entries"
ON hackathon_submissions FOR SELECT
TO authenticated, anon
USING (
  status IN ('submitted', 'winner_first', 'winner_second', 'winner_third')
);

-- Pro members can create submissions
CREATE POLICY "Pro members can create submissions"
ON hackathon_submissions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_id
  -- Add Pro membership check
);

-- Team members can update before deadline
CREATE POLICY "Team can update submission"
ON hackathon_submissions FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = user_id
  OR EXISTS (
    SELECT 1 FROM hackathon_teams
    WHERE hackathon_teams.id = hackathon_submissions.team_id
    AND hackathon_teams.members::jsonb @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text))
  )
);

-- ============================================
-- 5. HACKATHON_VOTES TABLE
-- ============================================

ALTER TABLE hackathon_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes
CREATE POLICY "Anyone can view votes"
ON hackathon_votes FOR SELECT
TO authenticated, anon
USING (true);

-- Pro members can vote
CREATE POLICY "Pro members can vote"
ON hackathon_votes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = voter_user_id
  -- Add Pro membership check
  -- AND check not voting for own team (enforced in app logic)
);

-- Users can delete their own votes
CREATE POLICY "Users can remove their votes"
ON hackathon_votes FOR DELETE
TO authenticated
USING (auth.uid()::text = voter_user_id);

-- ============================================
-- 6. HACKATHON_BADGES TABLE
-- ============================================

ALTER TABLE hackathon_badges ENABLE ROW LEVEL SECURITY;

-- Public can view all badges
CREATE POLICY "Anyone can view badges"
ON hackathon_badges FOR SELECT
TO authenticated, anon
USING (true);

-- Only system can create badges (via service role)
-- No INSERT policy for users - badges awarded by admin API only

-- Badges are permanent (no updates or deletes)

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Hackathons
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_by ON hackathons(created_by);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_creator ON hackathon_teams(creator_user_id);

-- Team Invites
CREATE INDEX IF NOT EXISTS idx_invites_invitee ON hackathon_team_invites(invitee_user_id);
CREATE INDEX IF NOT EXISTS idx_invites_team_status ON hackathon_team_invites(team_id, status);

-- Submissions
CREATE INDEX IF NOT EXISTS idx_submissions_hackathon ON hackathon_submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON hackathon_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON hackathon_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_placement ON hackathon_submissions(hackathon_id, placement);
CREATE INDEX IF NOT EXISTS idx_submissions_votes ON hackathon_submissions(vote_count DESC);

-- Votes
CREATE INDEX IF NOT EXISTS idx_votes_submission ON hackathon_votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON hackathon_votes(voter_user_id);

-- Badges
CREATE INDEX IF NOT EXISTS idx_badges_user ON hackathon_badges(user_id, awarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_hackathon ON hackathon_badges(hackathon_id);

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================

-- One vote per user per submission
CREATE UNIQUE INDEX IF NOT EXISTS unique_vote_per_submission
ON hackathon_votes(submission_id, voter_user_id);

-- One team invite per user per team
CREATE UNIQUE INDEX IF NOT EXISTS unique_invite_per_team
ON hackathon_team_invites(team_id, invitee_user_id);
