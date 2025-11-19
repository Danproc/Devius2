# Hackathons API Documentation

Complete API reference for StackPass Hackathons feature.

---

## Authentication

All endpoints require authentication unless marked as **(Public)**.

**Headers:**
```
Authorization: Bearer <session-token>
Content-Type: application/json
```

---

## Hackathons

### GET /api/hackathons
List all active/upcoming hackathons **(Public)**

**Response:**
```json
{
  "hackathons": [
    {
      "id": "uuid",
      "title": "StackPass Hackathon #1",
      "slug": "stackathon-001",
      "theme": "Build the future of developer profiles",
      "status": "registration",
      "start_at": "2025-12-01T00:00:00Z",
      "submission_deadline_at": "2025-12-15T23:59:59Z",
      "prizes": { "first": 500, "second": 300, "third": 200 },
      "max_participants": 100
    }
  ]
}
```

### GET /api/hackathons/[slug]
Get hackathon details by slug **(Public)**

---

## Registration

### POST /api/hackathons/[id]/registrations
Register for a hackathon **(Pro Only)**

**Body:**
```json
{
  "participation_type": "solo" | "team"
}
```

**Response:**
```json
{
  "registration": {
    "id": "uuid",
    "hackathon_id": "uuid",
    "user_id": "user-id",
    "participation_type": "team",
    "registered_at": "2025-11-19T12:00:00Z"
  }
}
```

**Errors:**
- `400` - Already registered / Full capacity / Not in registration period
- `403` - Pro membership required

**Side Effects:**
- Sends RegistrationConfirmation email

### DELETE /api/hackathons/[id]/registrations/me
Unregister from hackathon

**Errors:**
- `400` - Cannot unregister after deadline

### GET /api/hackathons/[id]/registrations/me
Get current user's registration status

---

## Teams

### POST /api/hackathons/[id]/teams
Create a team **(Pro Only)**

**Body:**
```json
{
  "team_name": "Code Warriors"
}
```

### POST /api/hackathons/teams/[teamId]/invites
Send team invitation **(Pro Only)**

**Body:**
```json
{
  "username": "github_username"
}
```

**Side Effects:**
- Sends TeamInvite email to invitee

### POST /api/hackathons/teams/invites/[id]/accept
Accept team invitation

### DELETE /api/hackathons/teams/invites/[id]
Decline team invitation

### GET /api/hackathons/teams/invites/me
Get pending team invitations

---

## Submissions

### POST /api/hackathons/[id]/submissions
Submit a project **(Pro + Registered)**

**Body:**
```json
{
  "project_title": "AwesomeApp",
  "description": "A revolutionary tool for...",
  "github_url": "https://github.com/user/repo",
  "demo_url": "https://demo.com",
  "video_url": "https://youtube.com/watch?v=...",
  "tech_stack": ["React", "TypeScript", "Next.js"],
  "status": "submitted"
}
```

**Validation:**
- title: 3-100 chars
- description: 10-5000 chars
- github_url: Must be valid GitHub repo URL
- tech_stack: 1-10 tags, each 2-30 chars

**Errors:**
- `403` - Not registered / Pro required
- `400` - Past deadline / Already submitted

### PATCH /api/hackathons/submissions/[id]
Update submission (before deadline)

### GET /api/hackathons/[id]/submissions
List all submissions for voting

**Response includes:**
```json
{
  "submissions": [
    {
      "id": "uuid",
      "project_title": "AwesomeApp",
      "vote_count": 42,
      "user_has_voted": true,
      "tech_stack": ["React", "TypeScript"]
    }
  ]
}
```

---

## Voting

### POST /api/hackathons/submissions/[id]/vote
Cast a vote **(Pro Only)**

**Restrictions:**
- Cannot vote on own submission
- Cannot vote on own team's submission
- Must be within voting period
- One vote per submission per user

**Side Effects:**
- Increments submission vote_count
- Creates vote record

### DELETE /api/hackathons/submissions/[id]/vote
Remove a vote

---

## Badges & Achievements

### GET /api/users/[userId]/badges
Get user's hackathon badges **(Public)**

**Response:**
```json
{
  "badges": [
    {
      "badge": {
        "badge_type": "gold",
        "awarded_at": "2025-12-20T00:00:00Z"
      },
      "hackathon": {
        "title": "StackPass Hackathon #1",
        "slug": "stackathon-001"
      }
    }
  ],
  "stats": {
    "total": 3,
    "first": 1,
    "second": 1,
    "third": 1
  }
}
```

### GET /api/users/[userId]/achievements
Get user's achievement badges **(Public)**

### POST /api/achievements/check
Check and award new achievements **(Authenticated)**

**Response:**
```json
{
  "new_achievements": 3,
  "total_achievements": 5,
  "achievements": [...]
}
```

### PATCH /api/achievements/[id]/toggle
Toggle achievement visibility

---

## Admin Endpoints

### POST /api/admin/achievements/check-all
Award achievements to all users **(Admin Only)**

### POST /api/admin/achievements/clean-duplicates
Remove duplicate achievements **(Admin Only)**

### GET /api/admin/check
Check if current user is admin

**Response:**
```json
{
  "isAdmin": true
}
```

---

## Rate Limits

- Registration: 1 per user per hackathon
- Team invites: No limit (validated at team level)
- Voting: 1 vote per submission per user
- Submissions: 1 per user per hackathon

---

## Webhooks / Events

None currently implemented. Consider adding:
- `hackathon.registration.created`
- `hackathon.submission.created`
- `hackathon.vote.cast`
- `hackathon.winner.declared`

---

## Error Codes

- `400` - Bad request (validation, capacity, deadline)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (Pro required, not registered)
- `404` - Not found
- `500` - Server error
