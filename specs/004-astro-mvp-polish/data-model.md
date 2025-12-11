# Data Model: Astro MVP Polish

**Feature**: 004-astro-mvp-polish
**Date**: 2025-12-12

## Overview

This feature does not introduce new data entities to the content collections. Changes are limited to:
1. Static text updates (brand name)
2. New static pages (not content collection items)
3. Client-side form state (transient, not persisted)

## Entities

### Existing Entities (No Changes)

The following content collections remain unchanged:
- `dramas` - K-Drama articles
- `kpop` - K-Pop artist profiles
- `noticias` - News articles
- `guias` - Guide articles
- `features` - LatAm-focused editorial content

### New Static Pages (Not Collection Items)

Legal pages are implemented as static Astro pages, not content collection items:

| Page | Route | Purpose |
|------|-------|---------|
| Privacy Policy | `/privacidad` | GDPR/CCPA compliance, AdSense requirement |
| Terms of Use | `/terminos` | Legal terms, user agreement |

**Why not Content Collection?**
- Only 2 pages, rarely updated
- No frontmatter metadata needed
- Simpler maintenance as .astro files
- No dynamic queries required

### Transient State (Client-Side Only)

Newsletter form state:

```typescript
interface NewsletterFormState {
  email: string;          // User input
  isSubmitted: boolean;   // Success state
  isSubmitting: boolean;  // Loading state (optional)
}
```

This state is:
- Not persisted to storage
- Reset on page reload
- Managed entirely in client-side JavaScript

## Schema Changes

**None required.** The `src/content/config.ts` file remains unchanged.

## Relationships

```
BaseLayout.astro
    │
    ├── Header (brand: "OndaCoreana")
    ├── <slot /> (page content)
    └── Footer (brand: "OndaCoreana")
           │
           ├── Link to /privacidad
           └── Link to /terminos

JsonLd.astro
    └── Organization schema (name: "OndaCoreana")

index.astro
    └── Newsletter form (client-side state only)
```

## Migration

No data migration required. All changes are:
- Text replacements in existing files
- New static page files
- Client-side JavaScript additions
