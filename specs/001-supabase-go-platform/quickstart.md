# Quickstart: Supabase G.O Platform

**Branch**: `001-supabase-go-platform` | **Date**: 2024-12-21

## Prerequisites

1. **Supabase Project**: Already created at [database.new](https://database.new)
2. **Node.js**: v18+ (required by Astro 5.x)
3. **pnpm**: Package manager

## Setup Steps

### 1. Install Dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 2. Configure Environment Variables

Copy to `.env`:

```bash
PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Get these from: Supabase Dashboard → Project Settings → API

### 3. Apply Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20241221000000_init_go_platform.sql`
3. Run the SQL

Or use Supabase CLI:
```bash
npx supabase db push
```

### 4. Configure Supabase Auth

In Supabase Dashboard → Authentication:

1. **Providers** → Enable Email
2. **URL Configuration**:
   - Site URL: `https://ondacoreana.com` (or `http://localhost:4321`)
   - Redirect URLs: Add `/auth/callback`
3. **Email Templates** → Customize Magic Link email (Spanish)
4. **Settings** → Session Settings:
   - Set inactivity timeout to 7 days (604800 seconds)

### 5. Run Development Server

```bash
pnpm dev
```

Visit: http://localhost:4321/auth/login

## Verification Checklist

- [ ] Login page renders at `/auth/login`
- [ ] Magic Link email is received
- [ ] Callback redirects to `/dashboard`
- [ ] Dashboard shows user info
- [ ] Logout clears session
- [ ] Protected routes redirect to login

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client (browser + server) |
| `src/middleware.ts` | Auth session middleware |
| `src/pages/auth/login.astro` | Magic Link login page |
| `src/pages/auth/callback.astro` | Auth callback handler |
| `src/pages/dashboard/index.astro` | User dashboard |

## Common Issues

### "Missing Supabase environment variables"
Ensure `.env` has `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.

### Magic Link email not received
- Check spam folder
- Verify email provider is configured in Supabase
- Default SMTP has 2 emails/hour limit - configure custom SMTP for production

### Session not persisting
- Ensure cookies are httpOnly and secure in production
- Check browser console for cookie errors
- Verify middleware is running (`src/middleware.ts`)

### "Profile not found" after login
- Check that `handle_new_user` trigger is created
- Manually insert profile if testing with existing user:
```sql
INSERT INTO profiles (id, display_name, locale)
VALUES ('user-uuid-here', 'Test User', 'es');
```
