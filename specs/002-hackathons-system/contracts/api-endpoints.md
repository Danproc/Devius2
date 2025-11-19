# API Endpoints: StackPass Hackathons

**Feature**: StackPass Hackathons
**Branch**: 002-hackathons-system
**Date**: 2025-11-17

## Base URL

All endpoints prefixed with `/api/hackathons`

---

## Admin Endpoints (Super Admin Only)

### POST /api/hackathons
Create new hackathon

**Auth**: Super admin required
**Request Body**:
```json
{
  "slug": "build-a-tool-jan-2025",
  "title": "Build a Developer Tool",
  "theme": "CLI tools, APIs, libraries",
  "description": "Create a useful tool for developers...",
  "rules": "Must be open source, working demo required...",
  "start_at": "2025-01-15T00:00:00Z",
  "submission_deadline_at": "2025-01-29T23:59:59Z",
  "voting_start_at": "2025-01-30T00:00:00Z",
  "voting_end_at": "2025-02-05T23:59:59Z",
  "prizes": { "currency": "USD", "first": 500, "second": 300, "third": 200 },
  "max_participants": null
}
```

**Response**: 201 Created
```json
{
  "id": "uuid",
  "slug": "build-a-tool-jan-2025",
  "status": "draft",
  ...
}
```

---

### PATCH /api/hackathons/:id
Update hackathon

**Auth**: Super admin
**Request**: Partial hackathon object
**Response**: 200 OK with updated hackathon

---

### POST /api/hackathons/:id/publish
Change status to upcoming/active

**Auth**: Super admin
**Response**: 200 OK

---

### POST /api/hackathons/:id/declare-winners
Award winners and create badges

**Auth**: Super admin
**Request Body**:
```json
{
  "first_place_submission_id": "uuid",
  "second_place_submission_id": "uuid",
  "third_place_submission_id": "uuid"
}
```

**Response**: 200 OK
```json
{
  "badges_created": 3,
  "hackathon_status": "completed"
}
```

---

### GET /api/hackathons/:id/judging
Get all submissions with vote counts for judging

**Auth**: Super admin
**Response**: 200 OK
```json
{
  "submissions": [
    {
      "id": "uuid",
      "project_title": "...",
      "team_members": [...],
      "vote_count": 42,
      "github_url": "...",
      "demo_url": "..."
    }
  ]
}
```

---

## Pro Member Endpoints

### GET /api/hackathons
List active/upcoming hackathons

**Auth**: Authenticated user
**Query Params**: `?status=active` (optional)
**Response**: 200 OK
```json
{
  "hackathons": [
    {
      "id": "uuid",
      "slug": "...",
      "title": "...",
      "status": "active",
      "submission_deadline_at": "...",
      "prizes": {...}
    }
  ]
}
```

---

### POST /api/hackathons/:id/teams
Create team for hackathon

**Auth**: Pro member
**Request Body**:
```json
{
  "team_name": "Code Wizards" // optional
}
```

**Response**: 201 Created with team object

---

### POST /api/hackathons/:id/teams/:teamId/invites
Invite member to team

**Auth**: Team creator
**Request Body**:
```json
{
  "invitee_username": "johndoe"
}
```

**Response**: 201 Created

---

### POST /api/hackathons/teams/invites/:inviteId/accept
Accept team invitation

**Auth**: Invitee
**Response**: 200 OK, user added to team

---

### POST /api/hackathons/:id/submissions
Create submission

**Auth**: Pro member (solo or team captain)
**Request Body**:
```json
{
  "team_id": "uuid", // or null for solo
  "project_title": "DevFlow CLI",
  "description": "A task runner for...",
  "github_url": "https://github.com/user/repo",
  "demo_url": "https://devflow.app",
  "video_url": "https://youtube.com/...",
  "tech_stack": ["Node.js", "TypeScript", "Commander"]
}
```

**Response**: 201 Created

---

### PATCH /api/hackathons/submissions/:id
Update submission

**Auth**: Team member, before deadline
**Request**: Partial submission fields
**Response**: 200 OK

---

### GET /api/hackathons/:id/submissions/me
Get user's submission for this hackathon

**Auth**: Authenticated user
**Response**: 200 OK with submission or 404

---

### POST /api/hackathons/submissions/:id/vote
Vote on a submission

**Auth**: Pro member, during voting period
**Response**: 201 Created

---

### DELETE /api/hackathons/submissions/:submissionId/vote
Remove vote

**Auth**: Voter, during voting period
**Response**: 204 No Content

---

## Public Endpoints

### GET /api/hackathons/:slug
Get hackathon details by slug

**Auth**: None (public)
**Response**: 200 OK with hackathon object

---

### GET /api/hackathons/:id/submissions
List submissions for hackathon

**Auth**: None during voting/completed, Pro member otherwise
**Query**: `?status=submitted&sort=votes`
**Response**: 200 OK with submissions array

---

### GET /api/gallery/winners
List all winning submissions

**Auth**: None (public)
**Query**: `?hackathon_id=uuid&tech_stack=React&page=1`
**Response**: 200 OK
```json
{
  "winners": [...],
  "total": 42,
  "page": 1,
  "per_page": 20
}
```

---

### GET /api/users/:userId/badges
Get badges for user

**Auth**: None (public)
**Response**: 200 OK
```json
{
  "badges": [
    {
      "id": "uuid",
      "badge_type": "gold",
      "hackathon_title": "...",
      "awarded_at": "..."
    }
  ]
}
```

---

## Error Responses

**400 Bad Request**: Invalid input (validation errors)
**401 Unauthorized**: Not authenticated
**403 Forbidden**: Not admin/Pro member
**404 Not Found**: Resource doesn't exist
**409 Conflict**: Already submitted, vote exists, etc.
**422 Unprocessable**: Deadline passed, wrong status, etc.

---

## Rate Limiting

- Admin endpoints: 100 req/min
- Submission endpoints: 20 req/min per user
- Voting: 60 req/min per user
- Public gallery: 120 req/min per IP
