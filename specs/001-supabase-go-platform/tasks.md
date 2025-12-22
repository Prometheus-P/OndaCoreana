# Tasks: Supabase G.O Platform Integration

**Input**: Design documents from `/specs/001-supabase-go-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Manual testing via quickstart.md verification.

**Organization**: Tasks grouped by user story to enable independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5)
- Exact file paths included

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure environment

- [x] T001 Install Supabase packages: `pnpm add @supabase/supabase-js @supabase/ssr`
- [x] T002 [P] Add Supabase environment variables to `.env.example`
- [x] T003 [P] Create `supabase/` directory for migrations

---

## Phase 2: Foundational (Database Schema - US3)

**Purpose**: Deploy database schema - BLOCKS all other user stories

**⚠️ CRITICAL**: No auth or dashboard work can begin until this phase is complete

**Goal**: 5 tables with RLS policies, triggers, and indexes deployed to Supabase

**Independent Test**: Run migration in Supabase SQL Editor, verify all tables created with `\dt` equivalent

- [x] T004 [US3] Create migration file `supabase/migrations/20241221000000_init_go_platform.sql`
- [x] T005 [US3] Add profiles table with auto-create trigger from auth.users
- [x] T006 [US3] Add group_orders table with status enum and constraints
- [x] T007 [US3] Add participations table with quantity update trigger
- [x] T008 [US3] Add reviews table with rating constraints
- [x] T009 [US3] Add notifications table with unread index
- [x] T010 [US3] Add RLS policies for all 5 tables
- [x] T011 [US3] Add trust_score increment trigger on order completion
- [x] T012 [US3] Add updated_at trigger function for profiles and group_orders

**Checkpoint**: Database schema deployed - Supabase client integration can begin

---

## Phase 3: Astro Hybrid Mode (US4)

**Purpose**: Enable SSR for auth/dashboard pages while keeping content static

**Goal**: Astro configured in hybrid mode with Node adapter

**Independent Test**: `pnpm build` succeeds, static pages generate HTML, Pagefind works

- [x] T013 [US4] Modify `astro.config.mjs` to use hybrid mode (remove conditional output)
- [x] T014 [US4] Import `@astrojs/node` adapter unconditionally in `astro.config.mjs`
- [x] T015 [US4] Verify Pagefind integration still works in hybrid mode
- [x] T016 [US4] Verify Keystatic CMS mode (`KEYSTATIC_CMS=true`) still works

**Checkpoint**: Hybrid mode configured - SSR pages can now be created

---

## Phase 4: Supabase Client Integration (US5)

**Purpose**: Create Supabase clients for browser and server-side use

**Goal**: Type-safe Supabase clients with cookie-based session management

**Independent Test**: Import client, make test query, verify TypeScript autocomplete works

- [x] T017 [P] [US5] Create TypeScript types file `src/types/supabase.ts` (manual types for now)
- [x] T018 [P] [US5] Create Supabase client library `src/lib/supabase.ts`
- [x] T019 [US5] Implement `createServerSupabaseClient()` with cookie handling in `src/lib/supabase.ts`
- [x] T020 [US5] Implement `createBrowserSupabaseClient()` for React islands in `src/lib/supabase.ts`
- [x] T021 [US5] Add environment variable validation with clear error messages in `src/lib/supabase.ts`
- [x] T022 [US5] Update `src/env.d.ts` to add Locals interface (user, supabase)

**Checkpoint**: Supabase clients ready - Auth flow can now be implemented

---

## Phase 5: Passwordless Authentication (US1)

**Purpose**: Implement Magic Link authentication flow

**Goal**: Users can login via email Magic Link, session persists 7 days

**Independent Test**:
1. Visit `/auth/login`, enter email, receive Magic Link
2. Click link, redirected to `/dashboard`
3. Session persists across browser restart
4. Logout clears session

### Middleware

- [x] T023 [US1] Create auth middleware `src/middleware.ts`
- [x] T024 [US1] Implement session refresh on each request in `src/middleware.ts`
- [x] T025 [US1] Add protected routes list (dashboard, go) in `src/middleware.ts`
- [x] T026 [US1] Implement redirect to login with return URL in `src/middleware.ts`

### Login Page

- [x] T027 [US1] Create login page `src/pages/auth/login.astro` with `prerender = false`
- [x] T028 [US1] Add email input form with Spanish labels in `src/pages/auth/login.astro`
- [x] T029 [US1] Implement Magic Link request with `signInWithOtp()` in `src/pages/auth/login.astro`
- [x] T030 [US1] Add 5-minute rate limit feedback (client-side) in `src/pages/auth/login.astro`
- [x] T031 [US1] Add success message after Magic Link sent in `src/pages/auth/login.astro`
- [x] T032 [US1] Add error handling for rate limit and invalid email in `src/pages/auth/login.astro`

### Callback Handler

- [x] T033 [US1] Create callback page `src/pages/auth/callback.astro` with `prerender = false`
- [x] T034 [US1] Implement PKCE code exchange with `exchangeCodeForSession()` in `src/pages/auth/callback.astro`
- [x] T035 [US1] Handle success redirect to dashboard in `src/pages/auth/callback.astro`
- [x] T036 [US1] Handle error redirect to login with error param in `src/pages/auth/callback.astro`

### Logout

- [x] T037 [US1] Create logout endpoint `src/pages/auth/logout.ts`
- [x] T038 [US1] Implement session signOut and cookie clearing in `src/pages/auth/logout.ts`
- [x] T039 [US1] Support both GET and POST methods for logout flexibility

**Checkpoint**: Auth flow complete - Users can login, persist session, logout

---

## Phase 6: User Dashboard (US2)

**Purpose**: Display user profile and activity overview

**Goal**: Authenticated users see profile, organized orders, participations

**Independent Test**: Login, navigate to `/dashboard`, see display name, orders lists, notifications count

### Dashboard Page

- [x] T040 [US2] Create dashboard page `src/pages/dashboard/index.astro` with `prerender = false`
- [x] T041 [US2] Fetch user profile from Supabase in `src/pages/dashboard/index.astro`
- [x] T042 [US2] Display user display_name and profile summary in `src/pages/dashboard/index.astro`
- [x] T043 [US2] Fetch and display organized group_orders list in `src/pages/dashboard/index.astro`
- [x] T044 [US2] Fetch and display participations list with order details in `src/pages/dashboard/index.astro`
- [x] T045 [US2] Fetch and display unread notifications count in `src/pages/dashboard/index.astro`
- [x] T046 [US2] Add status labels with color coding (Spanish) in `src/pages/dashboard/index.astro`

### Quick Actions

- [x] T047 [US2] Add quick action cards (create order, explore, profile) in `src/pages/dashboard/index.astro`
- [x] T048 [US2] Add logout button with link to `/auth/logout` in `src/pages/dashboard/index.astro`

### Styling

- [x] T049 [P] [US2] Apply Tailwind responsive styles (375px+, 44px touch targets) in `src/pages/dashboard/index.astro`
- [x] T050 [P] [US2] Use existing design system variables (--md-color-*, --md-spacing-*) in `src/pages/dashboard/index.astro`

**Checkpoint**: Dashboard complete - Full auth + dashboard flow working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T051 Run `pnpm build` and verify 0 TypeScript errors
- [x] T052 Run `pnpm test:e2e` to verify existing tests still pass (pre-existing navigation test failures unrelated to this feature)
- [ ] T053 [P] Test Lighthouse score on static content pages (should remain 90+) - MANUAL
- [ ] T054 [P] Test mobile responsiveness on 375px viewport - MANUAL
- [ ] T055 Verify session persists across browser restart (7-day cookie) - MANUAL
- [ ] T056 Manual test full flow per quickstart.md verification checklist - MANUAL
- [ ] T057 Update constitution.md to allow SSR for authenticated routes (if not done) - OPTIONAL

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (DB Schema - US3) ← CRITICAL BLOCKER
    ↓
Phase 3 (Hybrid Mode - US4) ←──┬──→ Phase 4 (Supabase Client - US5)
                                │
                                ↓
                    Phase 5 (Auth - US1)
                                ↓
                    Phase 6 (Dashboard - US2)
                                ↓
                    Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US3 (DB Schema) | Setup only | - |
| US4 (Hybrid Mode) | US3 | US5 |
| US5 (Supabase Client) | US3 | US4 |
| US1 (Auth) | US3, US4, US5 | - |
| US2 (Dashboard) | US1 | - |

### Parallel Opportunities

**Within Phase 1:**
- T002 and T003 can run in parallel

**Within Phase 4 (US5):**
- T017 and T018 can run in parallel (different files)

**Within Phase 6 (US2):**
- T049 and T050 can run in parallel (styling tasks)

**Within Phase 7:**
- T053 and T054 can run in parallel (different test types)

---

## Parallel Example: Phase 4 (Supabase Client)

```bash
# Launch in parallel:
Task: "Create TypeScript types file src/types/supabase.ts"
Task: "Create Supabase client library src/lib/supabase.ts"

# Then sequentially:
Task: "Implement createServerSupabaseClient() with cookie handling"
Task: "Implement createBrowserSupabaseClient() for React islands"
```

---

## Implementation Strategy

### MVP First (US3 + US4 + US5 + US1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Database Schema (US3)
3. Complete Phase 3: Hybrid Mode (US4)
4. Complete Phase 4: Supabase Client (US5)
5. Complete Phase 5: Auth (US1)
6. **STOP and VALIDATE**: Test full auth flow independently
7. Deploy/demo if ready

**MVP Deliverable**: Users can login via Magic Link and see a minimal authenticated page

### Full Feature (Add US2)

1. Complete MVP (above)
2. Complete Phase 6: Dashboard (US2)
3. Complete Phase 7: Polish
4. Full feature complete

---

## Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 3 | 2 |
| 2 | US3 (DB Schema) | 9 | 0 |
| 3 | US4 (Hybrid Mode) | 4 | 0 |
| 4 | US5 (Supabase Client) | 6 | 2 |
| 5 | US1 (Auth) | 17 | 0 |
| 6 | US2 (Dashboard) | 11 | 2 |
| 7 | Polish | 7 | 2 |
| **Total** | | **57** | **8** |

---

## Notes

- All UI text in Spanish (Constitution III)
- Mobile-first: 375px+, 44px touch targets (Constitution V)
- SSR pages: login, callback, dashboard (Constitution I violation - justified)
- New packages: @supabase/supabase-js, @supabase/ssr (Constitution IV violation - justified)
- Commit after each logical task group
- Stop at any checkpoint to validate independently
