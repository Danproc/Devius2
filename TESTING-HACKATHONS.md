# Hackathons Feature - Testing Guide

## Overview
Comprehensive testing checklist for the StackPass Hackathons system. Test all scenarios before production deployment.

---

## Pre-Test Setup

### Required Accounts
- [ ] Admin account (email in ADMIN_EMAILS)
- [ ] Pro user account (active subscription)
- [ ] Free user account (no subscription)
- [ ] 2-3 additional Pro accounts (for team testing)

### Environment Variables
```env
ADMIN_EMAILS=your-admin-email@example.com
DATABASE_URL=your-supabase-url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## T120: End-to-End Flow Test

### Step 1: Admin Creates Hackathon
- [ ] Login as admin
- [ ] Navigate to /admin/hackathons
- [ ] Click "Create Hackathon"
- [ ] Fill in all fields:
  - Title, theme, description, rules
  - Registration dates (start/end)
  - Hackathon start date
  - Submission deadline
  - Voting dates
  - Max participants (e.g., 100)
  - Prizes ($500, $300, $200)
- [ ] Click "Create Hackathon"
- [ ] Verify hackathon appears in list
- [ ] Verify status = "registration"

### Step 2: User Registers
- [ ] Login as Pro User 1
- [ ] Navigate to /app/hackathons
- [ ] Click on the hackathon
- [ ] Verify registration countdown timer shows
- [ ] Click "Register"
- [ ] Select "Team" participation
- [ ] Verify registration confirmation
- [ ] Check email for RegistrationConfirmation

### Step 3: Form Team
- [ ] Click "Create Team" or navigate to team page
- [ ] Enter team name
- [ ] Search for Pro User 2 by username
- [ ] Send invite
- [ ] Logout

### Step 4: Accept Team Invite
- [ ] Login as Pro User 2
- [ ] Navigate to hackathon page
- [ ] Verify "Team Invitations" section appears
- [ ] Check email for TeamInvite
- [ ] Click "Accept" on invite
- [ ] Verify added to team

### Step 5: Submit Project
- [ ] Wait for registration period to end (or update DB)
- [ ] Update hackathon status to "active"
- [ ] Login as Pro User 1 (team creator)
- [ ] Navigate to hackathon → Click "Submit Project"
- [ ] Fill in submission form:
  - Project title
  - Description (200+ chars)
  - GitHub URL
  - Demo URL
  - Video URL
  - Tech stack (3-5 technologies)
- [ ] Click "Submit Project"
- [ ] Verify submission appears

### Step 6: Voting
- [ ] Update hackathon status to "voting"
- [ ] Set voting_start_at to now, voting_end_at to future
- [ ] Login as Pro User 3 (not on team)
- [ ] Navigate to /app/hackathons/[slug]/vote
- [ ] Verify submission grid shows
- [ ] Click heart to vote
- [ ] Verify vote count increments
- [ ] Try voting on own submission (should fail)
- [ ] Click heart again to remove vote
- [ ] Verify vote count decrements

### Step 7: Declare Winners
- [ ] Login as admin
- [ ] Navigate to /admin/hackathons/[id]/judging
- [ ] Select 1st, 2nd, 3rd place winners
- [ ] Click "Declare Winners"
- [ ] Verify winner badges created
- [ ] Check emails for WinnerAnnouncement

### Step 8: Verify Badges
- [ ] Login as winning user
- [ ] Navigate to profile
- [ ] Verify hackathon badge appears
- [ ] Hover over badge, check tooltip
- [ ] Download wallet pass
- [ ] Verify "Hackathon Wins: 🥇1" in auxiliary field

---

## T121: Registration Capacity Limits

- [ ] Create hackathon with max_participants = 2
- [ ] Register User 1 (success)
- [ ] Register User 2 (success)
- [ ] Try to register User 3 (should fail with "full capacity" error)
- [ ] Verify registration count = 2
- [ ] Verify "Full" badge shows on hackathon card

---

## T122: Unregistration Deadlines

### Before Deadline
- [ ] Register for hackathon
- [ ] Click "Unregister" button
- [ ] Verify registration deleted
- [ ] Verify can re-register

### After Deadline
- [ ] Register for hackathon
- [ ] Update registration_end_at to past date
- [ ] Try to unregister (should fail)
- [ ] Verify error message about deadline

---

## T123: Submission Gate

- [ ] Create hackathon with registration required
- [ ] Login as Pro user who is NOT registered
- [ ] Try to access /app/hackathons/[slug]/enter
- [ ] Verify "Registration Required" message shows
- [ ] Verify cannot submit without registration

---

## T124: Team Formation (3 Members)

- [ ] Pro User 1 creates team, invites User 2 and User 3
- [ ] User 2 accepts invite
- [ ] User 3 accepts invite
- [ ] Verify team has 3 members
- [ ] User 1 submits project for team
- [ ] Verify all 3 team members can see the submission
- [ ] Try to add 4th and 5th member (test max 5 limit)

---

## T125: Voting Restrictions

### Own Submission
- [ ] Try to vote on your own submission
- [ ] Verify error: "Cannot vote on your own submission"

### Own Team's Submission
- [ ] Team member tries to vote on team submission
- [ ] Verify error: "Cannot vote on your own team's submission"

### Non-Pro User
- [ ] Login as Free user
- [ ] Try to vote
- [ ] Verify error: "Pro membership required to vote"

### Outside Voting Period
- [ ] Set voting_end_at to past date
- [ ] Try to vote
- [ ] Verify error: "Voting is not currently active"

---

## T126: Gallery Filtering (N/A - Removed)
~~Gallery removed - winners shown on hackathon pages~~

---

## T127: Wallet Pass with Badges

- [ ] Win a hackathon
- [ ] Verify badge appears on profile
- [ ] Generate Apple Wallet pass
- [ ] Open .pkpass file
- [ ] Verify auxiliary field shows "Hackathon Wins: 🥇1"
- [ ] Verify pass size < 200KB

---

## T128: README.md Update

Create comprehensive feature documentation in README.

---

## T129: API Documentation

Document all new endpoints with request/response examples.

---

## Additional Tests

### Achievement System
- [ ] Visit own profile
- [ ] Verify achievements auto-checked
- [ ] Verify Founding Member badge (if member_number <= 500)
- [ ] Go to /app/card/edit
- [ ] Verify "Achievement Display" section
- [ ] Toggle badge visibility (Eye/EyeOff)
- [ ] Verify profile updates immediately

### Admin Dashboard
- [ ] Login as admin
- [ ] Click "Admin Dashboard" in menu
- [ ] Verify sidebar shows
- [ ] Verify stats cards display correct counts
- [ ] Click each sidebar link (Dashboard, Hackathons, Settings)
- [ ] Verify all pages load with correct styling

### Navigation
- [ ] Verify "Hackathons" link in:
  - Landing page header
  - App header (logged in)
  - User dropdown menu
  - Admin sidebar
- [ ] All links go to /app/hackathons
- [ ] All use Trophy icon

### Free User Experience
- [ ] Login as Free user
- [ ] Browse /app/hackathons
- [ ] Click on a hackathon
- [ ] Verify green "Upgrade to Pro" banner shows
- [ ] Click "Upgrade now" → goes to /app/billing
- [ ] Try to register (should show upgrade CTA)
- [ ] Verify cannot submit, vote without Pro

---

## Critical Bugs to Watch For

- [ ] Duplicate achievements (unique constraint working?)
- [ ] Team invite emails sending correctly
- [ ] Registration capacity race conditions
- [ ] Vote count accuracy with concurrent votes
- [ ] Deadline enforcement (submissions after deadline)
- [ ] Pro status checks (expired subscriptions)
- [ ] Admin access (non-admins redirected)

---

## Performance Checks

- [ ] Hackathon list page loads < 2s
- [ ] Voting page handles 100+ submissions
- [ ] Achievement checking doesn't slow profile loads
- [ ] Admin dashboard stats query performant

---

## Test Results

**Date Tested:** _______________
**Tester:** _______________
**Pass/Fail:** _______________

**Issues Found:**
1.
2.
3.

**Notes:**
