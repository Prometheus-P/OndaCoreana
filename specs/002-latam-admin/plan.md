# Implementation Plan: LatAm Content Admin & AI Design Assistant

**Branch**: `002-latam-admin` | **Date**: 2024-12-03 | **Spec**: `specs/002-latam-admin/spec.md`  
**Input**: Feature specification from `/specs/002-latam-admin/spec.md`

## Summary

Build an admin console for OndaCoreana to publish Spanish-first, LatAm-relevant feature pages. Core flows: access gate, feature composer with live preview/export to MDX, AI design/copy assistant with safe fallbacks, LatAm guidance presets, and publish/SEO routing under `/features`. Reuse Astro + TypeScript + Tailwind, store content as MDX in `src/content/features/`, and test via Playwright.

## Technical Context

- **Language/Version**: TypeScript, Astro 5.x, Node 18+  
- **Primary Dependencies**: Astro, Tailwind, Pagefind (already used), optional AI HTTP client via `fetch`  
- **Storage**: Content collections (MDX) in repo; no database  
- **Testing**: Playwright for E2E, existing test harness  
- **Target Platform**: Static site (SSG) built and deployed via current pipeline  
- **Project Type**: Single project (Astro site)  
- **Performance Goals**: AI calls <3s p95 with timeout; admin UI fast locally; build unaffected  
- **Constraints**: No secrets committed; AI endpoint/key via env; admin gate on client; Spanish default content; LatAm hooks required  
- **Scale/Scope**: Single admin flow, small set of feature pages, minimal infra changes

## Constitution Check

- TDD/E2E mandate: Write Playwright tests first for each story.  
- Secrets handling: use env vars, no checked-in keys.  
- Accessibility: ensure admin UI has labels, focus, contrast.

## Project Structure

```text
specs/002-latam-admin/
├── spec.md
├── plan.md
├── tasks.md

src/
├── pages/
│   ├── admin/
│   │   ├── index.astro
│   │   └── features.astro
│   └── features/
│       ├── [slug].astro
│       └── index.astro
├── components/
│   └── admin/
│       ├── AdminGate.astro
│       ├── FeatureForm.astro
│       └── FeaturePreview.astro
├── layouts/
│   └── AdminLayout.astro
├── services/
│   └── ai/
│       └── designAgent.ts
├── utils/
│   ├── feature-export.ts
│   └── debounce.ts (reuse if exists)
├── types/
│   └── feature.ts
└── content/
    └── features/
        ├── config.ts (shared)
        └── latam-demo.mdx

tests/e2e/
├── admin-access.spec.ts
├── admin-feature-form.spec.ts
├── admin-ai-design.spec.ts
├── admin-latam.spec.ts
└── admin-publish.spec.ts
```

**Structure Decision**: Single Astro project; admin pages and components live under `src/pages/admin` and `src/components/admin`; content stays in `src/content/features`.

## Phases (aligned to tasks)

1. **Setup**: Env entries, admin placeholder page.  
2. **Foundational**: Content collection, types, seed content, admin layout, env docs.  
3. **US1 Access**: Gate + session persistence with tests.  
4. **US2 Composer**: Form, preview, export with tests.  
5. **US3 AI Assistant**: AI client, UI hook, fallbacks with tests.  
6. **US4 LatAm Guidance**: Hooks presets, localized CTA section with tests.  
7. **US5 Publish/SEO**: Routing, listing, SEO metadata with tests.  
8. **Polish/Ops**: A11y, telemetry, Lighthouse/SEO checks, docs updates.

## Complexity Tracking

No constitution violations anticipated; feature stays within existing Astro stack and SSG workflow.
