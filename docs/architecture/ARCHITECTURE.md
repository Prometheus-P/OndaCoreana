---
title: HallyuLatino - Architecture Documentation
version: 1.0.0
status: Approved
owner: "@hallyulatino-team"
created: 2024-11-28
updated: 2024-11-28
---

# Architecture Documentation

## Documento Info

| Campo | Valor |
|-------|-------|
| Versión | 1.0.0 |
| Última actualización | 2024-11-28 |
| Autor | HallyuLatino Team |
| Estado | Activo |

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura de Directorios](#4-estructura-de-directorios)
5. [Flujo de Datos](#5-flujo-de-datos)
6. [Componentes del Sistema](#6-componentes-del-sistema)
7. [Estrategia de SEO](#7-estrategia-de-seo)
8. [Estrategia de Contenido](#8-estrategia-de-contenido)
9. [Infraestructura y Deploy](#9-infraestructura-y-deploy)
10. [Decisiones Arquitectónicas](#10-decisiones-arquitectónicas)

---

## 1. Visión General

### 1.1 Propósito del Sistema

HallyuLatino es un portal de contenido estático optimizado para SEO, diseñado para servir contenido sobre cultura coreana (K-Dramas, K-Pop, noticias, guías) a la comunidad hispanohablante.

### 1.2 Objetivos Arquitectónicos

| Objetivo | Descripción | Métrica |
|----------|-------------|---------|
| **Performance** | Carga ultra-rápida | LCP < 2.5s, FID < 100ms |
| **SEO** | Máxima indexabilidad | 100% páginas indexables |
| **Escalabilidad** | Soportar crecimiento de contenido | 1000+ artículos sin degradación |
| **Mantenibilidad** | Código limpio y documentado | < 30min onboarding nuevos devs |
| **Costo** | Hosting eficiente | $0 hasta 100k visitas/mes |

### 1.3 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                 │
│                    (Latinoamérica + US)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE CDN                              │
│              (Edge caching, DDoS protection)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PAGES                               │
│                  (Static file hosting)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      /dist                                  │ │
│  │  ├── index.html                                            │ │
│  │  ├── dramas/                                               │ │
│  │  │   ├── index.html                                        │ │
│  │  │   └── [slug].html                                       │ │
│  │  ├── kpop/                                                 │ │
│  │  ├── noticias/                                             │ │
│  │  ├── guias/                                                │ │
│  │  ├── sitemap-index.xml                                     │ │
│  │  └── robots.txt                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Build & Deploy
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD PROCESS                               │
│                     (Astro SSG + pnpm)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MDX Content → Astro Build → Static HTML/CSS/JS           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       GITHUB REPO                                │
│              (Source code + Content + CI/CD)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura del Sistema

### 2.1 Patrón Arquitectónico: Jamstack

HallyuLatino implementa el patrón **Jamstack** (JavaScript, APIs, Markup):

```
┌─────────────────────────────────────────────────────────────────┐
│                        JAMSTACK                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │  JavaScript │    │    APIs     │    │   Markup    │        │
│   │  (Astro)    │    │  (Futuro)   │    │   (HTML)    │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│   ┌─────────────────────────────────────────────────────┐      │
│   │              PRE-RENDERED STATIC FILES              │      │
│   │         (HTML, CSS, JS optimizado en /dist)         │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Principios de Diseño

| Principio | Implementación |
|-----------|----------------|
| **Static First** | Todo el contenido se pre-renderiza en build time |
| **Zero JavaScript by Default** | Astro no envía JS al cliente salvo cuando es necesario |
| **Content as Code** | MDX vive en el repositorio, versionado con Git |
| **Type Safety** | TypeScript + Zod schemas para validación |
| **SEO by Design** | Estructura pensada para crawlers desde el inicio |

### 2.3 Capas del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Layouts   │  │ Components  │  │   Pages     │             │
│  │  (Astro)    │  │  (Astro)    │  │  (Astro)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                      CONTENT LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Astro Content Collections                   │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ dramas  │ │  kpop   │ │noticias │ │  guias  │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      STYLING LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Tailwind CSS 4.x                            │   │
│  │         (Utility-first, JIT compilation)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    BUILD & TOOLING LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Vite     │  │ TypeScript  │  │    pnpm     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico

### 3.1 Stack Principal

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Framework** | Astro | 5.x | SSG, routing, build |
| **Contenido** | MDX | Latest | Markdown + componentes |
| **Estilos** | Tailwind CSS | 4.x | Utility-first CSS |
| **Lenguaje** | TypeScript | 5.x | Type safety |
| **Package Manager** | pnpm | Latest | Gestión de dependencias |
| **Hosting** | Cloudflare Pages | - | CDN + hosting |

### 3.2 Integraciones Astro

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [
    mdx(),           // Soporte MDX
    sitemap(),       // Generación automática de sitemap
    tailwind(),      // Integración Tailwind (vía Vite plugin)
  ],
});
```

### 3.3 Dependencias Clave

```json
{
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 4. Estructura de Directorios

### 4.1 Árbol de Proyecto

```
hallyulatino/
├── public/                    # Archivos estáticos (copiados as-is)
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/
│       ├── dramas/
│       ├── kpop/
│       └── og/
│
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── seo/
│   │   │   ├── SEOHead.astro
│   │   │   └── JsonLd.astro
│   │   └── ui/
│   │       ├── Card.astro
│   │       ├── Tag.astro
│   │       └── Breadcrumb.astro
│   │
│   ├── content/               # Content Collections
│   │   ├── config.ts          # Schemas de colecciones
│   │   ├── dramas/
│   │   │   └── *.mdx
│   │   ├── kpop/
│   │   │   └── *.mdx
│   │   ├── noticias/
│   │   │   └── *.mdx
│   │   └── guias/
│   │       └── *.mdx
│   │
│   ├── layouts/               # Layouts de página
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   │
│   ├── pages/                 # Rutas del sitio
│   │   ├── index.astro
│   │   ├── dramas/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── kpop/
│   │   ├── noticias/
│   │   └── guias/
│   │
│   ├── styles/
│   │   └── global.css         # Estilos globales + Tailwind
│   │
│   └── types/                 # Tipos TypeScript (futuro)
│       ├── content.ts
│       └── seo.ts
│
├── docs/                      # Documentación del proyecto
│   ├── api/
│   ├── architecture/
│   └── guides/
│
├── astro.config.mjs           # Configuración de Astro
├── tailwind.config.mjs        # Configuración de Tailwind
├── tsconfig.json              # Configuración de TypeScript
├── package.json
└── pnpm-lock.yaml
```

### 4.2 Responsabilidades por Directorio

| Directorio | Responsabilidad |
|------------|-----------------|
| `public/` | Assets estáticos que no necesitan procesamiento |
| `src/components/` | UI reutilizable, componentes SEO |
| `src/content/` | Todo el contenido MDX y schemas |
| `src/layouts/` | Estructuras de página reutilizables |
| `src/pages/` | Rutas y lógica de página |
| `src/styles/` | CSS global y configuración Tailwind |
| `docs/` | Documentación técnica del proyecto |

---

## 5. Flujo de Datos

### 5.1 Build Time Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD TIME                                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   MDX Files     │  src/content/**/*.mdx
│   (Contenido)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Content Config  │  src/content/config.ts
│ (Zod Schemas)   │  - Validación de frontmatter
└────────┬────────┘  - Type inference
         │
         ▼
┌─────────────────┐
│   getCollection │  Astro Content Collections API
│   getEntry      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Page Components│  src/pages/**/*.astro
│  (Astro)        │  - Fetch data en frontmatter
└────────┬────────┘  - Render en template
         │
         ▼
┌─────────────────┐
│  Static HTML    │  dist/**/*.html
│  (Output)       │  - Pre-renderizado
└─────────────────┘  - Optimizado
```

### 5.2 Content Query Flow

```typescript
// Ejemplo: src/pages/dramas/[...slug].astro

// 1. Define rutas estáticas
export async function getStaticPaths() {
  const dramas = await getCollection('dramas');
  return dramas.map((drama) => ({
    params: { slug: drama.slug },
    props: { drama },
  }));
}

// 2. Recibe props tipados
const { drama } = Astro.props;

// 3. Renderiza contenido MDX
const { Content } = await drama.render();
```

### 5.3 Request Flow (Runtime)

```
┌─────────────────────────────────────────────────────────────────┐
│                       RUNTIME (Usuario)                          │
└─────────────────────────────────────────────────────────────────┘
         │
         │  GET /dramas/goblin
         ▼
┌─────────────────┐
│ Cloudflare CDN  │  - Cache hit? → Serve from edge
│ (Edge)          │  - Cache miss? → Origin
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloudflare Pages│  - Serve static HTML
│ (Origin)        │  - Set cache headers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Static HTML    │  dist/dramas/goblin.html
│  (Pre-rendered) │  - No server processing
└─────────────────┘  - Inmediato
```

---

## 6. Componentes del Sistema

### 6.1 Componentes SEO

```
┌─────────────────────────────────────────────────────────────────┐
│                      SEO COMPONENTS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐      ┌─────────────────┐                 │
│   │    SEOHead      │      │     JsonLd      │                 │
│   │                 │      │                 │                 │
│   │ • <title>       │      │ • WebSite       │                 │
│   │ • meta tags     │      │ • Organization  │                 │
│   │ • Open Graph    │      │ • Article       │                 │
│   │ • Twitter Cards │      │ • BreadcrumbList│                 │
│   │ • canonical     │      │                 │                 │
│   └─────────────────┘      └─────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Layouts

```
┌─────────────────────────────────────────────────────────────────┐
│                        LAYOUTS                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                    BaseLayout                          │    │
│   │  ┌─────────────────────────────────────────────────┐  │    │
│   │  │ <head> SEOHead + global styles                  │  │    │
│   │  └─────────────────────────────────────────────────┘  │    │
│   │  ┌─────────────────────────────────────────────────┐  │    │
│   │  │ <header> Navigation                             │  │    │
│   │  └─────────────────────────────────────────────────┘  │    │
│   │  ┌─────────────────────────────────────────────────┐  │    │
│   │  │ <main> <slot /> (contenido de página)           │  │    │
│   │  └─────────────────────────────────────────────────┘  │    │
│   │  ┌─────────────────────────────────────────────────┐  │    │
│   │  │ <footer> Links + copyright                      │  │    │
│   │  └─────────────────────────────────────────────────┘  │    │
│   └───────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ extends                           │
│                              ▼                                   │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                  ArticleLayout                         │    │
│   │  • Breadcrumbs                                        │    │
│   │  • Hero image                                         │    │
│   │  • Article metadata (date, author, tags)              │    │
│   │  • Reading time                                       │    │
│   │  • Article schema (JSON-LD)                           │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Pages Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         PAGES                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   /                          Landing page                        │
│   │                                                              │
│   ├── /dramas                Listado de K-Dramas                │
│   │   └── /dramas/[slug]     Detalle de drama                   │
│   │                                                              │
│   ├── /kpop                  Listado de artistas                │
│   │   └── /kpop/[slug]       Perfil de artista                  │
│   │                                                              │
│   ├── /noticias              Listado de noticias                │
│   │   └── /noticias/[slug]   Detalle de noticia                 │
│   │                                                              │
│   └── /guias                 Listado de guías                   │
│       └── /guias/[slug]      Detalle de guía                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Estrategia de SEO

### 7.1 SEO Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SEO STRATEGY                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TECHNICAL SEO                                                   │
│  ├── Static HTML (100% crawleable)                              │
│  ├── Semantic HTML5 structure                                   │
│  ├── Mobile-first responsive design                             │
│  ├── Core Web Vitals optimized                                  │
│  └── HTTPS everywhere                                           │
│                                                                  │
│  ON-PAGE SEO                                                     │
│  ├── Title tags (max 60 chars)                                  │
│  ├── Meta descriptions (max 160 chars)                          │
│  ├── Heading hierarchy (H1 → H6)                                │
│  ├── Internal linking                                           │
│  └── Image alt texts                                            │
│                                                                  │
│  STRUCTURED DATA                                                 │
│  ├── WebSite schema (homepage)                                  │
│  ├── Organization schema                                        │
│  ├── Article schema (todos los artículos)                       │
│  └── BreadcrumbList schema                                      │
│                                                                  │
│  CRAWLABILITY                                                    │
│  ├── robots.txt (allow all, block admin)                        │
│  ├── XML Sitemap (auto-generated)                               │
│  ├── Canonical URLs                                             │
│  └── hreflang tags (es-MX, pt-BR)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 URL Structure

```
Estructura plana optimizada para SEO:

https://hallyulatino.com/dramas/goblin-guardian
                        ├──────┴────────────────┘
                        │
                        └── Categoría + slug descriptivo

✅ Bueno: /dramas/goblin-guardian-resena
✅ Bueno: /kpop/bts-perfil-completo
❌ Malo:  /dramas/2024/01/15/post-123
❌ Malo:  /content/type/dramas/id/456
```

### 7.3 Meta Tags Strategy

```html
<!-- Ejemplo de meta tags para un artículo de drama -->
<head>
  <!-- Primary -->
  <title>Goblin: El Guardián Solitario - Reseña | HallyuLatino</title>
  <meta name="description" content="Descubre por qué Goblin es uno de los mejores K-Dramas de fantasía. Reseña completa con sinopsis, elenco y dónde verlo.">

  <!-- Canonical -->
  <link rel="canonical" href="https://hallyulatino.com/dramas/goblin">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Goblin: El Guardián Solitario - Reseña">
  <meta property="og:description" content="...">
  <meta property="og:image" content="https://hallyulatino.com/images/dramas/goblin-og.jpg">
  <meta property="og:url" content="https://hallyulatino.com/dramas/goblin">
  <meta property="og:locale" content="es_MX">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Goblin: El Guardián Solitario - Reseña">

  <!-- i18n -->
  <link rel="alternate" hreflang="es" href="https://hallyulatino.com/dramas/goblin">
  <link rel="alternate" hreflang="pt" href="https://hallyulatino.com/pt/dramas/goblin">
  <link rel="alternate" hreflang="x-default" href="https://hallyulatino.com/dramas/goblin">
</head>
```

---

## 8. Estrategia de Contenido

### 8.1 Content Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   CONTENT COLLECTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐   Contenido principal, alto SEO value         │
│   │   DRAMAS    │   • Reseñas de K-Dramas                       │
│   │   (core)    │   • Keywords: "[nombre] reseña español"       │
│   └─────────────┘   • Objetivo: 40% del tráfico                 │
│                                                                  │
│   ┌─────────────┐   Perfiles de artistas                        │
│   │    KPOP     │   • Grupos e idols                            │
│   │   (core)    │   • Keywords: "[grupo] perfil miembros"       │
│   └─────────────┘   • Objetivo: 30% del tráfico                 │
│                                                                  │
│   ┌─────────────┐   Contenido actualidad                        │
│   │  NOTICIAS   │   • Trending topics                           │
│   │ (engagement)│   • Keywords: "[evento] noticias"             │
│   └─────────────┘   • Objetivo: 20% del tráfico                 │
│                                                                  │
│   ┌─────────────┐   Contenido evergreen                         │
│   │   GUÍAS     │   • Tutoriales y how-to                       │
│   │ (evergreen) │   • Keywords: "cómo ver kdramas", "aprender"  │
│   └─────────────┘   • Objetivo: 10% del tráfico                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Content Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT PIPELINE                              │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ 1. RESEARCH     │  • Keyword research
│                 │  • Competitor analysis
│                 │  • Content gap analysis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. WRITE        │  • MDX en src/content/
│                 │  • Seguir schema de colección
│                 │  • SEO copywriting
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. VALIDATE     │  • Zod schema validation
│                 │  • TypeScript type check
│                 │  • pnpm build (no errors)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. REVIEW       │  • PR review
│                 │  • SEO checklist
│                 │  • Content quality
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. PUBLISH      │  • Merge to main
│                 │  • Auto-deploy
│                 │  • Verify on production
└─────────────────┘
```

---

## 9. Infraestructura y Deploy

### 9.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT FLOW                               │
└─────────────────────────────────────────────────────────────────┘

  GitHub                Cloudflare Pages              Users
    │                         │                         │
    │  push to main           │                         │
    ├────────────────────────▶│                         │
    │                         │                         │
    │                    ┌────┴────┐                    │
    │                    │  Build  │                    │
    │                    │  pnpm   │                    │
    │                    │  build  │                    │
    │                    └────┬────┘                    │
    │                         │                         │
    │                    ┌────┴────┐                    │
    │                    │ Deploy  │                    │
    │                    │ to Edge │                    │
    │                    └────┬────┘                    │
    │                         │                         │
    │                         │  Static files served   │
    │                         ├────────────────────────▶│
    │                         │                         │
```

### 9.2 Cloudflare Pages Configuration

```yaml
# Build settings
Build command: pnpm build
Build output directory: dist
Root directory: /
Node.js version: 18

# Environment variables
# (No se requieren para build estático)

# Redirects (_redirects file)
# /old-path /new-path 301

# Headers (_headers file)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### 9.3 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHE LAYERS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: Browser Cache                                          │
│  ├── HTML: no-cache (siempre revalidar)                         │
│  ├── CSS/JS: 1 year (hashed filenames)                          │
│  └── Images: 1 year (immutable)                                  │
│                                                                  │
│  LAYER 2: Cloudflare Edge Cache                                  │
│  ├── HTML: Cache, revalidate on deploy                          │
│  ├── Assets: Long-term cache                                     │
│  └── Purge: Automatic on deploy                                  │
│                                                                  │
│  LAYER 3: Origin (Cloudflare Pages)                             │
│  └── Static files served directly                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Performance Targets

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| **LCP** | < 2.5s | Lighthouse |
| **FID** | < 100ms | Lighthouse |
| **CLS** | < 0.1 | Lighthouse |
| **TTFB** | < 200ms | WebPageTest |
| **Total Blocking Time** | < 200ms | Lighthouse |
| **Lighthouse Score** | > 90 | Lighthouse |

---

## 10. Decisiones Arquitectónicas

### 10.1 ADR-001: Astro como Framework

**Contexto**: Necesitamos un framework para sitio de contenido SEO-first.

**Decisión**: Usar Astro 5.x con Static Site Generation.

**Razones**:
- Zero JS by default (mejor performance)
- Content Collections con type safety
- Excelente DX para sitios de contenido
- Integraciones maduras (MDX, Sitemap, Tailwind)

**Alternativas consideradas**:
- Next.js: Overhead de React innecesario para contenido estático
- Eleventy: Menos type safety, ecosistema menor
- Hugo: Menos flexible, templating limitado

### 10.2 ADR-002: Cloudflare Pages para Hosting

**Contexto**: Necesitamos hosting para sitio estático con buen performance global.

**Decisión**: Usar Cloudflare Pages.

**Razones**:
- Tier gratuito generoso (unlimited bandwidth)
- Edge network global (buen latency en LATAM)
- Integración nativa con Cloudflare CDN
- Deploy automático desde GitHub

**Alternativas consideradas**:
- Vercel: Límites más restrictivos en free tier
- Netlify: Comparable pero menos edge locations en LATAM
- AWS S3 + CloudFront: Mayor complejidad de setup

### 10.3 ADR-003: Tailwind CSS para Estilos

**Contexto**: Necesitamos sistema de estilos mantenible y performant.

**Decisión**: Usar Tailwind CSS 4.x con Vite plugin.

**Razones**:
- Utility-first reduce CSS bundle size
- JIT compilation (solo CSS usado)
- Excelente integración con Astro
- Velocidad de desarrollo

**Alternativas consideradas**:
- CSS Modules: Más boilerplate
- Styled Components: Runtime overhead
- Plain CSS: Menos mantenible a escala

### 10.4 ADR-004: MDX para Contenido

**Contexto**: Necesitamos formato de contenido que balancee simplicidad con flexibilidad.

**Decisión**: Usar MDX con Content Collections.

**Razones**:
- Markdown familiar para editores
- Componentes para contenido rico
- Type safety con Zod schemas
- Git-friendly (versionable)

**Alternativas consideradas**:
- CMS Headless (Contentful, Sanity): Complejidad innecesaria, costo
- Pure Markdown: Menos flexible para contenido rico
- YAML/JSON: Peor DX para contenido largo

### 10.5 ADR-005: pnpm como Package Manager

**Contexto**: Necesitamos gestión de dependencias eficiente.

**Decisión**: Usar pnpm.

**Razones**:
- Espacio en disco eficiente (symlinks)
- Instalación más rápida que npm/yarn
- Strict mode previene phantom dependencies
- Cloudflare Pages lo soporta nativamente

---

## Diagrams Summary

### System Context

```
┌──────────────────────────────────────────────────────────┐
│                    HallyuLatino                           │
│                 (Static Content Site)                     │
│                                                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Dramas  │  │  K-Pop  │  │Noticias │  │  Guías  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
         │                                    ▲
         │ Hosted on                          │ Visits
         ▼                                    │
┌──────────────────┐                ┌──────────────────┐
│ Cloudflare Pages │                │     Users        │
│   + CDN Edge     │◀───────────────│  (LATAM + US)    │
└──────────────────┘                └──────────────────┘
         ▲
         │ Deploys from
         │
┌──────────────────┐
│   GitHub Repo    │
│ (Source + Content│
└──────────────────┘
```

---

## Referencias

- [Astro Documentation](https://docs.astro.build/)
- [Jamstack Architecture](https://jamstack.org/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Web.dev Performance](https://web.dev/performance/)
- [Schema.org](https://schema.org/)

---

*Documento mantenido por el equipo de HallyuLatino.*
