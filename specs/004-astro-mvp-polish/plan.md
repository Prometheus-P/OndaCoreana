# Implementation Plan: Astro MVP Polish

**Branch**: `004-astro-mvp-polish` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-astro-mvp-polish/spec.md`

## Summary

브랜드 일관성 확보(OndaCoreana), Legal 페이지 추가(/privacidad, /terminos), Newsletter 폼 UX 개선을 통해 Astro SSG 기반 K-Culture 포털의 MVP 완성도를 향상시킨다. 모든 변경은 기존 Astro + Tailwind CSS 아키텍처 내에서 정적 페이지로 구현된다.

## Technical Context

**Language/Version**: TypeScript 5.x (Astro 5.x)
**Primary Dependencies**: Astro 5.16.1, Tailwind CSS 4.x, @astrojs/mdx, @astrojs/sitemap
**Storage**: N/A (Static Site Generation, no database)
**Testing**: Playwright E2E (existing), manual visual testing
**Target Platform**: Web (Cloudflare Pages), SSG output
**Project Type**: Web application (Astro SSG)
**Performance Goals**: Lighthouse 90+ all categories, LCP < 2.5s
**Constraints**: 100% static output, no server-side runtime, minimal client JS
**Scale/Scope**: ~30 pages, 4 content collections, ~20 MDX files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| No new dependencies | ✅ PASS | Using existing Astro + Tailwind stack |
| SSG-only changes | ✅ PASS | All changes compile to static HTML |
| No breaking changes | ✅ PASS | Additive changes only (new pages, UI updates) |
| SEO preserved | ✅ PASS | Legal pages include proper meta tags |
| Minimal client JS | ✅ PASS | Newsletter form uses vanilla JS (< 1KB) |

## Project Structure

### Documentation (this feature)

```text
specs/004-astro-mvp-polish/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A for this feature (no API)
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── layouts/
│   └── BaseLayout.astro      # [MODIFY] Brand name updates
├── components/
│   └── seo/
│       └── JsonLd.astro      # [MODIFY] Organization name update
├── pages/
│   ├── index.astro           # [MODIFY] Newsletter form JS
│   ├── privacidad.astro      # [CREATE] Privacy policy page
│   └── terminos.astro        # [CREATE] Terms of use page
└── content/
    └── (no changes)

tests/
└── e2e/
    └── (existing Playwright tests)
```

**Structure Decision**: Single Astro project (existing structure preserved). No new directories needed. Changes are localized to:
1. `BaseLayout.astro` - Brand text replacement
2. `JsonLd.astro` - Organization schema update
3. `index.astro` - Newsletter form enhancement
4. New pages: `privacidad.astro`, `terminos.astro`

## Implementation Phases

### Phase 0: Research (Complete - No Unknowns)

All technical decisions are already resolved:
- Framework: Astro 5.x (existing)
- Styling: Tailwind CSS 4.x (existing)
- Legal content: Spanish language, standard web terms
- Newsletter: Client-side only (no backend)

### Phase 1: Design

**Changes by Priority:**

#### P1: Brand Consistency
- Replace "HallyuLatino" → "OndaCoreana" in `BaseLayout.astro` (Header, Footer)
- Update JSON-LD Organization name in `JsonLd.astro`
- Estimated: 2 locations in BaseLayout, 1 in JsonLd

#### P2: Legal Pages
- Create `src/pages/privacidad.astro` - Privacy Policy
- Create `src/pages/terminos.astro` - Terms of Use
- Both use `BaseLayout` with appropriate SEO meta tags
- Content in Spanish, following standard legal page structure

#### P3: Newsletter Form UX
- Add client-side JavaScript to handle form submission
- Show success message: "¡Gracias! Te avisaremos cuando lancemos el boletín."
- Prevent default form submission (no backend)
- Vanilla JS, no additional dependencies

## Complexity Tracking

> No constitution violations. All changes are within existing architecture.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| Brand updates | Low | Text replacement only |
| Legal pages | Low | Static pages using existing layout |
| Newsletter JS | Low | < 20 lines vanilla JS |

## Dependencies

- No new npm packages required
- No external API integrations
- No database changes

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SEO regression | Low | Legal pages include proper meta tags |
| Build failure | Low | All changes are syntactically simple |
| Mobile responsiveness | Low | Using existing Tailwind responsive classes |
