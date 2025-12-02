<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (new constitution)
Added sections:
  - Core Principles (5 principles)
  - Technology Guidelines
  - Development Workflow
  - Governance

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md ✅ compatible (no constitution-specific references)
  - .specify/templates/tasks-template.md ✅ compatible (no constitution-specific references)

Follow-up TODOs: None
-->

# OndaCorea Constitution

## Core Principles

### I. SEO-First Development

All features and content MUST prioritize search engine optimization as the primary success metric.

**Non-negotiables:**
- Every page MUST achieve Core Web Vitals passing scores (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- All content MUST include complete meta tags (title, description, Open Graph, Twitter Cards)
- Schema.org JSON-LD structured data MUST be present on all article types
- Static Site Generation (SSG) MUST be used; client-side rendering is prohibited for content pages
- Images MUST use modern formats (WebP/AVIF) with responsive srcset and explicit dimensions

**Rationale:** The project's monetization goal (50,000 monthly sessions) depends entirely on organic search traffic. SEO is not optional—it is the business model.

### II. Test-Driven Development (NON-NEGOTIABLE)

All code changes MUST follow strict TDD methodology: tests written first, user approval, tests fail, then implement.

**Non-negotiables:**
- Tests MUST be written and committed BEFORE implementation code
- Tests MUST fail initially (Red phase) to prove they are testing the right thing
- Implementation MUST make tests pass (Green phase) with minimal code
- Refactoring MUST NOT break passing tests (Refactor phase)
- No PR may be merged without corresponding test coverage for changed code
- E2E tests using Playwright MUST cover all critical user journeys

**Rationale:** TDD prevents regressions, documents behavior, and forces clear thinking about requirements before coding. For a content site, broken pages directly impact SEO rankings and user trust.

### III. Content Collection Integrity

All content MUST conform to typed schemas and follow established editorial patterns.

**Non-negotiables:**
- All content MUST use MDX format within Astro Content Collections
- Content schemas MUST be defined in `src/content/config.ts` with Zod validation
- Required fields (title, description, pubDate, heroImage, heroImageAlt) MUST NOT be optional
- Collection-specific fields (dramaTitle, artistName, etc.) MUST be enforced per type
- Content MUST be written in Spanish (es-MX) with proper grammar and accent marks
- Slug patterns MUST follow SEO-friendly kebab-case conventions

**Rationale:** Typed content prevents runtime errors, ensures SEO completeness, and maintains editorial consistency across hundreds of articles.

### IV. Performance Budget Enforcement

All pages MUST meet quantified performance thresholds before deployment.

**Non-negotiables:**
- Total page weight MUST NOT exceed 500KB (excluding images loaded via lazy loading)
- Time to Interactive (TTI) MUST be under 3 seconds on 3G connections
- No third-party scripts may block the critical rendering path
- JavaScript bundle size MUST NOT exceed 50KB gzipped for the entire site
- Lighthouse Performance score MUST be 90+ on all page types
- Build output MUST be pure HTML/CSS with minimal JS hydration

**Rationale:** Astro SSG is chosen specifically for performance. Violating performance budgets negates the framework choice and harms SEO rankings.

### V. Simplicity & YAGNI

Start with the simplest solution that works. Do not build for hypothetical future requirements.

**Non-negotiables:**
- New dependencies MUST be justified with a documented use case
- Abstractions MUST NOT be created until there are 3+ concrete instances requiring them
- Configuration options MUST NOT be added until explicitly requested
- Features MUST ship as the minimal viable implementation first
- Code MUST be deleted rather than commented out or deprecated-in-place
- No "framework within a framework" patterns (custom routing, state management, etc.)

**Rationale:** Complexity is the enemy of maintainability. A simple site that works is infinitely better than a sophisticated site that breaks.

## Technology Guidelines

The following stack is established guidance. Deviations are permitted when justified in writing with clear rationale.

| Category | Technology | Version | Flexibility |
|----------|------------|---------|-------------|
| Framework | Astro (SSG) | 5.x | Core - changes require constitution amendment |
| Styling | Tailwind CSS | 4.x | Preferred - alternatives allowed if performance-neutral |
| Content | MDX + Content Collections | - | Core - required for content integrity |
| Language | TypeScript | 5.x | Required - no plain JavaScript |
| Package Manager | pnpm | latest | Preferred - npm/yarn allowed if necessary |
| Hosting | Cloudflare Pages | - | Preferred - any static host allowed |
| Testing | Playwright (E2E) | latest | Core - required for TDD compliance |

**Adding Dependencies:**
- Dependencies MUST solve a documented problem
- Bundle size impact MUST be measured before adding
- Prefer Astro integrations over generic npm packages
- No dependencies that require client-side JavaScript for core functionality

## Development Workflow

### Code Review Requirements

- All changes MUST go through pull request review
- PRs MUST include passing CI checks (build, tests, lint)
- SEO-impacting changes MUST include Lighthouse score verification
- Content PRs MUST pass schema validation

### Commit Convention

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, content
```

### Quality Gates

1. **Pre-commit**: TypeScript type checking, linting
2. **CI Pipeline**: Build success, E2E tests pass, Lighthouse audit
3. **Pre-merge**: Code review approval, all checks green
4. **Post-deploy**: Production smoke tests, Core Web Vitals monitoring

## Governance

This constitution supersedes all other development practices. When in conflict, the constitution wins.

**Amendment Process:**
1. Propose change via pull request to this file
2. Document rationale and impact assessment
3. Update version following semantic versioning
4. Propagate changes to dependent templates
5. Team approval required before merge

**Versioning Policy:**
- MAJOR: Principle removal, redefinition, or backward-incompatible governance change
- MINOR: New principle added, section materially expanded
- PATCH: Clarifications, wording fixes, non-semantic refinements

**Compliance Review:**
- All PRs MUST verify compliance with stated principles
- Complexity additions MUST be justified against Principle V (Simplicity)
- Performance changes MUST be validated against Principle IV (Performance Budget)
- SEO changes MUST be validated against Principle I (SEO-First)

**Version**: 1.0.0 | **Ratified**: 2025-12-02 | **Last Amended**: 2025-12-02
