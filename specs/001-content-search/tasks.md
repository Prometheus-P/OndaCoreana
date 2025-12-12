# Tasks: Content Search

**Input**: Design documents from `/specs/001-content-search/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Each user story includes a Playwright E2E spec to honor the TDD workflow described in the spec (tests fail before implementation).

**Organization**: Tasks are grouped by user story to keep increments independently testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and configure the tooling required for Pagefind search and offline caching.

- [ ] T001 Update `package.json` to add `astro-pagefind`, `pagefind`, and `workbox-window` devDependencies for search and service worker support.
- [ ] T002 Configure `astro.config.mjs` to register the `astro-pagefind` integration (last in the list) and expose `/buscar` route options needed for SEO.
- [ ] T003 Create `src/scripts/register-sw.ts` bootstrap that registers `/service-worker.js` when the search UI mounts (import placeholder into `src/layouts/BaseLayout.astro` but keep registration disabled until SW exists).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure published content is indexable, search assets can be cached, and the `/buscar` page skeleton exists before implementing user stories.

- [ ] T004 Annotate `src/layouts/ArticleLayout.astro` with `data-pagefind-body` plus metadata (`data-pagefind-meta="title|description|contentType|pubDate|heroImage"`) so Pagefind indexes all collections.
- [ ] T005 Add `data-pagefind-ignore` wrappers to navigation/footer fragments inside `src/layouts/BaseLayout.astro` to keep chrome from polluting the index.
- [ ] T006 Scaffold `src/pages/buscar.astro` with `BaseLayout`, query parameter extraction, and placeholder slots for results, filters, and SEO meta tags.
- [ ] T007 Create root-level `service-worker.ts` that caches Pagefind assets (`/pagefind/*`) and recent article HTML, building to `public/service-worker.js`.
- [ ] T008 Wire `src/layouts/BaseLayout.astro` to import the SW bootstrap from Phase 1 and gate registration so it activates only on client navigation (fulfills offline search prerequisite).

**Checkpoint**: Pagefind is integrated, the site builds with an index, and `/buscar` renders a stubbed page ready for user stories.

---

## Phase 3: User Story 1 – Basic Content Search (Priority: P1) 🎯 MVP

**Goal**: Visitors can submit a query from any page, land on `/buscar`, and see cross-collection results with title, excerpt (~160 chars), type, and date plus helpful empty/error states.

**Independent Test**: Run `pnpm test:e2e tests/e2e/search-basic.spec.ts` to ensure a query such as “BTS” returns matching dramas/kpop/noticias/guias, shows counts, and surfaces friendly no-results messaging.

### Tests (Write First)

- [ ] T009 [P] [US1] Author failing Playwright spec `tests/e2e/search-basic.spec.ts` covering query submission, mixed-collection results, empty state, and draft exclusion.

### Implementation

- [ ] T010 [P] [US1] Build `src/components/search/SearchResultCard.astro` to render title, excerpt (truncate to 160 chars), type chip, date, hero image, and link.
- [ ] T011 [P] [US1] Implement `src/components/search/SearchResults.astro` to read `q` from the router, invoke Pagefind search, paginate (10 initial + “load more”), and emit total counts.
- [ ] T012 [P] [US1] Implement `src/components/search/SearchStatus.astro` for shared loading, empty, and index-error states (includes retry CTA text from spec).
- [ ] T013 [P] [US1] Create `src/components/search/SearchInput.astro` containing the header input, guidance for <2 characters, and query normalization/truncation logic.
- [ ] T014 [US1] Update `src/layouts/BaseLayout.astro` to inject `SearchInput` into the nav so the search field is accessible on every page and routes to `/buscar`.
- [ ] T015 [US1] Flesh out `src/pages/buscar.astro` to assemble `SearchResults`, `SearchStatus`, and `SearchResultCard`, display query + count, and ensure draft content is excluded.
- [ ] T016 [US1] Add Tailwind utility styles or scoped `src/styles/search.css` rules referenced by the new components (cards grid, badges, responsive spacing).

**Checkpoint**: Manual search and Playwright US1 spec both pass; `/buscar?q=term` share links render identical results.

---

## Phase 4: User Story 2 – Real-Time Search Suggestions (Priority: P2)

**Goal**: Typing ≥2 characters in the header input surfaces instant suggestions (sub-300 ms) without requiring submit; clicking a suggestion navigates to the article.

**Independent Test**: Run `pnpm test:e2e tests/e2e/search-realtime.spec.ts` to validate live suggestion updates and navigation.

### Tests (Write First)

- [ ] T017 [P] [US2] Create Playwright spec `tests/e2e/search-realtime.spec.ts` that types partial terms, asserts suggestion latency, and verifies clicking suggestions opens detail pages.

### Implementation

- [ ] T018 [P] [US2] Extend `src/components/search/SearchInput.astro` with debounced Pagefind lookups, drop-down suggestion list, and keyboard navigation (Arrow/Enter/Escape).
- [ ] T019 [US2] Introduce `src/components/search/search-store.ts` (or similar) to share live query state between the header input and `/buscar` results without full page reloads.
- [ ] T020 [US2] Update `src/components/search/SearchResults.astro` to subscribe to the shared store so results repaint instantly as the query updates in real time.
- [ ] T021 [US2] Add accessibility hooks (ARIA roles, focus trapping) and ensure the suggestion list closes on blur or escape within `SearchInput.astro`.

**Checkpoint**: Suggestions appear instantly, are accessible, and Playwright US2 spec passes.

---

## Phase 5: User Story 3 – Filter by Content Type (Priority: P3)

**Goal**: Visitors can narrow search results to Dramas, K-Pop, Noticias, or Guías using filter tabs; filters sync with the URL (`filter=` param) and persist on reload/share.

**Independent Test**: Run `pnpm test:e2e tests/e2e/search-filters.spec.ts` to confirm filters limit results, “Todos” resets, and no-results messaging references the active filter.

### Tests (Write First)

- [ ] T022 [P] [US3] Add Playwright spec `tests/e2e/search-filters.spec.ts` covering filter toggling, persistence via URL params, and zero-results per filter messaging.

### Implementation

- [ ] T023 [P] [US3] Implement `src/components/search/SearchFilters.astro` with Tailwind-styled pill tabs for Todos/Dramas/K-Pop/Noticias/Guías and emit filter change events.
- [ ] T024 [US3] Update `src/components/search/SearchResults.astro` to apply Pagefind filters, display filter chips on each card, and update counts per filter.
- [ ] T025 [US3] Enhance `src/pages/buscar.astro` to sync `filter` query params with the filter component (including default “all”) and ensure shareable URLs reproduce the filtered view.

**Checkpoint**: Filter UX is stable, shareable, and Playwright US3 spec passes.

---

## Phase 6: User Story 4 – SEO-Friendly Search Results Page (Priority: P4)

**Goal**: `/buscar` renders with dynamic meta tags (title/description/canonical/OG/Twitter) that include the query, works when loaded via bookmark/share, and exposes structured data.

**Independent Test**: Run `pnpm test:e2e tests/e2e/search-seo.spec.ts` to verify meta tags, canonical URLs, JSON-LD, and share-link parity.

### Tests (Write First)

- [ ] T026 [P] [US4] Create Playwright spec `tests/e2e/search-seo.spec.ts` asserting SEO tags adapt per query, canonical URLs include encoded `q`, and direct navigation pre-populates results.

### Implementation

- [ ] T027 [US4] Update `src/pages/buscar.astro` (and/or `src/components/seo/SEOHead.astro`) to compute dynamic `<title>`, `<meta name="description">`, OG/Twitter tags, and canonical URL reflecting `q` + `filter`.
- [ ] T028 [US4] Inject structured data via `src/components/seo/JsonLd.astro` describing the `SearchAction` schema and include share buttons referencing `window.location.href`.
- [ ] T029 [US4] Ensure `SearchResults.astro` hydrates with initial query values passed from Astro so server-rendered HTML matches the first load (avoids CLS/SEO penalties).

**Checkpoint**: `/buscar?q=term` is indexable, meta tags validated, and Playwright US4 spec passes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize offline behavior, documentation, and quality checks across all stories.

- [ ] T030 [P] Update `service-worker.ts` to cache Pagefind chunks, `SearchResultCard` assets, and previously visited article HTML; display “Contenido no disponible sin conexión” when cache miss occurs offline.
- [ ] T031 [P] Document realtime search usage, offline expectations, and troubleshooting in `specs/001-content-search/quickstart.md` and `README.md` search sections.
- [ ] T032 Run `pnpm test && pnpm test:e2e tests/e2e/search-*.spec.ts && pnpm build` to ensure all stories and SEO/build validations pass before release.

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Setup must complete before foundational work because Pagefind deps/config are required to build the index.
2. **Phase 2 → User Stories**: Foundational annotations, SW scaffolding, and `/buscar` skeleton must exist before any user story (P1–P4) starts.
3. **User Story Order**: Implement sequentially by priority (US1 → US2 → US3 → US4). Stories can run in parallel only after Phase 2, provided shared files aren’t touched simultaneously.
4. **Polish Phase**: Runs after desired stories finish; focuses on offline caching hardening, docs, and regression runs.

---

## Parallel Execution Opportunities

- Tasks marked `[P]` operate on distinct files and can be parallelized (e.g., T010/T011/T012 during US1, or the various test specs per story).
- Different user stories can be implemented in parallel after Phase 2 if coordination on shared files (`SearchResults.astro`, `/buscar.astro`) is managed via branching.

---

## Implementation Strategy

1. **MVP Scope**: Deliver Phase 1 → Phase 3 (US1). This unlocks baseline search and satisfies the primary user value; stop here for initial release if needed.
2. **Incremental Enhancements**: Layer US2 (real-time), US3 (filters), and US4 (SEO polish) sequentially, validating via their Playwright specs.
3. **Quality Gate**: After each story, rerun its spec plus regression `pnpm test` before moving on.
4. **Offline & Docs**: Complete the Polish phase last so offline caching logic and documentation capture the final feature set.
