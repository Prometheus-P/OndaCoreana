# Research: Supabase G.O Platform Integration

**Branch**: `001-supabase-go-platform` | **Date**: 2024-12-21

## 1. Astro 5.x Hybrid Mode Configuration

### Decision
Use Astro 5.x **static output mode with selective SSR** (previously called "hybrid").

### Rationale
- In Astro 5.0, `output: 'hybrid'` was removed - static mode now provides the same capability
- Pages default to pre-rendered (static); use `export const prerender = false` for SSR
- Maintains compatibility with existing Pagefind integration for static pages
- Dashboard/auth pages will be SSR; content pages remain static

### Configuration Pattern
```javascript
// astro.config.mjs
import node from '@astrojs/node';

export default defineConfig({
  // output: 'static' is DEFAULT in Astro 5.x - hybrid behavior automatic
  adapter: node({ mode: 'standalone' }),
});
```

### SSR Page Pattern
```astro
---
export const prerender = false;  // This page is server-rendered
---
```

### Alternatives Considered
- `output: 'server'` (all pages SSR) - rejected due to unnecessary server load for content pages
- Client-only auth - rejected due to security concerns (XSS exposure)

---

## 2. Supabase SSR Integration with Astro

### Decision
Use `@supabase/ssr` package with cookie-based session management.

### Rationale
- Official Supabase package for SSR frameworks
- Handles PKCE flow automatically
- httpOnly cookies prevent XSS token theft
- Type-safe database operations

### Client Configuration Pattern
```typescript
// src/lib/supabase.ts
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createServerSupabaseClient(cookies: AstroCookies, headers: Headers) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, {
              path: '/',
              secure: import.meta.env.PROD,
              httpOnly: true,
              sameSite: 'lax',
              maxAge: 604800, // 7 days
              ...options,
            })
          );
        },
      },
    }
  );
}
```

### Alternatives Considered
- `@supabase/supabase-js` only (no SSR helpers) - rejected, would require manual cookie handling
- localStorage for session storage - rejected due to XSS vulnerability

---

## 3. Magic Link Authentication Flow

### Decision
Implement PKCE-based Magic Link with `exchangeCodeForSession`.

### Rationale
- PKCE (Proof Key for Code Exchange) is the recommended secure flow
- Magic Links expire after 1 hour (configurable)
- Single-use tokens prevent replay attacks
- Rate limited by Supabase (1 per 60 seconds per email)

### Flow Pattern
1. User enters email → `signInWithOtp({ email, emailRedirectTo })`
2. Supabase sends Magic Link email
3. User clicks link → redirected to `/auth/callback?code=...`
4. Callback page → `exchangeCodeForSession(code)`
5. Session stored in httpOnly cookies → redirect to dashboard

### Callback Handler Pattern
```astro
---
// src/pages/auth/callback.astro
export const prerender = false;

const code = Astro.url.searchParams.get('code');
if (code) {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) return Astro.redirect('/dashboard');
}
return Astro.redirect('/auth/login?error=callback_failed');
---
```

---

## 4. Session Management (7-Day Expiration)

### Decision
Configure 7-day session with automatic refresh token rotation.

### Rationale
- Supabase access tokens expire in 1 hour (configurable)
- Refresh tokens are automatically rotated on each use
- Cookie maxAge set to 7 days aligns with session duration
- Middleware refreshes session on each request

### Configuration
- Supabase Dashboard → Authentication → Session Settings
- Set "Time-box user sessions" to 7 days (604800 seconds)
- Refresh token rotation enabled by default

### Middleware Pattern
```typescript
// src/middleware.ts
export const onRequest = defineMiddleware(async ({ cookies, request }, next) => {
  const supabase = createServerSupabaseClient(cookies, request.headers);

  // getUser() validates token and refreshes if needed
  const { data: { user } } = await supabase.auth.getUser();

  // Store user in locals for page access
  Astro.locals.user = user;
  Astro.locals.supabase = supabase;

  return next();
});
```

---

## 5. Rate Limiting for Magic Link

### Decision
Rely on Supabase default (1 per 60 seconds) + client-side feedback.

### Rationale
- Supabase enforces server-side rate limiting automatically
- Client-side feedback improves UX (shows countdown timer)
- 5-minute spec requirement exceeds Supabase default - implement client-side throttle
- CAPTCHA (Cloudflare Turnstile) available if abuse detected

### Implementation Pattern
```typescript
// Client-side throttle (5 minutes as per spec)
const THROTTLE_MS = 5 * 60 * 1000;
const lastRequest = localStorage.getItem(`magic_link_${email}`);
if (lastRequest && Date.now() - parseInt(lastRequest) < THROTTLE_MS) {
  throw new Error('Please wait before requesting another link');
}
```

### Alternatives Considered
- CAPTCHA on every request - rejected, adds friction for legitimate users
- No client-side throttle - rejected, poor UX when hitting server rate limit

---

## 6. Pagefind Compatibility

### Decision
Keep Pagefind for static content pages only; SSR pages excluded from search.

### Rationale
- Pagefind indexes HTML at build time - SSR pages not available
- Dashboard/auth pages don't need search indexing (noindex anyway)
- All content pages remain static, fully indexed
- No changes needed to Pagefind configuration

### Verification
- Existing content pages: static, indexed by Pagefind
- New SSR pages (`prerender = false`): not indexed, intentionally excluded

---

## 7. Database RLS Patterns

### Decision
Implement RLS policies matching spec requirements.

### Key Policies
| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | all users | auto (trigger) | own profile | - |
| group_orders | non-draft OR own | authenticated | organizer only | organizer (draft/cancelled) |
| participations | participant OR organizer | authenticated (open orders) | own | own (unpaid) |
| reviews | all | participant (completed orders) | - | - |
| notifications | own | - | own | - |

### Trust Score Trigger
```sql
-- Increment trust_score when group_order status changes to 'completed'
CREATE OR REPLACE FUNCTION increment_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles SET trust_score = trust_score + 1
    WHERE id = NEW.organizer_id;

    UPDATE profiles SET trust_score = trust_score + 1
    WHERE id IN (
      SELECT user_id FROM participations
      WHERE group_order_id = NEW.id AND status = 'fulfilled'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Summary: Key Technical Decisions

| Area | Decision | Justification |
|------|----------|---------------|
| Astro Output | static + selective SSR | Maintains performance for content |
| Session Storage | httpOnly cookies | Security against XSS |
| Session Duration | 7 days | User convenience balanced with security |
| Auth Method | Magic Link + PKCE | Passwordless, secure |
| Rate Limit | 5min client + Supabase server | Spec requirement + abuse prevention |
| Search | Pagefind (static only) | Existing integration preserved |
| Database | Supabase PostgreSQL + RLS | Row-level security built-in |
