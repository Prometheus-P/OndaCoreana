# Tasks: Astro MVP Polish

**Input**: Design documents from `/specs/004-astro-mvp-polish/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: E2E tests via existing Playwright setup. Manual visual verification included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Verification)

**Purpose**: Verify development environment and branch readiness

- [x] T001 Verify on `004-astro-mvp-polish` branch (`git status`)
- [x] T002 [P] Install dependencies (`pnpm install`)
- [x] T003 [P] Start dev server and verify site loads (`pnpm dev`)

---

## Phase 2: Foundational (None Required)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ This feature requires NO foundational changes** - all changes use existing Astro + Tailwind infrastructure.

**Checkpoint**: Proceed directly to User Story 1

---

## Phase 3: User Story 1 - Brand Consistency (Priority: P1) 🎯 MVP

**Goal**: Replace all "HallyuLatino" brand references with "OndaCoreana"

**Independent Test**: All pages display "OndaCoreana" in Header/Footer, JSON-LD Organization name is correct

### Implementation for User Story 1

- [x] T004 [US1] Replace "HallyuLatino" → "OndaCoreana" in Header (`src/layouts/BaseLayout.astro:58`)
- [x] T005 [US1] Replace "HallyuLatino" → "OndaCoreana" in Footer h3 (`src/layouts/BaseLayout.astro:134`)
- [x] T006 [US1] Replace "HallyuLatino" → "OndaCoreana" in Footer copyright (`src/layouts/BaseLayout.astro:176`)
- [x] T007 [US1] Verify JSON-LD Organization schema already uses "OndaCoreana" (`src/components/seo/JsonLd.astro:65`)

### Verification for User Story 1

- [x] T008 [US1] Build and verify no "HallyuLatino" in dist (`pnpm build && grep -r "HallyuLatino" dist/`)
- [x] T009 [US1] Verify "OndaCoreana" appears in dist/index.html (`grep "OndaCoreana" dist/index.html`)

**Checkpoint**: US1 Complete - Brand is consistent across all pages

---

## Phase 4: User Story 2 - Legal Pages (Priority: P2)

**Goal**: Create /privacidad and /terminos pages for legal compliance

**Independent Test**: Both pages return 200 OK with appropriate content

### Implementation for User Story 2

- [x] T010 [P] [US2] Create Privacy Policy page (`src/pages/privacidad.astro`)
  - Use BaseLayout
  - Include SEO meta tags (title, description)
  - Spanish language content with sections:
    1. Información que recopilamos
    2. Cómo usamos tu información
    3. Cookies y tecnologías similares
    4. Compartir información
    5. Tus derechos
    6. Cambios a esta política
    7. Contacto

- [x] T011 [P] [US2] Create Terms of Use page (`src/pages/terminos.astro`)
  - Use BaseLayout
  - Include SEO meta tags (title, description)
  - Spanish language content with sections:
    1. Aceptación de términos
    2. Uso del sitio
    3. Propiedad intelectual
    4. Limitación de responsabilidad
    5. Enlaces externos
    6. Modificaciones
    7. Ley aplicable
    8. Contacto

### Verification for User Story 2

- [x] T012 [US2] Build and verify pages exist (`pnpm build`)
- [x] T013 [P] [US2] Verify /privacidad returns 200 (`pnpm preview` + `curl -I http://localhost:4321/privacidad`)
- [x] T014 [P] [US2] Verify /terminos returns 200 (`pnpm preview` + `curl -I http://localhost:4321/terminos`)
- [x] T015 [US2] Verify sitemap includes new pages (`grep "privacidad\|terminos" dist/sitemap-*.xml`)

**Checkpoint**: US2 Complete - Legal pages accessible and indexed

---

## Phase 5: User Story 3 - Newsletter Form UX (Priority: P3)

**Goal**: Add client-side feedback when newsletter form is submitted

**Independent Test**: Form submission shows success message, does not submit to server

### Implementation for User Story 3

- [x] T016 [US3] Add JavaScript form handler to index.astro (`src/pages/index.astro`)
  - Prevent default form submission (`event.preventDefault()`)
  - Show success message: "¡Gracias! Te avisaremos cuando lancemos el boletín."
  - Add id attribute to form for JS targeting
  - Add success message element (hidden by default)
  - ~15 lines of vanilla JavaScript

### Verification for User Story 3

- [x] T017 [US3] Manual test: Submit form with valid email, verify success message appears
- [x] T018 [US3] Manual test: Verify form does NOT submit to server (no network request)
- [x] T019 [US3] Manual test: Refresh page, verify form resets to initial state

**Checkpoint**: US3 Complete - Newsletter form provides user feedback

---

## Phase 6: Polish & Final Verification

**Purpose**: Cross-cutting verification across all user stories

- [x] T020 Run full build and verify no errors (`pnpm build`)
- [x] T021 Run E2E tests (`pnpm test:e2e`)
- [x] T022 Verify Lighthouse SEO score ≥ 90
- [x] T023 Visual verification: Check Header, Footer, Legal pages, Newsletter form on mobile
- [x] T024 Commit all changes with descriptive message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start here
- **Phase 2 (Foundational)**: Skipped - not needed for this feature
- **Phase 3 (US1)**: Can start immediately after Phase 1
- **Phase 4 (US2)**: Can start immediately after Phase 1, parallel with US1
- **Phase 5 (US3)**: Can start immediately after Phase 1, parallel with US1/US2
- **Phase 6 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

All three user stories are **independent** and can be implemented in parallel:

- **US1 (Brand)**: Modifies `BaseLayout.astro` only
- **US2 (Legal)**: Creates new files `privacidad.astro` and `terminos.astro`
- **US3 (Newsletter)**: Modifies `index.astro` only

### Parallel Opportunities

```text
After Phase 1 (Setup), launch all user stories in parallel:

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ US1: Brand  │  │ US2: Legal  │  │US3: News-   │
│ T004-T009   │  │ T010-T015   │  │letter T016- │
│ BaseLayout  │  │ 2 new pages │  │T019 index   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
              ┌─────────────────┐
              │ Phase 6: Polish │
              │ T020-T024       │
              └─────────────────┘
```

---

## Files Modified/Created Summary

| File | Action | User Story |
|------|--------|------------|
| `src/layouts/BaseLayout.astro` | MODIFY | US1 (3 text changes) |
| `src/components/seo/JsonLd.astro` | VERIFY | US1 (already correct) |
| `src/pages/privacidad.astro` | CREATE | US2 |
| `src/pages/terminos.astro` | CREATE | US2 |
| `src/pages/index.astro` | MODIFY | US3 (add JS handler) |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- All changes are static (SSG) - no runtime server code
- Social media links (@hallyulatino) intentionally preserved per spec assumptions
- Newsletter backend integration is out of scope (Phase 3 future work)
