# OndaCoreana Constitution

## Core Principles

### I. Static-First (SSG)
All features MUST compile to 100% static HTML/CSS/JS. No server-side runtime allowed. Client-side JavaScript should be minimal (< 5KB per feature).

### II. SEO Excellence
Every page MUST include proper meta tags (title, description, OG, Twitter cards). Lighthouse SEO score MUST remain 90+. All content pages MUST be included in sitemap.

### III. Spanish-First Content
Primary content language is Spanish (es-419 for Latin America). All user-facing text MUST be in Spanish. English technical terms acceptable in code comments.

### IV. Existing Stack Only
No new npm dependencies without explicit justification. Use existing Astro + Tailwind CSS patterns. Prefer vanilla JS over framework additions.

### V. Mobile-Responsive
All UI components MUST work on mobile (375px+). Touch targets MUST be at least 44px. No horizontal scroll on any viewport.

## Quality Gates

- Build: `pnpm build` MUST succeed with 0 TypeScript errors
- Tests: `pnpm test:e2e` MUST pass all Playwright tests
- Performance: Lighthouse scores MUST be 90+ in all categories

## Governance

Constitution amendments require documentation in PR description with rationale.

**Version**: 1.0.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12
