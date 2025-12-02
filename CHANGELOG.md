# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Pendiente para próxima versión

---

## [1.1.1] - 2024-12-01

### Added

#### Testing Infrastructure
- Playwright E2E test suite (58 tests)
  - Navigation tests (3)
  - SEO validation tests (4)
  - Content page tests (6)
  - Accessibility tests (5)
  - 404 page tests (3)
  - Mobile/Tablet responsiveness tests (4)
  - Performance tests (4)
- Desktop (Chromium) + Mobile (iPhone 14) test coverage
- `pnpm test:e2e` y `pnpm test:e2e:ui` scripts

---

## [1.1.0] - 2024-12-01

### Added

#### UI/UX Improvements
- Página 404 personalizada con diseño coreano
- Componente ShareButtons para compartir en redes sociales
  - Twitter, Facebook, WhatsApp, Telegram, Copy link
  - Diseño responsivo con iconos SVG

#### Content Expansion (Noticias: 10 artículos)
- IVE concierto en México
- Stray Kids récord Billboard
- Song Hye-kyo nuevo drama
- Squid Game temporada 2
- BLACKPINK extensión gira mundial
- NewJeans x Pepsi colaboración
- BTS reunión militar
- SEVENTEEN Arena CDMX
- Vincenzo película confirmada

### Fixed

#### SEO Improvements
- Twitter meta tags: `property` → `name` (estándar correcto)
- Títulos optimizados para ≤60 caracteres
  - Crash Landing on You
  - aespa
  - Guías (aprender coreano, dónde ver)

### Changed
- Lighthouse scores: 100/96/96/100 (Perf/A11y/BP/SEO)

---

## [1.0.0] - 2024-11-28

### Added

#### Core Framework
- Migración completa a Astro 5.x SSG desde FastAPI/Next.js
- Integración de Tailwind CSS 4.x vía @tailwindcss/vite
- Soporte MDX para Content Collections
- Generación automática de sitemap
- TypeScript strict mode

#### Content Collections
- Schema `dramas` para reseñas de K-Dramas
- Schema `kpop` para perfiles de artistas K-Pop
- Schema `noticias` para noticias de actualidad
- Schema `guias` para guías culturales
- Validación Zod para todos los frontmatter

#### SEO Infrastructure
- Componente `SEOHead.astro` para meta tags
- Componente `JsonLd.astro` para Schema.org
- Open Graph y Twitter Cards
- Canonical URLs y hreflang (es-MX)
- robots.txt configurado
- Sitemap XML automático

#### Layouts & Components
- `BaseLayout.astro` - Layout base con header/footer
- `ArticleLayout.astro` - Layout para artículos
- Navegación en español
- Breadcrumbs para artículos

#### Pages & Routing
- Homepage (`/`)
- Sección K-Dramas (`/dramas`, `/dramas/[slug]`)
- Sección K-Pop (`/kpop`, `/kpop/[slug]`)
- Sección Noticias (`/noticias`, `/noticias/[slug]`)
- Sección Guías (`/guias`, `/guias/[slug]`)

#### Sample Content (12 artículos)
- K-Dramas: Reina de las Lágrimas, Crash Landing on You, Goblin, Squid Game
- K-Pop: aespa, BTS, BLACKPINK, NewJeans
- Noticias: BTS regreso 2025
- Guías: Dónde ver K-Dramas, Aprender coreano, Guía de viaje

#### Documentation
- `CONTEXT.md` - Single Source of Truth del proyecto
- `README.md` - Guía de inicio rápido
- `ENVIRONMENT.md` - Configuración de desarrollo
- `CONTRIBUTING.md` - Guía de contribución
- `plan.md` - Plan de desarrollo TDD
- `docs/api/API_REFERENCE.md` - Referencia de APIs
- `docs/architecture/ARCHITECTURE.md` - Documentación de arquitectura
- `docs/guides/CODE_REVIEW_GUIDE.md` - Guía de code review
- `docs/guides/TESTING_STRATEGY.md` - Estrategia de testing
- `docs/guides/VERSIONING_GUIDE.md` - Guía de versionado

#### TDD Infrastructure
- Tests de validación de contenido (Zod schemas)
- Tests de validación SEO
- Tests de validación de build
- Scripts `pnpm test`, `pnpm tdd:red/green/refactor`

### Changed
- Arquitectura completamente nueva (Jamstack)
- Stack tecnológico: FastAPI → Astro SSG
- Estructura de contenido: Base de datos → MDX files
- Deploy target: Cloudflare Pages

### Removed
- Backend FastAPI
- Frontend Next.js
- Configuración de base de datos
- APIs REST
- Issue templates legacy (`.github/ISSUES/`)

### Security
- Static site (no server-side vulnerabilities)
- HTTPS enforced via Cloudflare

---

## [0.4.0-alpha.2] - 2024-XX-XX (Legacy)

> ⚠️ Esta versión fue deprecada. El código legacy está preservado en la rama `legacy-fastapi-v0.4.0`.

### Stack Legacy
- Backend: FastAPI + Python
- Frontend: Next.js + React
- Base de datos: PostgreSQL
- Auth: Supabase

---

## Guía de Versionado

### Tipos de Cambios

- **Added**: Nueva funcionalidad
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Funcionalidad que será removida
- **Removed**: Funcionalidad eliminada
- **Fixed**: Correcciones de bugs
- **Security**: Correcciones de vulnerabilidades

### Links

[Unreleased]: https://github.com/Prometheus-P/ondacorea/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/Prometheus-P/ondacorea/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Prometheus-P/ondacorea/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Prometheus-P/ondacorea/compare/v0.4.0-alpha.2...v1.0.0
[0.4.0-alpha.2]: https://github.com/Prometheus-P/ondacorea/releases/tag/v0.4.0-alpha.2
