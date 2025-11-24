# Pre-Launch Security Checklist

**Last Updated**: 2025-11-24
**Status**: Ready for Production Launch

## 🔴 CRITICAL - Must Do Before Launch

### 1. Rotate All API Keys

**Why**: Keys in git history or local files may be compromised

**Keys to Rotate**:

```bash
# NextAuth
AUTH_SECRET=                    # Generate: openssl rand -base64 32
NEXTAUTH_URL=https://stackpass.dev

# Stripe (use LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_...   # Get from Stripe Dashboard → Live mode
STRIPE_WEBHOOK_SECRET=whsec_... # Create production webhook endpoint
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...  # Live mode price ID

# GitHub OAuth
GITHUB_ID=                      # Create new OAuth app for production
GITHUB_SECRET=                  # Rotate secret

# Supabase
SUPABASE_SERVICE_ROLE_KEY=      # Rotate in Supabase Settings → API

# Email
RESEND_API_KEY=                 # Create production-only API key
```

**How to Rotate**:
1. Generate new keys in each service's dashboard
2. Update Vercel environment variables
3. Redeploy application
4. Delete old keys from services (after confirming new ones work)

---

### 2. Make GitHub Repository Private

**Action**:
1. Go to GitHub → StackPass repository
2. Settings → General → Danger Zone
3. "Change repository visibility" → Make Private

**Why**:
- Protects business logic and database schema
- Hides accidentally committed secrets
- Prevents competitors from cloning your app
- Standard practice for commercial SaaS products

**Note**: You can still deploy to Vercel with a private repo (Vercel has access)

---

### 3. Verify No Secrets in Git History

**Check if .env.local was ever committed**:
```bash
git log --all --full-history -- ".env.local"
git log --all --full-history -- ".env"
```

**If output shows commits**: Your secrets are in git history
- **Action**: Rotate ALL keys immediately
- Consider using BFG Repo-Cleaner to remove from history (optional)

**Check for other sensitive files**:
```bash
git log --all --full-history -- "*.pem"
git log --all --full-history -- "*.key"
```

---

### 4. Production Environment Variables (Vercel)

**Verify these are set in Vercel** → Settings → Environment Variables:

```bash
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://stackpass.dev

# Database
DATABASE_URL=postgresql://...  # Supabase connection pooler URL

# Auth
AUTH_SECRET=                   # NEW rotated secret
NEXTAUTH_URL=https://stackpass.dev

# GitHub OAuth
GITHUB_ID=                     # Production OAuth app
GITHUB_SECRET=                 # Rotated secret

# Stripe (LIVE mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # From production webhook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_... # Live price ID

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=      # Rotated key

# Email
RESEND_API_KEY=                # Production key
RESEND_FROM_EMAIL=noreply@stackpass.dev

# Admin
ADMIN_EMAILS=your-email@stackpass.dev
```

---

## 🟡 IMPORTANT - Should Do

### 5. Stripe Production Setup

**Create Production Webhook**:
1. Stripe Dashboard → Switch to **Live Mode**
2. Developers → Webhooks → Add endpoint
3. URL: `https://stackpass.dev/api/webhooks/stripe`
4. Events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy signing secret → Update `STRIPE_WEBHOOK_SECRET` in Vercel

**Create Production Product**:
1. Products → Create Product: "StackPass Premium"
2. Pricing: $49/year, Recurring, Annual
3. Copy price ID → Update `STRIPE_PREMIUM_ANNUAL_PRICE_ID` in Vercel

---

### 6. Enable Supabase Password Protection

**Supabase Dashboard**:
1. Authentication → Policies
2. Enable "Leaked Password Protection"
3. Prevents use of compromised passwords (HaveIBeenPwned check)

---

### 7. Database Security (Already Done ✅)

- ✅ RLS enabled on all 26 tables
- ✅ Comprehensive access control policies
- ✅ Foreign key indexes for performance
- ✅ Function security (search_path set)

**No action needed** - already optimized in this branch

---

### 8. Verify .gitignore

**Check these are ignored**:
```
.env
.env.local
.env*.local
*.pem
*.key
node_modules/
.next/
```

**Verify**:
```bash
cat .gitignore | grep -E "env|pem|key"
```

---

## 🟢 RECOMMENDED - Nice to Have

### 9. Security Headers (Next.js Config)

Add to `next.config.js`:
```js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

---

### 10. Rate Limiting

**Options**:
- Vercel Pro: Built-in rate limiting
- Upstash Rate Limit: Add to API routes
- Supabase: Enable rate limiting in dashboard

**Recommended for**:
- `/api/billing/checkout`
- `/api/connections/requests`
- `/api/hackathons/*/registrations`

---

### 11. Error Monitoring

**Set up Sentry or similar**:
```bash
pnpm add @sentry/nextjs
```

Track production errors, performance issues, failed API calls.

---

### 12. Backup Verification

**Supabase**:
- Backups are automatic (check Settings → Database → Backups)
- Verify daily backups are running
- Consider enabling Point-in-Time Recovery (Pro plan)

---

## 📋 Launch Day Checklist

### Before Deploying:
- [ ] All API keys rotated
- [ ] GitHub repo set to private
- [ ] Vercel environment variables updated with production keys
- [ ] Stripe webhook endpoint created (live mode)
- [ ] Stripe product created ($49/year)
- [ ] .env.local not in git history

### After Deploying:
- [ ] Test Stripe checkout with real card
- [ ] Verify webhook processing works
- [ ] Test email delivery (welcome email)
- [ ] Check all pages render correctly
- [ ] Test hackathon registration flow
- [ ] Verify RLS policies work (users can't access others' data)

### First Week:
- [ ] Monitor error rates
- [ ] Check slow query logs
- [ ] Review authentication logs
- [ ] Monitor Stripe events

---

## 🚨 What Happens If You Don't Rotate Keys

**If .env.local was ever committed**:
- API keys are in git history forever (even if deleted)
- Anyone with repo access can see old commits
- Keys could be used to:
  - Access your Stripe account
  - Read/modify your database
  - Send emails as you
  - Impersonate users

**Solution**: Rotate ALL keys, make repo private, never commit .env files

---

## ✅ Current Security Status

**Database**: ✅ Fully secured with RLS
**API Endpoints**: ✅ Using NextAuth authentication
**Payments**: ⚠️ Need production Stripe keys
**Repository**: ⚠️ Currently public (make private)
**Keys**: ⚠️ Need rotation if ever committed

**Overall**: Ready to launch after completing critical steps above

---

## Need Help?

**Rotate Keys**: Each service has docs for key rotation
**Stripe**: https://stripe.com/docs/keys#rotate-api-keys
**Supabase**: Dashboard → Settings → API → Generate new key
**GitHub OAuth**: Settings → Developer settings → OAuth Apps → Regenerate secret

**Questions?**: Check service documentation or open support ticket
