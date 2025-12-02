# Implementation Plan: Content Search

**Branch**: `001-content-search` | **Date**: 2025-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-content-search/spec.md`

## Summary

Implement client-side search functionality across all content collections (dramas, kpop, noticias, guias) using Pagefind. The search will provide real-time filtering, SEO-friendly results pages, and support for both Spanish and Korean text queries. Search index is generated at build time, keeping the site fully static while enabling instant search with lazy-loaded assets.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: Astro 5.x (SSG)
**Primary Dependencies**: Pagefind (search), astro-pagefind (integration)
**Storage**: Build-time generated search index (static files)
**Testing**: Playwright E2E
**Target Platform**: Web (Cloudflare Pages)
**Project Type**: Single project (Astro static site)
**Performance Goals**: Search results within 300ms, Lighthouse 90+
**Constraints**: <50KB gzipped JS budget, lazy-loaded search assets
**Scale/Scope**: ~50-100 articles initially, scaling to 500+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. SEO-First | Core Web Vitals passing, meta tags, SSG | PASS | Search page is SSG with dynamic hydration; meta tags reflect query |
| II. TDD | Tests before implementation | PASS | E2E tests for all user stories planned |
| III. Content Integrity | MDX + Zod schemas | PASS | Search reads from existing content collections |
| IV. Performance Budget | <50KB JS, Lighthouse 90+ | PASS | Pagefind ~15KB gzipped, lazy-loaded |
| V. Simplicity | Minimal dependencies, no over-engineering | PASS | Single dependency (Pagefind) with Astro integration |

**All gates pass. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-content-search/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output - search library research
├── data-model.md        # Phase 1 output - search entities
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - component interfaces
│   └── search-api.md    # Search component props and events
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── search/
│       ├── SearchInput.astro      # Header search field
│       ├── SearchResults.astro    # Results list component
│       ├── SearchFilters.astro    # Content type filter tabs
│       └── SearchResultCard.astro # Individual result display
├── pages/
│   └── buscar.astro               # Search results page at /buscar
└── styles/
    └── search.css                 # Search-specific styles (if needed)

tests/
└── e2e/
    ├── search-basic.spec.ts       # P1: Basic search tests
    ├── search-realtime.spec.ts    # P2: Real-time suggestion tests
    ├── search-filters.spec.ts     # P3: Filter tests
    └── search-seo.spec.ts         # P4: SEO/URL tests
```

**Structure Decision**: Using existing Astro single-project structure. Search components added to `src/components/search/`. Tests in `tests/e2e/` following TDD requirement.

## Complexity Tracking

No constitution violations. Implementation uses minimal dependencies and follows established patterns.
