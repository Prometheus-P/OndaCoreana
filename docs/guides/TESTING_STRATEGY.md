---
title: HallyuLatino - Testing Strategy
version: 1.0.0
status: Approved
owner: "@hallyulatino-team"
created: 2024-11-28
updated: 2024-11-28
---

# Testing Strategy

## Documento Info

| Campo | Valor |
|-------|-------|
| Versión | 1.0.0 |
| Última actualización | 2024-11-28 |
| Autor | HallyuLatino Team |
| Estado | Activo |

---

## Tabla de Contenidos

1. [Filosofía de Testing](#1-filosofía-de-testing)
2. [Pirámide de Testing](#2-pirámide-de-testing)
3. [Testing de Build](#3-testing-de-build)
4. [Testing de Contenido](#4-testing-de-contenido)
5. [Testing de SEO](#5-testing-de-seo)
6. [Testing de Performance](#6-testing-de-performance)
7. [Testing de Accesibilidad](#7-testing-de-accesibilidad)
8. [Testing Visual](#8-testing-visual)
9. [Testing E2E](#9-testing-e2e)
10. [CI/CD Integration](#10-cicd-integration)
11. [Checklists](#11-checklists)

---

## 1. Filosofía de Testing

### 1.1 Principios

Para un sitio estático SSG como HallyuLatino, la estrategia de testing se enfoca en:

| Principio | Descripción |
|-----------|-------------|
| **Build-time Validation** | La mayoría de errores se detectan en build |
| **Content Integrity** | Validar que el contenido MDX es correcto |
| **SEO Verification** | Asegurar que el SEO está correctamente implementado |
| **Performance First** | Core Web Vitals como métrica clave |
| **Accessibility** | WCAG 2.1 AA compliance |

### 1.2 Qué Testear vs Qué No Testear

**Testear**:
- Build exitoso sin errores
- Validación de Content Collections schemas
- Meta tags y structured data
- Performance (Lighthouse)
- Links rotos
- Accesibilidad básica

**No Testear (Overkill para SSG)**:
- Unit tests exhaustivos de componentes Astro
- Integration tests de APIs (no hay APIs)
- Mocking complejo
- Coverage 100%

---

## 2. Pirámide de Testing

```
                    ┌─────────────┐
                    │    E2E      │  ← Mínimo (smoke tests)
                    │  (Manual)   │
                    └─────────────┘
                   ╱               ╲
                  ╱                 ╲
         ┌───────────────────────────────┐
         │      Visual & A11y Tests      │  ← Lighthouse, axe
         │        (Automated)            │
         └───────────────────────────────┘
        ╱                                 ╲
       ╱                                   ╲
┌─────────────────────────────────────────────────┐
│              Build & Content Validation          │  ← Crítico
│    (TypeScript, Zod schemas, pnpm build)        │
└─────────────────────────────────────────────────┘
```

### 2.1 Distribución de Esfuerzo

| Nivel | Esfuerzo | Herramientas |
|-------|----------|--------------|
| Build Validation | 50% | TypeScript, Astro build, Zod |
| SEO/Performance | 30% | Lighthouse CI, schema validators |
| Visual/A11y | 15% | axe-core, Percy (futuro) |
| E2E Manual | 5% | Browser manual testing |

---

## 3. Testing de Build

### 3.1 TypeScript Check

```bash
# Verificar tipos en todo el proyecto
pnpm astro check

# Output esperado:
# ✔ No errors found
```

**Configuración** (`tsconfig.json`):
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

### 3.2 Build Completo

```bash
# Build de producción
pnpm build

# Verificaciones automáticas:
# ✓ Content Collections validation
# ✓ TypeScript compilation
# ✓ Astro page generation
# ✓ Asset optimization
```

**Errores Comunes**:

| Error | Causa | Solución |
|-------|-------|----------|
| `ZodError` | Frontmatter inválido | Corregir campos en MDX |
| `PageNotFound` | Ruta dinámica sin datos | Verificar getStaticPaths |
| `TypeScript error` | Tipo incorrecto | Corregir tipos |

### 3.3 Content Collections Validation

Los schemas Zod validan automáticamente en build:

```typescript
// src/content/config.ts
const dramas = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60),      // ❌ Falla si > 60 chars
    description: z.string().max(160), // ❌ Falla si > 160 chars
    pubDate: z.coerce.date(),       // ❌ Falla si no es fecha válida
    // ...
  }),
});
```

**Ejemplo de Error**:
```
[ERROR] [content] "dramas/mi-drama.mdx" frontmatter does not match collection schema.
title: String must contain at most 60 character(s)
```

### 3.4 Script de Validación

```bash
#!/bin/bash
# scripts/validate.sh

echo "🔍 Running validation..."

# 1. TypeScript check
echo "📘 TypeScript check..."
pnpm astro check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# 2. Build
echo "🏗️ Building..."
pnpm build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ All validations passed!"
```

---

## 4. Testing de Contenido

### 4.1 Checklist de Contenido MDX

Para cada archivo en `src/content/`:

```markdown
## Pre-commit Content Checklist

### Frontmatter
- [ ] `title` ≤ 60 caracteres
- [ ] `description` ≤ 160 caracteres
- [ ] `pubDate` en formato válido (YYYY-MM-DD)
- [ ] `heroImage` existe en /public/images/
- [ ] `heroImageAlt` descriptivo
- [ ] `tags` relevantes (3-5 tags)
- [ ] `draft: false` para publicar

### Contenido
- [ ] H1 único (título del artículo)
- [ ] Estructura de headings correcta (H2 → H3 → H4)
- [ ] Imágenes con alt text
- [ ] Links internos funcionan
- [ ] No hay typos evidentes
- [ ] Contenido mínimo 300 palabras
```

### 4.2 Validación de Links

```bash
# Instalar checker de links (futuro)
pnpm add -D linkinator

# Verificar links rotos
npx linkinator ./dist --recurse
```

**Configuración** (`.linkinator.config.json`):
```json
{
  "skip": [
    "https://twitter.com/*",
    "https://www.instagram.com/*"
  ],
  "timeout": 10000,
  "retry": true
}
```

### 4.3 Validación de Imágenes

```bash
# Verificar que todas las heroImage existen
find src/content -name "*.mdx" -exec grep -l "heroImage:" {} \; | while read file; do
  image=$(grep "heroImage:" "$file" | sed 's/heroImage: "//' | sed 's/"//')
  if [ ! -f "public$image" ]; then
    echo "❌ Missing image in $file: $image"
  fi
done
```

---

## 5. Testing de SEO

### 5.1 Meta Tags Validation

**Manual Check**:
```bash
# Ver HTML generado
cat dist/dramas/goblin.html | grep -E "<title>|<meta"
```

**Checklist SEO por Página**:

```markdown
## SEO Checklist

### Meta Tags
- [ ] `<title>` presente y ≤ 60 chars
- [ ] `<meta name="description">` presente y ≤ 160 chars
- [ ] `<link rel="canonical">` correcto
- [ ] `<meta name="robots">` (si aplica)

### Open Graph
- [ ] `og:title` presente
- [ ] `og:description` presente
- [ ] `og:image` URL absoluta válida
- [ ] `og:type` correcto (website/article)
- [ ] `og:url` URL absoluta

### Twitter Cards
- [ ] `twitter:card` presente
- [ ] `twitter:title` presente
- [ ] `twitter:description` presente
- [ ] `twitter:image` presente

### Structured Data
- [ ] JSON-LD válido (usar validator)
- [ ] Schema type correcto
- [ ] Campos requeridos presentes
```

### 5.2 Schema.org Validation

**Herramientas**:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

**Automated Check** (futuro):
```bash
# Extraer y validar JSON-LD
cat dist/index.html | grep -oP '<script type="application/ld\+json">.*?</script>' | \
  sed 's/<[^>]*>//g' | \
  npx jsonlint
```

### 5.3 Sitemap Validation

```bash
# Verificar que sitemap existe y es válido
curl -s https://hallyulatino.com/sitemap-index.xml | head -20

# Validar XML
xmllint --noout dist/sitemap-index.xml
```

### 5.4 robots.txt Check

```bash
# Verificar contenido
cat public/robots.txt

# Esperado:
# User-agent: *
# Allow: /
# Sitemap: https://hallyulatino.com/sitemap-index.xml
```

---

## 6. Testing de Performance

### 6.1 Lighthouse CI

**Instalación**:
```bash
pnpm add -D @lhci/cli
```

**Configuración** (`lighthouserc.js`):
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4321/',
        'http://localhost:4321/dramas/',
        'http://localhost:4321/dramas/goblin/',
      ],
      startServerCommand: 'pnpm preview',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Ejecutar**:
```bash
# Build primero
pnpm build

# Correr Lighthouse CI
npx lhci autorun
```

### 6.2 Métricas Target

| Métrica | Target | Crítico |
|---------|--------|---------|
| Performance Score | ≥ 90 | ≥ 80 |
| LCP | < 2.5s | < 4s |
| FID | < 100ms | < 300ms |
| CLS | < 0.1 | < 0.25 |
| TBT | < 200ms | < 600ms |
| FCP | < 1.8s | < 3s |

### 6.3 Bundle Analysis

```bash
# Analizar bundle size
pnpm build -- --analyze

# O usar herramienta externa
npx source-map-explorer dist/_astro/*.js
```

---

## 7. Testing de Accesibilidad

### 7.1 Automated A11y Testing

**axe-core** (vía Lighthouse):
```javascript
// Ya incluido en Lighthouse CI
// Verifica:
// - Color contrast
// - Alt text
// - ARIA labels
// - Keyboard navigation
// - Semantic HTML
```

### 7.2 Manual A11y Checklist

```markdown
## Accessibility Checklist

### Keyboard Navigation
- [ ] Tab order lógico
- [ ] Focus visible en todos los elementos interactivos
- [ ] Skip link funcional
- [ ] No keyboard traps

### Screen Readers
- [ ] Landmarks correctos (nav, main, footer)
- [ ] Headings en orden jerárquico
- [ ] Alt text en imágenes
- [ ] Links descriptivos (no "click aquí")

### Visual
- [ ] Contraste ≥ 4.5:1 para texto normal
- [ ] Contraste ≥ 3:1 para texto grande
- [ ] No depender solo de color
- [ ] Texto escalable hasta 200%

### Forms (si aplica)
- [ ] Labels asociados a inputs
- [ ] Error messages accesibles
- [ ] Required fields indicados
```

### 7.3 Herramientas de A11y

| Herramienta | Uso |
|-------------|-----|
| **axe DevTools** | Extension browser |
| **WAVE** | Evaluación visual |
| **Lighthouse** | Score automatizado |
| **VoiceOver/NVDA** | Testing real con screen reader |

---

## 8. Testing Visual

### 8.1 Visual Regression (Futuro)

```bash
# Instalar Percy o Chromatic
pnpm add -D @percy/cli

# Capturar snapshots
npx percy snapshot ./dist
```

### 8.2 Cross-Browser Testing

**Browsers a Testear**:

| Browser | Versión | Prioridad |
|---------|---------|-----------|
| Chrome | Latest | Alta |
| Safari | Latest | Alta |
| Firefox | Latest | Media |
| Edge | Latest | Media |
| Chrome Mobile | Latest | Alta |
| Safari iOS | Latest | Alta |

### 8.3 Responsive Breakpoints

```
Mobile:  320px, 375px, 414px
Tablet:  768px, 1024px
Desktop: 1280px, 1440px, 1920px
```

**Checklist por Breakpoint**:
- [ ] Layout no se rompe
- [ ] Texto legible (min 16px mobile)
- [ ] Touch targets ≥ 44x44px
- [ ] Imágenes se escalan correctamente
- [ ] Menú navegación funcional

---

## 9. Testing E2E

### 9.1 Smoke Tests Manuales

Antes de cada release, verificar manualmente:

```markdown
## Smoke Test Checklist

### Navegación
- [ ] Homepage carga correctamente
- [ ] Menú de navegación funciona
- [ ] Links del footer funcionan
- [ ] Breadcrumbs funcionan

### Páginas de Sección
- [ ] /dramas/ muestra listado
- [ ] /kpop/ muestra listado
- [ ] /noticias/ muestra listado
- [ ] /guias/ muestra listado

### Páginas de Detalle
- [ ] Artículo de drama carga
- [ ] Artículo de kpop carga
- [ ] Imágenes se muestran
- [ ] Metadata visible (fecha, autor)

### SEO
- [ ] Título en pestaña correcto
- [ ] Compartir en redes muestra preview correcto
```

### 9.2 Playwright Setup (Futuro)

```bash
# Instalar Playwright
pnpm add -D @playwright/test

# Inicializar
npx playwright install
```

**Ejemplo de Test**:
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/HallyuLatino/);
  await expect(page.locator('nav')).toBeVisible();
});

test('drama article loads', async ({ page }) => {
  await page.goto('/dramas/goblin/');
  await expect(page.locator('h1')).toContainText('Goblin');
  await expect(page.locator('article')).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('nav >> text=Dramas');
  await expect(page).toHaveURL('/dramas/');
});
```

---

## 10. CI/CD Integration

### 10.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test & Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: TypeScript check
        run: pnpm astro check

      - name: Build
        run: pnpm build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  lighthouse:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run Lighthouse CI
        run: |
          pnpm add -D @lhci/cli
          npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 10.2 Pre-commit Hooks

```bash
# Instalar husky
pnpm add -D husky lint-staged

# Configurar hooks
npx husky init
```

**Configuración** (`.husky/pre-commit`):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type check archivos staged
pnpm astro check

# Lint staged files (si se usa)
# npx lint-staged
```

### 10.3 PR Checks

| Check | Herramienta | Bloquea PR |
|-------|-------------|------------|
| TypeScript | `astro check` | Sí |
| Build | `pnpm build` | Sí |
| Lighthouse | LHCI | No (warning) |
| Links | linkinator | No (warning) |

---

## 11. Checklists

### 11.1 Pre-PR Checklist

```markdown
## Before Creating PR

### Code Quality
- [ ] `pnpm astro check` sin errores
- [ ] `pnpm build` exitoso
- [ ] No hay console.log/debug code
- [ ] Código formateado (Prettier)

### Content (si aplica)
- [ ] Frontmatter válido
- [ ] Imágenes optimizadas (< 200KB)
- [ ] Alt text en imágenes
- [ ] Links internos funcionan

### SEO (si aplica)
- [ ] Title ≤ 60 chars
- [ ] Description ≤ 160 chars
- [ ] Schema correcto

### Tested
- [ ] Verificado en localhost
- [ ] Responsive check (mobile/desktop)
```

### 11.2 Pre-Release Checklist

```markdown
## Before Release

### Build
- [ ] `pnpm build` exitoso en CI
- [ ] No warnings críticos
- [ ] Bundle size razonable

### Performance
- [ ] Lighthouse ≥ 90 en todas las categorías
- [ ] Core Web Vitals passing

### SEO
- [ ] Sitemap generado correctamente
- [ ] robots.txt correcto
- [ ] Structured data válido

### Content
- [ ] No artículos draft accidentalmente publicados
- [ ] Links no rotos
- [ ] Imágenes cargan

### Cross-browser
- [ ] Chrome OK
- [ ] Safari OK
- [ ] Mobile OK

### Final
- [ ] CHANGELOG actualizado
- [ ] Version bumped
- [ ] Tag creado
```

### 11.3 Post-Deploy Checklist

```markdown
## After Deploy to Production

### Verification
- [ ] Homepage carga (hallyulatino.com)
- [ ] SSL certificate válido
- [ ] Todas las secciones accesibles
- [ ] Imágenes cargan

### SEO
- [ ] Sitemap accesible (/sitemap-index.xml)
- [ ] robots.txt accesible
- [ ] Google Search Console sin errores nuevos

### Performance
- [ ] PageSpeed Insights check
- [ ] Sin errores en console

### Monitoring (futuro)
- [ ] Analytics funcionando
- [ ] Error tracking activo
```

---

## Scripts de Testing

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "pnpm check && pnpm build",
    "test:lighthouse": "lhci autorun",
    "test:links": "linkinator ./dist --recurse",
    "validate": "./scripts/validate.sh"
  }
}
```

### Quick Test Commands

```bash
# Validación rápida (pre-commit)
pnpm check

# Test completo (pre-PR)
pnpm test

# Test de performance (pre-release)
pnpm test:lighthouse

# Verificar links
pnpm test:links
```

---

## Referencias

- [Astro Testing Guide](https://docs.astro.build/en/guides/testing/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [axe Accessibility](https://www.deque.com/axe/)
- [Playwright](https://playwright.dev/)

---

*Documento mantenido por el equipo de HallyuLatino.*
