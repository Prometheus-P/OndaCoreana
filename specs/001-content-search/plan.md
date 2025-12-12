# Implementation Plan: Content Search

**Branch**: `001-content-search` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-content-search/spec.md`

## Summary

Deliver a unified search experience across all OndaCoreana collections by integrating Pagefind for client-side indexing, building custom Astro components for search input/results/filters, and exposing results at `/buscar` with SEO-friendly URLs. Real-time suggestions are powered by Pagefind’s incremental search API, while a lightweight service worker caches previously loaded search assets and index chunks so searches keep working offline. Robust empty/error handling includes inline retry controls when the index fails to load and clear guidance for short or overly long queries.

## Technical Context

**Language/Version**: TypeScript 5.x, Astro 5.16  
**Primary Dependencies**: `astro-pagefind`, `pagefind`, Tailwind CSS utilities, optional `workbox-window` for service worker registration  
**Storage**: Static Pagefind index generated at build time (no runtime DB)  
**Testing**: `pnpm test` suite (content/build/SEO) plus Playwright specs under `tests/e2e/search-*.spec.ts`  
**Target Platform**: Static Astro site deployed to Cloudflare Pages (SSG)  
**Project Type**: Single web project with shared components/layouts  
**Performance Goals**: Search results render <1s after submit, realtime suggestions respond <300 ms after typing pause, Lighthouse ≥90 on `/buscar`, ≤50 KB gzipped JS budget for search bundle  
**Constraints**: SEO-first (SSG pages, canonical tags), offline-capable search for visited content, lazy-loaded assets, exclude drafts, Unicode (es + ko) support, inline retry on index failures  
**Scale/Scope**: 50–100 articles initially (goal 500), four collections (`dramas`, `kpop`, `noticias`, `guias`), index regenerated at build

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. SEO-First Development | Static, indexable `/buscar` with canonical/meta per query | ✅ PASS | `/buscar` rendered via Astro + hydrated client search |
| II. TDD Discipline | Tests precede implementation | ✅ PASS | Plan includes Playwright specs for P1–P4 flows |
| III. Content Integrity | Respect MDX/Zod schemas, exclude drafts | ✅ PASS | Pagefind reads published content only |
| IV. Performance Budget | <50 KB JS, Lighthouse ≥90 | ✅ PASS | Pagefind ~15 KB gzipped + lazy load; service worker added carefully |
| V. Simplicity/YAGNI | Minimal deps, avoid backend | ✅ PASS | Pagefind + small SW; no extra services |

## Project Structure

### Documentation (this feature)

```text
specs/001-content-search/
├── plan.md              # Implementation plan (this file)
├── research.md          # Search tool evaluation & rationale
├── data-model.md        # Entities, validation, state diagram
├── quickstart.md        # Dev setup + testing guide
├── contracts/
│   └── search-api.md    # Component/event contracts for search UI
└── tasks.md             # Output of /speckit.tasks (next step)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── search/
│       ├── SearchInput.astro        # Header input + realtime suggestions
│       ├── SearchFilters.astro      # Content-type tabs (Todos, Dramas, etc.)
│       ├── SearchResults.astro      # Manages querying Pagefind + infinite load
│       ├── SearchResultCard.astro   # Excerpt/title/date display
│       └── SearchStatus.astro       # Empty/error/loading states (new)
├── layouts/
│   └── BaseLayout.astro             # Hosts global search input slot
├── pages/
│   └── buscar.astro                 # SEO-friendly search results page
├── scripts/
│   └── register-sw.ts               # Client bootstrap for service worker
├── service-worker.ts                # Caches pagefind assets + last queries
└── styles/
    └── search.css                   # Optional component-specific styles

public/
├── pagefind/                        # Generated search index assets (build)
└── icons/search.svg                 # Search UI icons (if needed)

tests/
└── e2e/
    ├── search-basic.spec.ts         # P1 flows: cross-collection results
    ├── search-realtime.spec.ts      # P2 flows: realtime suggestions
    ├── search-filters.spec.ts       # P3 flows: filter tab behavior
    └── search-seo.spec.ts           # P4 flows: URL/meta/canonical + share links
```

**Structure Decision**: Continue single Astro project; add dedicated `src/components/search` module cluster, `service-worker.ts` for offline caching, and targeted E2E specs for each user story to keep responsibilities isolated and testable.

## Complexity Tracking

No constitution violations or extra complexity beyond approved dependencies; no entry required.
