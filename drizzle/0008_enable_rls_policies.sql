-- Comprehensive RLS Policy Migration
-- CRITICAL SECURITY: Enable RLS on all public tables
-- Run this immediately before shipping to production

-- ============================================================================
-- AUTHENTICATION TABLES (NextAuth)
-- ============================================================================

-- Enable RLS on all auth tables
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "authenticator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verificationToken" ENABLE ROW LEVEL SECURITY;

-- Account: Users can only read their own OAuth accounts
CREATE POLICY "Users can view own accounts"
  ON "account" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Service role can manage accounts"
  ON "account" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Session: Users can only read their own sessions
CREATE POLICY "Users can view own sessions"
  ON "session" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Service role can manage sessions"
  ON "session" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Authenticator: Users can only manage their own authenticators
CREATE POLICY "Users can view own authenticators"
  ON "authenticator" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Service role can manage authenticators"
  ON "authenticator" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Verification Token: No direct user access
CREATE POLICY "Service role only for verification tokens"
  ON "verificationToken" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- USER DATA
-- ============================================================================

ALTER TABLE "app_user" ENABLE ROW LEVEL SECURITY;

-- Users can view all public user data (for profiles)
CREATE POLICY "Users can view all users"
  ON "app_user" FOR SELECT
  USING (true);

-- Users can only update their own data
CREATE POLICY "Users can update own profile"
  ON "app_user" FOR UPDATE
  USING (auth.uid()::text = id);

-- Service role can manage all users
CREATE POLICY "Service role can manage users"
  ON "app_user" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- DEVCARDS (Public Profiles)
-- ============================================================================

ALTER TABLE "devcards" ENABLE ROW LEVEL SECURITY;

-- Anyone can view public devcards
CREATE POLICY "Anyone can view public devcards"
  ON "devcards" FOR SELECT
  USING (is_public = true);

-- Users can view their own devcards (even if private)
CREATE POLICY "Users can view own devcard"
  ON "devcards" FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update their own devcard
CREATE POLICY "Users can update own devcard"
  ON "devcards" FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Service role can manage all devcards
CREATE POLICY "Service role can manage devcards"
  ON "devcards" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- GITHUB CACHE
-- ============================================================================

ALTER TABLE "github_cache" ENABLE ROW LEVEL SECURITY;

-- Anyone can read github cache (for public profiles)
CREATE POLICY "Anyone can view github cache"
  ON "github_cache" FOR SELECT
  USING (true);

-- Service role can manage cache
CREATE POLICY "Service role can manage github cache"
  ON "github_cache" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- CONNECTIONS (Network)
-- ============================================================================

ALTER TABLE "connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blocked_users" ENABLE ROW LEVEL SECURITY;

-- Users can view connections they're part of
CREATE POLICY "Users can view own connections"
  ON "connections" FOR SELECT
  USING (
    auth.uid()::text = requester_id OR
    auth.uid()::text = recipient_id
  );

-- Users can create connection requests
CREATE POLICY "Users can create connections"
  ON "connections" FOR INSERT
  WITH CHECK (auth.uid()::text = requester_id);

-- Users can update connections they're part of
CREATE POLICY "Users can update own connections"
  ON "connections" FOR UPDATE
  USING (
    auth.uid()::text = requester_id OR
    auth.uid()::text = recipient_id
  );

-- Users can delete their own connections
CREATE POLICY "Users can delete own connections"
  ON "connections" FOR DELETE
  USING (
    auth.uid()::text = requester_id OR
    auth.uid()::text = recipient_id
  );

-- Blocked users: Can only manage own blocks
CREATE POLICY "Users can manage own blocks"
  ON "blocked_users" FOR ALL
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON "notifications" FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON "notifications" FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Service role can create notifications
CREATE POLICY "Service role can create notifications"
  ON "notifications" FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- HACKATHONS
-- ============================================================================

ALTER TABLE "hackathons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_team_invites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hackathon_badges" ENABLE ROW LEVEL SECURITY;

-- Anyone can view published hackathons
CREATE POLICY "Anyone can view published hackathons"
  ON "hackathons" FOR SELECT
  USING (status != 'draft');

-- Creators and admins can view drafts
CREATE POLICY "Creators can view own draft hackathons"
  ON "hackathons" FOR SELECT
  USING (auth.uid()::text = created_by);

-- Only creators can update their hackathons
CREATE POLICY "Creators can update own hackathons"
  ON "hackathons" FOR UPDATE
  USING (auth.uid()::text = created_by);

-- Service role can manage all hackathons
CREATE POLICY "Service role can manage hackathons"
  ON "hackathons" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Registrations: Users can view all registrations, manage their own
CREATE POLICY "Anyone can view registrations"
  ON "hackathon_registrations" FOR SELECT
  USING (true);

CREATE POLICY "Users can create own registration"
  ON "hackathon_registrations" FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own registration"
  ON "hackathon_registrations" FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own registration"
  ON "hackathon_registrations" FOR DELETE
  USING (auth.uid()::text = user_id);

-- Teams: Users can view all teams, manage teams they created
CREATE POLICY "Anyone can view teams"
  ON "hackathon_teams" FOR SELECT
  USING (true);

CREATE POLICY "Users can create teams"
  ON "hackathon_teams" FOR INSERT
  WITH CHECK (auth.uid()::text = creator_user_id);

CREATE POLICY "Team creators can update teams"
  ON "hackathon_teams" FOR UPDATE
  USING (auth.uid()::text = creator_user_id);

CREATE POLICY "Team creators can delete teams"
  ON "hackathon_teams" FOR DELETE
  USING (auth.uid()::text = creator_user_id);

-- Team Invites: Users can view invites sent to them or by them
CREATE POLICY "Users can view own team invites"
  ON "hackathon_team_invites" FOR SELECT
  USING (
    auth.uid()::text = inviter_user_id OR
    auth.uid()::text = invitee_user_id
  );

CREATE POLICY "Users can create team invites"
  ON "hackathon_team_invites" FOR INSERT
  WITH CHECK (auth.uid()::text = inviter_user_id);

CREATE POLICY "Users can respond to invites"
  ON "hackathon_team_invites" FOR UPDATE
  USING (auth.uid()::text = invitee_user_id);

-- Submissions: Anyone can view submitted, users manage their own
CREATE POLICY "Anyone can view submitted submissions"
  ON "hackathon_submissions" FOR SELECT
  USING (status != 'draft');

CREATE POLICY "Users can view own submissions"
  ON "hackathon_submissions" FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own submission"
  ON "hackathon_submissions" FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own submission"
  ON "hackathon_submissions" FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage submissions"
  ON "hackathon_submissions" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Votes: Users can view all votes, create their own
CREATE POLICY "Anyone can view votes"
  ON "hackathon_votes" FOR SELECT
  USING (true);

CREATE POLICY "Users can create own vote"
  ON "hackathon_votes" FOR INSERT
  WITH CHECK (auth.uid()::text = voter_user_id);

CREATE POLICY "Users cannot update votes"
  ON "hackathon_votes" FOR UPDATE
  USING (false);

CREATE POLICY "Users can delete own vote"
  ON "hackathon_votes" FOR DELETE
  USING (auth.uid()::text = voter_user_id);

-- Scores: Anyone can view final scores, only judges can create
CREATE POLICY "Anyone can view scores"
  ON "hackathon_scores" FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage scores"
  ON "hackathon_scores" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Badges: Anyone can view badges
CREATE POLICY "Anyone can view badges"
  ON "hackathon_badges" FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage badges"
  ON "hackathon_badges" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;

-- Anyone can view displayed achievements
CREATE POLICY "Anyone can view displayed achievements"
  ON "user_achievements" FOR SELECT
  USING (is_displayed = true);

-- Users can view all their own achievements
CREATE POLICY "Users can view own achievements"
  ON "user_achievements" FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update display settings for own achievements
CREATE POLICY "Users can update own achievements"
  ON "user_achievements" FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Service role can create achievements
CREATE POLICY "Service role can manage achievements"
  ON "user_achievements" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PAYMENT & SUBSCRIPTION DATA
-- ============================================================================

ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_events" ENABLE ROW LEVEL SECURITY;

-- Plans: Anyone can view active plans (for pricing page)
CREATE POLICY "Anyone can view active plans"
  ON "plans" FOR SELECT
  USING (active = true OR active IS NULL);

CREATE POLICY "Service role can manage plans"
  ON "plans" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Credit Transactions: Users can only view their own
CREATE POLICY "Users can view own credit transactions"
  ON "credit_transactions" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Service role can manage credit transactions"
  ON "credit_transactions" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Subscription Events: No user access (admin/webhook only)
CREATE POLICY "Service role only for subscription events"
  ON "subscription_events" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- LEGACY/UTILITY TABLES
-- ============================================================================

ALTER TABLE "contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "waitlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paypal_context" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paypal_access_tokens" ENABLE ROW LEVEL SECURITY;

-- Contact: Anyone can insert, service role can view
CREATE POLICY "Anyone can submit contact form"
  ON "contact" FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can view contact"
  ON "contact" FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Coupons: Service role only
CREATE POLICY "Service role can manage coupons"
  ON "coupon" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Waitlist: Anyone can join, service role can view
CREATE POLICY "Anyone can join waitlist"
  ON "waitlist" FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can view waitlist"
  ON "waitlist" FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- PayPal tables: Service role only (legacy)
CREATE POLICY "Service role only for paypal_context"
  ON "paypal_context" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role only for paypal_access_tokens"
  ON "paypal_access_tokens" FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all tables now have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'app_user', 'account', 'session', 'authenticator', 'verificationToken',
    'devcards', 'github_cache', 'connections', 'blocked_users', 'notifications',
    'hackathons', 'hackathon_registrations', 'hackathon_teams', 'hackathon_team_invites',
    'hackathon_submissions', 'hackathon_votes', 'hackathon_scores', 'hackathon_badges',
    'user_achievements', 'plans', 'credit_transactions', 'subscription_events',
    'contact', 'coupon', 'waitlist', 'paypal_context', 'paypal_access_tokens'
  )
ORDER BY tablename;

-- Expected result: All tables should show rls_enabled = true
