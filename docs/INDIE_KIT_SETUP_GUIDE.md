# Indie Kit Setup Guide - GitHub Auth Only (DevCard V2)

**Purpose**: Set up fresh Indie Kit with ONLY GitHub OAuth (remove email/password)
**Date**: 2025-11-10

---

## Step 1: Clone Fresh Indie Kit

```bash
# Navigate to your projects folder
cd ~/Documents/Websites/Devius

# Clone Indie Kit
git clone https://github.com/Indie-Kit/indie-kit.git devius-v2

# Enter directory
cd devius-v2

# Install dependencies
pnpm install
```

---

## Step 2: Environment Configuration

### Create `.env.local`

```bash
cp .env.example .env.local
```

### Configure Environment Variables

**Edit `.env.local`**:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Use your EXISTING Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://smguthhvxinfbrftnnzy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (IMPORTANT: Use Transaction mode - port 6543)
DATABASE_URL="postgresql://postgres.smguthhvxinfbrftnnzy:RoloRuby1989.@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"

# GitHub OAuth (Create NEW OAuth app for V2)
GITHUB_CLIENT_ID=your_new_client_id_here
GITHUB_CLIENT_SECRET=your_new_client_secret_here

# NextAuth Secret (generate new one)
AUTH_SECRET="run: npx auth secret"
AUTH_URL=http://localhost:3000

# Stripe (for premium features)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Step 3: Create New GitHub OAuth App

**Why new app?** Fresh start, separate from V1

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: Devius V2
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: `https://smguthhvxinfbrftnnzy.supabase.co/auth/v1/callback`
4. Click **"Register application"**
5. Copy **Client ID** and generate **Client Secret**
6. Add both to `.env.local`

**IMPORTANT**: Also add callback for local development:
- In GitHub app settings, add: `http://localhost:3000/auth/callback`

---

## Step 4: Configure Supabase GitHub Provider

1. Go to https://supabase.com/dashboard → Your Project
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** and click to configure
4. **Enable** the provider
5. Add your **GitHub Client ID** and **Client Secret** (from Step 3)
6. **Redirect URLs** (add both):
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/*` (wildcard for development)
7. Click **Save**

---

## Step 5: Remove Indie Kit's Default Auth

### 5.1: Delete Email/Password Auth Components

```bash
# Remove old auth files
rm -f src/components/auth/auth-form.tsx
rm -f src/components/auth/signup-form.tsx
rm -f src/components/auth/reset-password-form.tsx
```

### 5.2: Simplify Sign-In Page

**Edit `src/app/(auth)/sign-in/page.tsx`**:

Replace entire content with:

```typescript
'use client';

import { GitHubSignIn } from '@/components/auth/github-signin';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Devius
          </h1>
          <p className="text-gray-400">
            Create your developer card in seconds
          </p>
        </div>

        <GitHubSignIn redirectTo="/app" fullWidth />

        <p className="text-xs text-center text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
```

### 5.3: Create GitHub Sign-In Component

**Create `src/components/auth/github-signin.tsx`**:

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';

interface GitHubSignInProps {
  redirectTo?: string;
  fullWidth?: boolean;
}

export function GitHubSignIn({ redirectTo = '/app', fullWidth = false }: GitHubSignInProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          scopes: 'read:user user:email repo', // Need repo for reading repos
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('GitHub sign-in error:', err);
      setError(err.message || 'Failed to sign in with GitHub');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSignIn}
        disabled={loading}
        className={`
          bg-[#00FF88]
          hover:bg-[#00DD77]
          text-black
          font-semibold
          h-12
          ${fullWidth ? 'w-full' : ''}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Github className="mr-2 h-5 w-5" />
            Connect with GitHub
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
```

### 5.4: Configure Supabase Clients

**Verify `src/lib/supabase/client.ts` exists**:

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

import { useEffect, useState } from 'react';
```

**Verify `src/lib/supabase/server.ts` exists**:

```typescript
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can't set cookies
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
```

### 5.5: Update Middleware (proxy.ts)

**Edit `src/proxy.ts`** to add Supabase auth:

```typescript
import { NextResponse } from "next/server";
import { auth } from "./auth"; // NextAuth (can keep for backward compat)
import type { NextRequest } from "next/server";
import { createServerClient } from '@supabase/ssr';

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  // Supabase Auth - refresh session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh Supabase session
  await supabase.auth.getUser();

  // Protected routes
  const isAppRoute = req.nextUrl.pathname.startsWith('/app');
  const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in');

  if (isAppRoute) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  if (isAuthPage) {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.redirect(new URL('/app', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/app/:path*',
    '/sign-in',
    '/sign-out',
  ],
};
```

---

## Step 6: Install Required Dependencies

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# GitHub API
pnpm add @octokit/rest @octokit/plugin-paginate-rest @octokit/plugin-throttling

# Animations
pnpm add framer-motion

# QR Codes
pnpm add qrcode.react qrcode
pnpm add -D @types/qrcode

# Wallet Passes
pnpm add passkit-generator

# Already in Indie Kit (verify):
# - ShadCN components
# - TailwindCSS
# - Stripe SDK
```

---

## Step 7: Database Schema Setup

### 7.1: Create Migration File

**Create `migrations/001_devcard_v2_schema.sql`**:

```sql
-- DevCard V2 Database Schema
-- Clean schema for fresh start

-- ============================================================================
-- Profile Table (Main entity - profile IS the devcard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profile (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL UNIQUE,
  "memberNumber" SERIAL UNIQUE,

  -- Basic Info
  username TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  "avatarUrl" TEXT,
  "githubUsername" TEXT,
  "githubId" TEXT,

  -- User Customization
  headline TEXT, -- Max 160 chars
  bio TEXT, -- Max 160 chars
  location TEXT,
  website TEXT,

  -- GitHub Data (Auto-synced)
  "topLanguages" JSONB DEFAULT '[]',
  "featuredRepositories" JSONB DEFAULT '[]',
  "activityHighlights" JSONB,
  frameworks JSONB DEFAULT '[]',
  "developerFingerprint" TEXT,

  -- Customization
  theme JSONB DEFAULT '{"mode":"dark","accent":"#00FF88"}',
  "socialLinks" JSONB DEFAULT '{}',

  -- Social Stats
  "connectionCount" INTEGER DEFAULT 0,
  "profileViews" INTEGER DEFAULT 0,

  -- Premium
  "isPremium" BOOLEAN DEFAULT false,
  "premiumTier" TEXT,

  -- Wallet
  "qrCodeUrl" TEXT,
  "applePassUrl" TEXT,
  "googlePassUrl" TEXT,

  -- Privacy
  "isPublic" BOOLEAN DEFAULT true,
  "isActive" BOOLEAN DEFAULT true,

  -- Timestamps
  "githubSyncedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Set Dan as Member #1
INSERT INTO profile (id, "userId", username, slug, "memberNumber", "isPremium", "isPublic")
VALUES (
  gen_random_uuid(),
  'YOUR_SUPABASE_USER_ID', -- Replace with your actual ID
  'Danproc',
  'danproc',
  1,
  false,
  true
) ON CONFLICT ("userId") DO NOTHING;

-- Reset sequence to start from 2
SELECT setval(pg_get_serial_sequence('profile', 'memberNumber'), 1, true);

-- ============================================================================
-- Connection Request Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS connection_request (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "fromUserId" TEXT NOT NULL,
  "toUserId" TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("fromUserId", "toUserId")
);

-- ============================================================================
-- Connection Table (Accepted connections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS connection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user1Id" TEXT NOT NULL,
  "user2Id" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("user1Id", "user2Id"),
  CHECK ("user1Id" < "user2Id") -- Prevent duplicates
);

-- ============================================================================
-- Membership Table (Premium subscriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS membership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL, -- 'free', 'premium', 'lifetime'
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  status TEXT DEFAULT 'active',
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Notification Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL, -- 'connection_request', 'connection_accepted', 'profile_view'
  "fromUserId" TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get connection count for a user
CREATE OR REPLACE FUNCTION get_connection_count(user_id TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM connection
  WHERE "user1Id" = user_id OR "user2Id" = user_id;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles visible to all"
  ON profile FOR SELECT
  TO anon, authenticated
  USING ("isPublic" = true);

CREATE POLICY "Users can view own profile"
  ON profile FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own profile"
  ON profile FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- Connection request policies
CREATE POLICY "Users can view their requests"
  ON connection_request FOR SELECT
  TO authenticated
  USING ("fromUserId" = auth.uid()::text OR "toUserId" = auth.uid()::text);

CREATE POLICY "Users can create requests"
  ON connection_request FOR INSERT
  TO authenticated
  WITH CHECK ("fromUserId" = auth.uid()::text);

-- Connection policies
CREATE POLICY "Users can view connections"
  ON connection FOR SELECT
  TO authenticated
  USING ("user1Id" = auth.uid()::text OR "user2Id" = auth.uid()::text);

-- Notification policies
CREATE POLICY "Users can view own notifications"
  ON notification FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profile_username ON profile(username);
CREATE INDEX IF NOT EXISTS idx_profile_slug ON profile(slug);
CREATE INDEX IF NOT EXISTS idx_profile_member_number ON profile("memberNumber");

CREATE INDEX IF NOT EXISTS idx_connection_request_to ON connection_request("toUserId");
CREATE INDEX IF NOT EXISTS idx_connection_user1 ON connection("user1Id");
CREATE INDEX IF NOT EXISTS idx_connection_user2 ON connection("user2Id");

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification("userId");
CREATE INDEX IF NOT EXISTS idx_notification_read ON notification("userId", read);
```

### 7.2: Run Migration

**In Supabase SQL Editor**:
1. Copy the entire migration file
2. Paste into SQL Editor
3. **Replace `YOUR_SUPABASE_USER_ID`** with your actual Supabase user ID
4. Click **Run**

---

## Step 8: Remove Unused Indie Kit Features

### Files to Delete (Not Needed for DevCard)

```bash
# Remove credits system
rm -rf src/lib/credits
rm -rf src/app/(in-app)/app/credits

# Remove plan/subscription pages (you'll rebuild for DevCard)
rm -rf src/app/(in-app)/app/plan
rm -rf src/app/(in-app)/app/subscribe

# Remove LTD redemption
rm -rf src/app/(in-app)/app/redeem-ltd

# Remove old user hooks
rm -f src/lib/users/useUser.ts
rm -f src/lib/users/useCurrentPlan.ts
rm -f src/lib/users/useCredits.ts
```

---

## Step 9: Test Basic Setup

```bash
# Start dev server
pnpm dev
```

**Visit**: http://localhost:3000/sign-in

**You should see**:
- Clean sign-in page (black background)
- "Connect with GitHub" button (green)
- Click → GitHub OAuth starts

**After OAuth**:
- Should redirect to `/app`
- User authenticated via Supabase

---

## Step 10: Verify Everything Works

### Checklist

- [ ] Dev server starts without errors
- [ ] Sign-in page shows GitHub button only
- [ ] Click GitHub button → OAuth flow starts
- [ ] After auth → Redirects to /app
- [ ] Can access authenticated routes
- [ ] Database connection works (Transaction mode, no timeout)
- [ ] Supabase Auth session persists

---

## Common Issues & Fixes

### Issue: "Module not found: @supabase/ssr"

**Fix**:
```bash
pnpm add @supabase/ssr @supabase/supabase-js
```

### Issue: "GitHub OAuth callback error"

**Fix**:
- Verify callback URL in GitHub app matches Supabase project URL
- Check `.env.local` has correct CLIENT_ID and SECRET
- Add callback to Supabase redirect allowlist

### Issue: "Max clients reached"

**Fix**:
- Ensure DATABASE_URL uses port **6543** (not 5432)
- Restart Supabase if needed

### Issue: "Module not found: @/types/database"

**Fix**:
```bash
# Generate Supabase types
npx supabase gen types typescript --project-id smguthhvxinfbrftnnzy > src/types/database.ts
```

---

## Step 11: Ready for SpecKit!

**Your fresh Indie Kit is now configured with**:
- ✅ GitHub OAuth only (no email/password)
- ✅ Supabase integration
- ✅ Clean database schema
- ✅ Auth components ready
- ✅ No legacy code

**Next**:
1. Copy design PNGs to `docs/designs/`
2. Copy DESIGN_TOKENS.md to `docs/`
3. Run `/speckit.specify` with DEVCARD_V2_COMPLETE_SPEC.md content
4. Let web agents build it!

---

## Quick Reference Commands

```bash
# Start dev server
pnpm dev

# Generate Supabase types
npx supabase gen types typescript --project-id smguthhvxinfbrftnnzy > src/types/database.ts

# Run database migrations
# (Use Supabase SQL Editor - paste migration content)

# Install new package
pnpm add package-name

# Format code
pnpm format

# Type check
pnpm type-check
```

---

**You're ready to build DevCard V2 from scratch!** 🚀
