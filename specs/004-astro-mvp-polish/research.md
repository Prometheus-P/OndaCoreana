# Research: Astro MVP Polish

**Feature**: 004-astro-mvp-polish
**Date**: 2025-12-12
**Status**: Complete

## Overview

This feature involves straightforward changes within the existing Astro + Tailwind CSS stack. No new technologies or complex decisions are required.

## Research Topics

### 1. Brand Naming Convention

**Decision**: Use "OndaCoreana" consistently across all UI elements

**Rationale**:
- Domain is `ondacoreana.com`
- CONTEXT.md specifies "OndaCoreana" as the project name
- Current "HallyuLatino" in code is inconsistent with brand identity

**Alternatives Considered**:
- Keep "HallyuLatino" as secondary brand → Rejected (causes confusion)
- Use both names in different contexts → Rejected (inconsistent UX)

**Implementation**:
- Replace all "HallyuLatino" text in BaseLayout.astro
- Update JSON-LD Organization schema

---

### 2. Legal Page Structure

**Decision**: Create static Astro pages with standard legal content structure

**Rationale**:
- AdSense/Mediavine require privacy policy and terms of use
- Static pages are simpler and faster than MDX content collection
- No dynamic content needed for legal pages

**Alternatives Considered**:
- MDX content collection for legal pages → Rejected (overkill for 2 static pages)
- External legal page generator → Rejected (adds dependency, less control)

**Implementation**:
- `src/pages/privacidad.astro` - Privacy Policy
- `src/pages/terminos.astro` - Terms of Use
- Both use BaseLayout with proper SEO meta tags

**Content Structure**:
```
Privacy Policy:
1. Información que recopilamos
2. Cómo usamos tu información
3. Cookies y tecnologías similares
4. Compartir información
5. Tus derechos
6. Cambios a esta política
7. Contacto

Terms of Use:
1. Aceptación de términos
2. Uso del sitio
3. Propiedad intelectual
4. Limitación de responsabilidad
5. Enlaces externos
6. Modificaciones
7. Ley aplicable
8. Contacto
```

---

### 3. Newsletter Form Handling

**Decision**: Client-side only with visual feedback (no backend)

**Rationale**:
- Phase 3 will implement actual email collection
- Current goal is UX improvement only
- No server-side runtime available (SSG)

**Alternatives Considered**:
- Netlify Forms / Formspree → Rejected (adds external dependency for placeholder)
- Local Storage saving → Rejected (no value without backend processing)

**Implementation**:
- Prevent default form submission
- Show success message inline
- Reset form after successful submission
- ~15 lines of vanilla JavaScript

---

## Technology Decisions Summary

| Area | Decision | Dependencies |
|------|----------|--------------|
| Brand | OndaCoreana | None |
| Legal Pages | Static .astro files | BaseLayout |
| Newsletter | Vanilla JS (client-side) | None |

## No Unknowns Remaining

All decisions have been made. Ready for Phase 1 implementation.
