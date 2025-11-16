# Email Setup Guide for StackPass

## Quick Setup (5 minutes)

### 1. Get Resend API Key

1. Go to https://resend.com/api-keys
2. Click **Create API Key**
3. Name: `StackPass`
4. Copy the key (starts with `re_...`)

### 2. Add to .env.local

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@stackpass.dev
```

### 3. Verify Domain in Resend

1. Go to https://resend.com/domains
2. Click **Add Domain**
3. Enter: `stackpass.dev`
4. Add DNS records shown by Resend to your 20i dashboard
5. Wait for verification (~5 minutes)

**Typical DNS Records:**
```
Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: @
Value: [verification code from Resend]
```

### 4. Test Email Sending

Once domain is verified, emails will automatically send when:

✅ **User signs up** - Welcome email with dashboard link
✅ **Connection request** - Notification to recipient
✅ **Connection accepted** - Notification to requester

---

## Emails That Will Be Sent

### 1. Welcome Email
**Trigger**: User completes GitHub OAuth and account is created
**To**: New user
**Subject**: "Welcome to StackPass!"
**Contains**:
- Welcome message
- Link to dashboard
- Getting started tips

### 2. Connection Request
**Trigger**: Someone sends a connection request
**To**: Recipient
**Subject**: "[Name] wants to connect on StackPass"
**Contains**:
- Who sent the request
- Their message (if included)
- Link to their StackPass
- Button to view/respond to request

### 3. Connection Accepted
**Trigger**: User accepts a connection request
**To**: Original requester
**Subject**: "[Name] accepted your connection request"
**Contains**:
- Acceptance confirmation
- Link to accepter's StackPass
- Link to network page

---

## Manual Testing

Once configured, you can test emails by:

1. **Welcome Email**: Create a new account
2. **Connection Request**: Send yourself a connection request from another account
3. **Connection Accepted**: Accept that request

Or use the Resend dashboard to send test emails.

---

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL=noreply@stackpass.dev`

2. Make sure domain is verified in Resend

3. Deploy - emails will work automatically!

---

## Email Integration Status

✅ Resend SDK installed
✅ Email templates created (React Email)
✅ Email client configured
✅ Trigger functions created
⏳ **Need to add triggers to auth flow** (see below)
⏳ **Need to add triggers to connection API** (see below)

---

## Adding Email Triggers to Your Code

### Where to Add Welcome Email

**File**: `src/auth.ts` (or wherever new users are created)

**Add after user creation**:
```typescript
import { sendWelcomeEmail, isEmailConfigured } from '@/lib/email';

// After creating devcard for new user:
if (isEmailConfigured() && user.email) {
  await sendWelcomeEmail({
    to: user.email,
    name: user.name || user.email,
  }).catch(err => console.error('Failed to send welcome email:', err));
}
```

### Where to Add Connection Request Email

**File**: `src/app/api/connections/route.ts` (POST endpoint)

**Add after creating connection request**:
```typescript
import { sendConnectionRequestEmail, isEmailConfigured } from '@/lib/email';

// After inserting connection request:
if (isEmailConfigured() && recipientEmail) {
  await sendConnectionRequestEmail({
    to: recipientEmail,
    requesterName: requesterUser.name,
    requesterUsername: requesterDevCard.url_slug,
    message: requestMessage,
  }).catch(err => console.error('Failed to send connection request email:', err));
}
```

### Where to Add Connection Accepted Email

**File**: `src/app/api/connections/[id]/route.ts` (PATCH endpoint for accepting)

**Add after accepting connection**:
```typescript
import { sendConnectionAcceptedEmail, isEmailConfigured } from '@/lib/email';

// After updating connection status to 'accepted':
if (isEmailConfigured() && requesterEmail) {
  await sendConnectionAcceptedEmail({
    to: requesterEmail,
    accepterName: accepterUser.name,
    accepterUsername: accepterDevCard.url_slug,
  }).catch(err => console.error('Failed to send connection accepted email:', err));
}
```

---

## Troubleshooting

**Emails not sending?**
1. Check `RESEND_API_KEY` is set in `.env.local`
2. Check domain is verified in Resend dashboard
3. Check console logs for error messages
4. Verify `RESEND_FROM_EMAIL` matches your verified domain

**Domain not verifying?**
1. Check DNS records are exactly as shown by Resend
2. Wait 15-30 minutes for DNS propagation
3. Use https://mxtoolbox.com to check DNS records

**Emails going to spam?**
1. Make sure domain is verified
2. Add SPF/DKIM records (Resend provides these)
3. Warm up your sending domain (send to yourself first)

---

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to .env.local
3. ⏳ Verify domain in Resend
4. ⏳ I can help you add the email triggers to auth.ts and connection APIs

Let me know when domain is verified and I'll help you integrate the triggers!
