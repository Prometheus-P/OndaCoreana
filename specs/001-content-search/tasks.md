# Tasks: Content Search

**Input**: Design documents from `/specs/001-content-search/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/search-api.md, research.md, quickstart.md

**Tests**: E2E tests using Playwright are REQUIRED per constitution (TDD mandate).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow existing Astro structure per plan.md

---

## Phase 1: Setup

**Purpose**: Install dependencies and configure Pagefind integration

- [x] T001 Install Pagefind dependencies: `pnpm add -D astro-pagefind pagefind`
- [x] T002 Add Pagefind integration to astro.config.mjs (must be LAST integration)
- [x] T003 [P] Create search components directory at src/components/search/
- [x] T004 [P] Create E2E test directory at tests/e2e/ if not exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content indexing infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add data-pagefind-body attribute to ArticleLayout.astro for content indexing
- [x] T006 Add data-pagefind-meta attributes for title, description, contentType, pubDate in ArticleLayout.astro
- [x] T007 [P] Add data-pagefind-ignore to navigation, footer, and sidebar elements in BaseLayout.astro
- [x] T008 [P] Create ContentType enum type in src/types/search.ts
- [x] T009 [P] Create SearchResult interface in src/types/search.ts
- [x] T010 [P] Create SearchResultSet interface in src/types/search.ts
- [x] T011 Build site and verify Pagefind index is generated in dist/pagefind/ (verify no draft content indexed per FR-007)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Basic Content Search (Priority: P1)

**Goal**: Visitors can search for content and see results on a dedicated page

**Independent Test**: Enter a search query and verify matching results appear from all collections

### Tests for User Story 1 (TDD - Write First, Must Fail)

- [x] T012 [P] [US1] Create E2E test file at tests/e2e/search-basic.spec.ts
- [x] T013 [US1] Write test: search form submission navigates to /buscar with query param
- [x] T014 [US1] Write test: search results page displays matching articles with title, type, excerpt, date
- [x] T015 [US1] Write test: "no results" message appears for queries with no matches
- [x] T016 [US1] Run tests and verify they FAIL (Red phase)

### Implementation for User Story 1

- [x] T017 [P] [US1] Create SearchResultCard.astro component in src/components/search/SearchResultCard.astro
- [x] T018 [P] [US1] Create SearchResults.astro component in src/components/search/SearchResults.astro
- [x] T019 [US1] Create SearchInput.astro component (basic version, submit only) in src/components/search/SearchInput.astro
- [x] T020 [US1] Create /buscar page at src/pages/buscar.astro with search results display
- [x] T021 [US1] Add SearchInput component to BaseLayout.astro header
- [x] T022 [US1] Implement Pagefind initialization and basic search execution in buscar.astro
- [x] T023 [US1] Add empty state UI with "No se encontraron resultados" message
- [x] T024 [US1] Add query validation (min 2 chars) with guidance message
- [x] T025 [US1] Run E2E tests and verify they PASS (Green phase)

**Checkpoint**: User Story 1 complete - basic search is functional and testable independently

---

## Phase 4: User Story 2 - Real-Time Search Suggestions (Priority: P2)

**Goal**: Search results update instantly as user types without form submission

**Independent Test**: Type characters in search field and observe results update without page reload

### Tests for User Story 2 (TDD - Write First, Must Fail)

- [x] T026 [P] [US2] Create E2E test file at tests/e2e/search-realtime.spec.ts
- [x] T027 [US2] Write test: typing 2+ characters triggers search within 300ms
- [x] T028 [US2] Write test: results update as user continues typing (debounced)
- [x] T029 [US2] Write test: clicking a result in dropdown navigates to article
- [x] T030 [US2] Run tests and verify they FAIL (Red phase)

### Implementation for User Story 2

- [x] T031 [US2] Add debounce utility function in src/utils/debounce.ts
- [x] T032 [US2] Extend SearchInput.astro with showInlineResults prop and dropdown UI
- [x] T033 [US2] Add client-side JavaScript for real-time search execution in SearchInput.astro
- [x] T034 [US2] Implement 300ms debounce on input events
- [x] T035 [US2] Add loading state indicator during search
- [x] T036 [US2] Run E2E tests and verify they PASS (Green phase)

**Checkpoint**: User Story 2 complete - real-time search works independently

---

## Phase 5: User Story 3 - Filter by Content Type (Priority: P3)

**Goal**: Users can filter search results by content type (dramas, kpop, noticias, guias)

**Independent Test**: Perform search, select filter, verify only that content type appears

### Tests for User Story 3 (TDD - Write First, Must Fail)

- [x] T037 [P] [US3] Create E2E test file at tests/e2e/search-filters.spec.ts
- [x] T038 [US3] Write test: selecting "K-Dramas" filter shows only drama results
- [x] T039 [US3] Write test: selecting "Todos" shows all content types again
- [x] T040 [US3] Write test: filter with no matching results shows appropriate message
- [x] T041 [US3] Run tests and verify they FAIL (Red phase)

### Implementation for User Story 3

- [x] T042 [US3] Create SearchFilters.astro component in src/components/search/SearchFilters.astro
- [x] T043 [US3] Add filter tabs UI with Todos, K-Dramas, K-Pop, Noticias, Guías options
- [x] T044 [US3] Integrate SearchFilters into buscar.astro page
- [x] T045 [US3] Update search execution to apply contentType filter via Pagefind filters option
- [x] T046 [US3] Add result count badges to each filter tab
- [x] T047 [US3] Update URL with type parameter when filter changes
- [x] T048 [US3] Run E2E tests and verify they PASS (Green phase)

**Checkpoint**: User Story 3 complete - filtering works independently

---

## Phase 6: User Story 4 - SEO-Friendly Search Results Page (Priority: P4)

**Goal**: Search results pages are discoverable by search engines with proper meta tags

**Independent Test**: Access /buscar?q=BTS directly and verify page renders with correct meta tags

### Tests for User Story 4 (TDD - Write First, Must Fail)

- [x] T049 [P] [US4] Create E2E test file at tests/e2e/search-seo.spec.ts
- [x] T050 [US4] Write test: direct URL access /buscar?q=BTS renders with pre-populated results
- [x] T051 [US4] Write test: page has correct title, description, canonical meta tags
- [x] T052 [US4] Write test: shared URL shows same results for different users
- [x] T053 [US4] Run tests and verify they FAIL (Red phase)

### Implementation for User Story 4

- [x] T054 [US4] Add dynamic meta tags to buscar.astro based on query parameter
- [x] T055 [US4] Add canonical URL meta tag with query parameter
- [x] T056 [US4] Add Open Graph tags (og:title, og:description, og:type)
- [x] T057 [US4] Add noindex directive for empty search queries
- [x] T058 [US4] Ensure URL parameters are read on page load for SSR/hydration
- [x] T059 [US4] Run E2E tests and verify they PASS (Green phase)

**Checkpoint**: All user stories complete - full search functionality ready

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T060 [P] Add pagination with "load more" button (10 results initially, +10 per click)
- [x] T061 [P] Add query truncation at 100 characters with user notification
- [x] T062 [P] Style search components with Tailwind CSS following site design
- [x] T063 Run Lighthouse audit on /buscar page and verify Performance score 90+
- [x] T064 Verify search assets are lazy-loaded (no impact on non-search pages)
- [x] T065 Run full E2E test suite: `pnpm test:e2e tests/e2e/search-*.spec.ts` - 54 tests passing
- [x] T066 Manual verification per quickstart.md checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Phase 2
  - US2 (P2): Can start after Phase 2 (parallel with US1 if desired)
  - US3 (P3): Can start after Phase 2 (parallel with US1/US2 if desired)
  - US4 (P4): Can start after Phase 2 (parallel with others if desired)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

All user stories can technically proceed in parallel after Phase 2, but recommended order:
- **US1 (P1)**: Start first - establishes core components used by others
- **US2 (P2)**: After US1 - extends SearchInput component
- **US3 (P3)**: After US1 - extends buscar.astro page
- **US4 (P4)**: After US1 - extends buscar.astro meta tags

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD Red phase)
- Implementation MUST make tests pass (TDD Green phase)
- All tests marked [P] within a phase can run in parallel

### Parallel Opportunities

- All test file creation tasks marked [P] can run in parallel
- Type definition tasks (T008, T009, T010) can run in parallel
- Component creation tasks within same phase marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Create test file (can parallelize with type definitions):
Task T012: Create E2E test file at tests/e2e/search-basic.spec.ts

# Write tests sequentially (same file):
Task T013-T015: Write individual test cases

# After tests fail, create components in parallel:
Task T017: Create SearchResultCard.astro
Task T018: Create SearchResults.astro
# Then sequentially:
Task T019-T024: Integration tasks (depend on components)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready - basic search is functional

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy (MVP!)
3. Add US2 → Test independently → Deploy (real-time search)
4. Add US3 → Test independently → Deploy (filtering)
5. Add US4 → Test independently → Deploy (SEO)
6. Polish → Final validation → Release

### Parallel Team Strategy

With multiple developers:
1. All complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (tests + implementation)
   - Developer B: US3 (can start tests while A works on US1)
3. After US1 complete:
   - Developer A: US2 (extends SearchInput)
   - Developer B: US4 (extends buscar.astro)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- TDD is MANDATORY: Write tests FIRST, verify they FAIL, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
