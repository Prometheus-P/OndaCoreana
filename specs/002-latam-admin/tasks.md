# Tasks: LatAm Content Admin & AI Design Assistant

**Input**: Design docs from `/specs/002-latam-admin/`
**Prerequisites**: plan.md (required), spec.md (required), research.md (LatAm audience insights), data-model.md, contracts/ (if AI agent contract exists)

**Tests**: Playwright E2E is REQUIRED (TDD mandate). Write tests first, verify they fail, then implement.

**Organization**: Tasks grouped by user story; each must be independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (no dependencies)
- **[Story]**: User story label (e.g., US1)
- Include exact file paths

## Path Conventions

- Admin UI: `src/pages/admin/`, `src/components/admin/`
- Content collection for editorial features: `src/content/features/` (Spanish-first, LatAm hooks)
- Types/utilities: `src/types/`, `src/utils/`
- Tests: `tests/e2e/`

---

## Phase 1: Setup

- [ ] T001 Create feature folder `/specs/002-latam-admin/` docs (spec.md, plan.md, data-model.md placeholders if missing)
- [ ] T002 Add `.env.example` entries: `PUBLIC_ADMIN_ACCESS_CODE`, `AI_AGENT_ENDPOINT`, `AI_AGENT_KEY`
- [ ] T003 [P] Add admin entry page placeholder `src/pages/admin/index.astro` to avoid 404 (temporary guard)

---

## Phase 2: Foundational (Blocking)

- [ ] T004 Define `features` content collection in `src/content/config.ts` with fields: slug, title, descriptionEs, category (music/series/event/gastronomy), countries[], latamHook[], heroImage, heroImageAlt, publishDate, author, tags[], blocks (rich content), seoMeta
- [ ] T005 [P] Add types in `src/types/feature.ts` (form values, stored content, AI design tokens)
- [ ] T006 [P] Seed sample feature `src/content/features/latam-demo.mdx` (Spanish) referencing a LatAm-interest topic (e.g., K-Pop tour in Mexico/Chile)
- [ ] T007 Create Admin layout shell `src/layouts/AdminLayout.astro` with nav slots, breadcrumbs, and guard placeholder
- [ ] T008 Document env usage in `ENVIRONMENT.md` for admin + AI secrets (no secrets committed)

**Checkpoint**: Foundation ready

---

## Phase 3: User Story 1 - Admin Access Control (P1) 🎯 MVP

**Goal**: Only authorized admins can enter the console.

### Tests (write first)

- [ ] T009 [P] [US1] Playwright tests `tests/e2e/admin-access.spec.ts` covering access code prompt, invalid attempt message, and successful unlock
- [ ] T010 [US1] Test session persistence (localStorage/cookie) and logout flow

### Implementation

- [ ] T011 [P] [US1] Implement access gate in `src/pages/admin/index.astro` using `PUBLIC_ADMIN_ACCESS_CODE` with client-side guard + redirect to `/admin/features`
- [ ] T012 [US1] Build `src/components/admin/AdminGate.astro` for code input, error messaging, retry limit, and logout
- [ ] T013 [US1] Persist session token and auto-redirect when already authenticated

**Checkpoint**: Admin gate functional and testable independently

---

## Phase 4: User Story 2 - Feature Composer (P1) 🎯 MVP

**Goal**: Admin can author/edit LatAm-interest features (Spanish-first) with preview and export.

### Tests (write first)

- [ ] T014 [P] [US2] Playwright tests `tests/e2e/admin-feature-form.spec.ts` for required fields, validation, live preview, and export MDX
- [ ] T015 [US2] Tests for LatAm hooks (chips/select) and country targeting behavior

### Implementation

- [ ] T016 [P] [US2] Build form UI `src/components/admin/FeatureForm.astro` (title, descriptionEs, category, countries[], latamHook[], heroImage, heroImageAlt, publishDate, author, tags[], blocks rich text)
- [ ] T017 [US2] Add preview `src/components/admin/FeaturePreview.astro` using site styles
- [ ] T018 [US2] Implement export utilities `src/utils/feature-export.ts` to generate MDX frontmatter/body (Spanish default)
- [ ] T019 [US2] Create admin page `src/pages/admin/features.astro` wiring form + preview + export
- [ ] T020 [US2] Persist drafts locally (localStorage/sessionStorage) to avoid data loss

**Checkpoint**: Feature composer works end-to-end

---

## Phase 5: User Story 3 - AI Design Assistant (P2)

**Goal**: Admin can request AI to propose layout/palette and copy tailored to LatAm audiences.

### Tests (write first)

- [ ] T021 [P] [US3] Playwright tests `tests/e2e/admin-ai-design.spec.ts` with mocked AI endpoint verifying payload, applied design tokens, and copy suggestions
- [ ] T022 [US3] Tests for failure fallback (graceful error, default design)

### Implementation

- [ ] T023 [P] [US3] Add AI client `src/services/ai/designAgent.ts` (fetch to `AI_AGENT_ENDPOINT` with `AI_AGENT_KEY`, timeout, retries)
- [ ] T024 [US3] Add “Generate with AI” control in `FeatureForm.astro`; apply returned palette/typography/layout hints to preview
- [ ] T025 [US3] Surface AI copy suggestions (headline, CTA, hooks) with one-click apply and undo
- [ ] T026 [US3] Log AI interactions locally for audit; show last suggestion timestamp

**Checkpoint**: AI assistance usable and resilient

---

## Phase 6: User Story 4 - LATAM Relevance Guidance (P2)

**Goal**: Ensure content includes hooks that resonate with LatAm audiences.

### Tests (write first)

- [ ] T027 [P] [US4] Playwright tests `tests/e2e/admin-latam.spec.ts` verifying Spanish default, LatAm hooks required, and localized preview strings
- [ ] T028 [US4] Tests for country-aware examples (MX/CO/CL/AR) and cultural cues (music collabs, festivals, food, football references)

### Implementation

- [ ] T029 [P] [US4] Add LatAm hooks input presets to `FeatureForm.astro` (tour stops, slang, fan culture, food/festivals)
- [ ] T030 [US4] Add inline guidance/checklist for LatAm resonance and CTA localization
- [ ] T031 [US4] Ensure preview includes “Para la audiencia latinoamericana” section and localized CTA text

**Checkpoint**: LatAm-focused guidance enforced

---

## Phase 7: User Story 5 - Publish & SEO (P3)

**Goal**: Generated features publishable under `/features/<slug>` with SEO metadata.

### Tests (write first)

- [ ] T032 [P] [US5] Playwright tests `tests/e2e/admin-publish.spec.ts` validating exported MDX builds correctly and renders hero/meta
- [ ] T033 [US5] Tests for canonical URL, og:title/description/image, language=es on feature pages

### Implementation

- [ ] T034 [P] [US5] Add routing `src/pages/features/[slug].astro` consuming `src/content/features/`
- [ ] T035 [US5] Add listing page `src/pages/features/index.astro` with filters (country, category, tags)
- [ ] T036 [US5] Enhance export utility to include SEO meta and canonical/OG tags
- [ ] T037 [US5] Document publish workflow in `docs/admin-features.md` (export, commit, verify)

**Checkpoint**: Features publishable and SEO-ready

---

## Phase 8: Polish & Ops

- [ ] T038 [P] Add accessibility pass for admin UI (labels, focus, contrast)
- [ ] T039 [P] Add telemetry/log hooks around AI requests and exports for debugging
- [ ] T040 [P] Add Lighthouse/SEO checks for `/features/*` in Playwright or separate script
- [ ] T041 Update docs (README, AGENTS.md) to mention admin feature and LatAm guidance
- [ ] T042 Add quickstart snippet to `quickstart.md` for running admin + tests

---

## Dependencies & Order

- Setup → Foundational → US1 (gate) → US2 (composer) → US3/US4 (parallel) → US5 (publish) → Polish
- Tests first (RED), then implementation (GREEN)
- Tasks marked [P] can run in parallel once dependencies are satisfied
