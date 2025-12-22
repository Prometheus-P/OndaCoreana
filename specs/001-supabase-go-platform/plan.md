# Implementation Plan: Supabase G.O Platform Integration

**Branch**: `001-supabase-go-platform` | **Date**: 2024-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-supabase-go-platform/spec.md`

## Summary

OndaCoreana를 정적 미디어 사이트에서 K-Culture 공동구매(G.O) 플랫폼으로 전환. Supabase 백엔드 통합, Magic Link 인증, 사용자 대시보드, 5개 테이블 DB 스키마 구축.

## Technical Context

**Language/Version**: TypeScript 5.x, Astro 5.16.1
**Primary Dependencies**: @supabase/supabase-js, @supabase/ssr, @astrojs/node (existing)
**Storage**: Supabase (PostgreSQL) with Row Level Security
**Testing**: Playwright (existing), manual SQL migration testing
**Target Platform**: Web (Cloudflare Pages compatible Node.js runtime)
**Project Type**: Web application (Astro hybrid SSG/SSR)
**Performance Goals**: Dashboard load <2s, Lighthouse 90+ on static pages
**Constraints**: 7-day session, 5min rate limit, 375px+ mobile support
**Scale/Scope**: LATAM K-Culture fans, 5 DB tables, 3 SSR pages (auth/dashboard)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static-First (SSG) | ⚠️ VIOLATION | Hybrid mode required for auth/dashboard. Existing content pages remain static. |
| II. SEO Excellence | ✅ PASS | Dashboard/auth pages use noindex. Static content unaffected. |
| III. Spanish-First Content | ✅ PASS | All UI in Spanish. |
| IV. Existing Stack Only | ⚠️ JUSTIFIED | @supabase/supabase-js, @supabase/ssr are essential for backend integration. |
| V. Mobile-Responsive | ✅ PASS | Dashboard designed for 375px+, 44px touch targets. |

### Quality Gates

| Gate | Status | Notes |
|------|--------|-------|
| `pnpm build` | ✅ Expected PASS | Hybrid mode builds successfully |
| `pnpm test:e2e` | ✅ Expected PASS | Auth flow tests to be added |
| Lighthouse 90+ | ✅ Expected PASS | Only static pages measured |

## Complexity Tracking

> **Constitution violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Hybrid SSR (violates Static-First) | User authentication requires server-side session management. Magic Link callback must exchange tokens securely. Dashboard must fetch user-specific data. | Client-only auth would expose tokens in localStorage, making XSS attacks critical. Static pages cannot personalize content. |
| New npm packages (@supabase/*) | Supabase is the chosen backend. Official SDK provides type safety, auth handling, RLS integration. | Raw fetch() would require reimplementing auth, session refresh, cookie management - error-prone and insecure. |

**Constitution Amendment Required**: Principle I needs amendment to allow SSR for authenticated routes while maintaining static-first for public content.

## Project Structure

### Documentation (this feature)

```text
specs/001-supabase-go-platform/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI spec
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── supabase.ts           # Supabase client (browser + server)
├── types/
│   └── supabase.ts           # Generated database types
├── middleware.ts             # Auth session middleware
├── pages/
│   ├── auth/
│   │   ├── login.astro       # Magic Link login (SSR)
│   │   ├── callback.astro    # Auth callback (SSR)
│   │   └── logout.ts         # Logout endpoint
│   └── dashboard/
│       └── index.astro       # User dashboard (SSR)
└── env.d.ts                  # Locals type definitions (modify)

supabase/
└── migrations/
    └── 20241221000000_init_go_platform.sql  # Full schema

# Config files to modify
astro.config.mjs              # Switch to hybrid mode
.env.example                  # Add Supabase env vars
```

**Structure Decision**: Follows existing Astro project structure. New files integrate into existing `src/lib/`, `src/types/`, `src/pages/` directories. Database migrations in new `supabase/` directory.
