---
title: HallyuLatino - API Reference
version: 1.0.0
status: Approved
owner: "@hallyulatino-team"
created: 2024-11-28
updated: 2024-11-28
---

# API Reference

## Documento Info

| Campo | Valor |
|-------|-------|
| Versión | 1.0.0 |
| Última actualización | 2024-11-28 |
| Autor | HallyuLatino Team |
| Estado | Activo |

---

## Tabla de Contenidos

1. [Content Collections API](#1-content-collections-api)
2. [Component Props API](#2-component-props-api)
3. [Layout Props API](#3-layout-props-api)
4. [SEO Utilities API](#4-seo-utilities-api)
5. [Type Definitions](#5-type-definitions)

---

## 1. Content Collections API

HallyuLatino utiliza Astro Content Collections para gestionar contenido tipado.

### 1.1 Colecciones Disponibles

| Colección | Descripción | Ruta |
|-----------|-------------|------|
| `dramas` | Reseñas de K-Dramas | `src/content/dramas/` |
| `kpop` | Perfiles de artistas K-Pop | `src/content/kpop/` |
| `noticias` | Noticias de actualidad | `src/content/noticias/` |
| `guias` | Guías culturales | `src/content/guias/` |

### 1.2 Schema Base

Todos los artículos heredan del schema base:

```typescript
// src/content/config.ts
const baseArticleSchema = z.object({
  title: z.string().max(60),           // SEO title (max 60 chars)
  description: z.string().max(160),     // Meta description (max 160 chars)
  pubDate: z.coerce.date(),             // Fecha de publicación
  updatedDate: z.coerce.date().optional(), // Última actualización
  heroImage: z.string().optional(),     // URL de imagen principal
  heroImageAlt: z.string().optional(),  // Alt text de imagen
  author: z.string().default('HallyuLatino'), // Autor
  tags: z.array(z.string()).default([]), // Etiquetas
  draft: z.boolean().default(false),    // Borrador (no se publica)
});
```

### 1.3 Dramas Collection

```typescript
// Schema
const dramas = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    dramaTitle: z.string(),              // Título original del drama
    dramaYear: z.number().optional(),    // Año de emisión
    network: z.string().optional(),      // Canal (tvN, JTBC, Netflix)
    episodes: z.number().optional(),     // Número de episodios
    genre: z.array(z.string()).default([]), // Géneros
    cast: z.array(z.string()).default([]),  // Elenco principal
    whereToWatch: z.array(z.string()).default([]), // Plataformas
  }),
});
```

#### Ejemplo de Uso

```astro
---
// src/pages/dramas/[...slug].astro
import { getCollection, getEntry } from 'astro:content';

// Obtener todos los dramas (no borradores)
const allDramas = await getCollection('dramas', ({ data }) => {
  return data.draft !== true;
});

// Obtener un drama específico
const drama = await getEntry('dramas', 'goblin-guardian');

// Acceder a los datos tipados
const { title, dramaTitle, network, cast } = drama.data;
---
```

#### Frontmatter Ejemplo

```yaml
---
title: "Goblin: El Guardián Solitario - Reseña Completa"
description: "Descubre por qué Goblin es considerado uno de los mejores K-Dramas de fantasía romántica de todos los tiempos."
pubDate: 2024-01-15
heroImage: "/images/dramas/goblin.jpg"
heroImageAlt: "Poster oficial de Goblin con Gong Yoo"
tags: ["fantasía", "romance", "2016"]

dramaTitle: "쓸쓸하고 찬란하神-도깨비"
dramaYear: 2016
network: "tvN"
episodes: 16
genre: ["Fantasía", "Romance", "Drama"]
cast: ["Gong Yoo", "Kim Go-eun", "Lee Dong-wook"]
whereToWatch: ["Netflix", "Viki"]
---
```

### 1.4 K-Pop Collection

```typescript
// Schema
const kpop = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    artistName: z.string(),              // Nombre del artista/grupo
    artistType: z.enum(['solista', 'grupo', 'banda']).default('grupo'),
    agency: z.string().optional(),       // Agencia (HYBE, SM, JYP)
    debutYear: z.number().optional(),    // Año de debut
    members: z.array(z.string()).optional(), // Miembros (si es grupo)
  }),
});
```

#### Ejemplo de Uso

```astro
---
import { getCollection } from 'astro:content';

// Obtener todos los grupos
const grupos = await getCollection('kpop', ({ data }) => {
  return data.artistType === 'grupo' && !data.draft;
});

// Filtrar por agencia
const hybeArtists = await getCollection('kpop', ({ data }) => {
  return data.agency === 'HYBE';
});
---
```

### 1.5 Noticias Collection

```typescript
// Schema
const noticias = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    category: z.enum(['drama', 'kpop', 'cine', 'cultura', 'general']),
    breaking: z.boolean().default(false), // Noticia urgente
    source: z.string().optional(),        // Fuente original
  }),
});
```

#### Categorías Disponibles

| Categoría | Descripción |
|-----------|-------------|
| `drama` | Noticias sobre K-Dramas |
| `kpop` | Noticias sobre K-Pop |
| `cine` | Noticias sobre cine coreano |
| `cultura` | Noticias culturales generales |
| `general` | Otras noticias del Hallyu |

### 1.6 Guías Collection

```typescript
// Schema
const guias = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    category: z.enum(['streaming', 'viaje', 'idioma', 'cultura', 'general']),
    difficulty: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
    readingTime: z.number().optional(),  // Tiempo de lectura en minutos
  }),
});
```

### 1.7 Métodos de Content Collections

```typescript
// Importar funciones
import { getCollection, getEntry, getEntries } from 'astro:content';

// getCollection - Obtener todos los entries de una colección
const allPosts = await getCollection('dramas');
const publishedPosts = await getCollection('dramas', ({ data }) => {
  return data.draft !== true;
});

// getEntry - Obtener un entry específico por slug
const post = await getEntry('dramas', 'mi-drama');

// getEntries - Obtener múltiples entries por referencia
const relatedPosts = await getEntries([
  { collection: 'dramas', slug: 'drama-1' },
  { collection: 'dramas', slug: 'drama-2' },
]);

// Renderizar contenido MDX
const { Content, headings } = await post.render();
```

---

## 2. Component Props API

### 2.1 SEOHead Component

**Ubicación**: `src/components/seo/SEOHead.astro`

```typescript
interface Props {
  title: string;           // Título de la página (requerido)
  description: string;     // Meta description (requerido)
  image?: string;          // URL de imagen OG (opcional)
  imageAlt?: string;       // Alt text de imagen OG (opcional)
  type?: 'website' | 'article'; // Tipo de página (default: 'website')
  publishedTime?: Date;    // Fecha de publicación (para artículos)
  modifiedTime?: Date;     // Fecha de modificación (para artículos)
  author?: string;         // Autor del artículo (opcional)
  tags?: string[];         // Tags/keywords (opcional)
  noindex?: boolean;       // Bloquear indexación (default: false)
  canonical?: string;      // URL canónica personalizada (opcional)
}
```

#### Ejemplo de Uso

```astro
---
import SEOHead from '@/components/seo/SEOHead.astro';
---

<head>
  <SEOHead
    title="Goblin: Reseña Completa"
    description="Todo sobre el K-Drama Goblin..."
    image="/images/dramas/goblin-og.jpg"
    imageAlt="Poster de Goblin"
    type="article"
    publishedTime={new Date('2024-01-15')}
    author="HallyuLatino"
    tags={['goblin', 'kdrama', 'fantasia']}
  />
</head>
```

#### Output Generado

```html
<title>Goblin: Reseña Completa | HallyuLatino</title>
<meta name="description" content="Todo sobre el K-Drama Goblin...">
<link rel="canonical" href="https://hallyulatino.com/dramas/goblin">

<!-- Open Graph -->
<meta property="og:title" content="Goblin: Reseña Completa">
<meta property="og:description" content="Todo sobre el K-Drama Goblin...">
<meta property="og:image" content="https://hallyulatino.com/images/dramas/goblin-og.jpg">
<meta property="og:type" content="article">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Goblin: Reseña Completa">
```

### 2.2 JsonLd Component

**Ubicación**: `src/components/seo/JsonLd.astro`

```typescript
interface Props {
  type: 'WebSite' | 'Organization' | 'Article' | 'BreadcrumbList';
  data: WebSiteData | OrganizationData | ArticleData | BreadcrumbData;
}

// WebSite Schema
interface WebSiteData {
  name: string;
  url: string;
  description?: string;
  potentialAction?: SearchAction;
}

// Organization Schema
interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];  // Links a redes sociales
}

// Article Schema
interface ArticleData {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;  // ISO 8601
  dateModified?: string;  // ISO 8601
  author: {
    name: string;
    url?: string;
  };
}

// BreadcrumbList Schema
interface BreadcrumbData {
  items: Array<{
    name: string;
    url: string;
  }>;
}
```

#### Ejemplo de Uso

```astro
---
import JsonLd from '@/components/seo/JsonLd.astro';
---

<!-- Article Schema -->
<JsonLd
  type="Article"
  data={{
    headline: "Goblin: Reseña Completa",
    description: "Todo sobre el K-Drama Goblin...",
    image: "https://hallyulatino.com/images/goblin.jpg",
    datePublished: "2024-01-15T00:00:00Z",
    dateModified: "2024-01-20T00:00:00Z",
    author: {
      name: "HallyuLatino",
      url: "https://hallyulatino.com"
    }
  }}
/>

<!-- Breadcrumb Schema -->
<JsonLd
  type="BreadcrumbList"
  data={{
    items: [
      { name: "Inicio", url: "https://hallyulatino.com" },
      { name: "Dramas", url: "https://hallyulatino.com/dramas" },
      { name: "Goblin", url: "https://hallyulatino.com/dramas/goblin" }
    ]
  }}
/>
```

---

## 3. Layout Props API

### 3.1 BaseLayout

**Ubicación**: `src/layouts/BaseLayout.astro`

```typescript
interface Props {
  title: string;           // Título de la página
  description: string;     // Meta description
  image?: string;          // Imagen OG
  type?: 'website' | 'article';
}
```

#### Slots Disponibles

| Slot | Descripción |
|------|-------------|
| `default` | Contenido principal de la página |
| `head` | Elementos adicionales en `<head>` |

#### Ejemplo de Uso

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---

<BaseLayout
  title="K-Dramas"
  description="Las mejores reseñas de K-Dramas en español"
>
  <Fragment slot="head">
    <link rel="preconnect" href="https://fonts.googleapis.com">
  </Fragment>

  <main>
    <h1>K-Dramas</h1>
    <!-- Contenido -->
  </main>
</BaseLayout>
```

### 3.2 ArticleLayout

**Ubicación**: `src/layouts/ArticleLayout.astro`

```typescript
interface Props {
  title: string;           // Título del artículo
  description: string;     // Meta description
  pubDate: Date;           // Fecha de publicación
  updatedDate?: Date;      // Fecha de actualización
  heroImage?: string;      // Imagen principal
  heroImageAlt?: string;   // Alt text de imagen
  author?: string;         // Autor
  tags?: string[];         // Tags del artículo
  readingTime?: number;    // Tiempo de lectura (minutos)
  breadcrumbs: Array<{     // Migas de pan
    name: string;
    url: string;
  }>;
}
```

#### Ejemplo de Uso

```astro
---
import ArticleLayout from '@/layouts/ArticleLayout.astro';
---

<ArticleLayout
  title="Goblin: Reseña Completa"
  description="Todo sobre Goblin..."
  pubDate={new Date('2024-01-15')}
  heroImage="/images/dramas/goblin.jpg"
  heroImageAlt="Poster de Goblin"
  author="HallyuLatino"
  tags={['fantasía', 'romance']}
  readingTime={8}
  breadcrumbs={[
    { name: 'Inicio', url: '/' },
    { name: 'Dramas', url: '/dramas' },
    { name: 'Goblin', url: '/dramas/goblin' }
  ]}
>
  <article>
    <!-- Contenido del artículo -->
  </article>
</ArticleLayout>
```

---

## 4. SEO Utilities API

### 4.1 Funciones de Formateo

```typescript
// src/utils/seo.ts (futuro)

/**
 * Genera slug URL-friendly desde texto
 */
function slugify(text: string): string;

/**
 * Trunca texto para meta description
 */
function truncateDescription(text: string, maxLength?: number): string;

/**
 * Formatea fecha para Schema.org (ISO 8601)
 */
function formatDateISO(date: Date): string;

/**
 * Calcula tiempo de lectura estimado
 */
function calculateReadingTime(content: string): number;
```

### 4.2 Constantes SEO

```typescript
// src/config/seo.ts (futuro)

export const SEO_CONFIG = {
  siteName: 'HallyuLatino',
  siteUrl: 'https://hallyulatino.com',
  defaultLocale: 'es-MX',
  defaultAuthor: 'HallyuLatino',
  twitterHandle: '@hallyulatino',

  // Límites
  titleMaxLength: 60,
  descriptionMaxLength: 160,

  // Imágenes por defecto
  defaultOgImage: '/images/og-default.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
};
```

---

## 5. Type Definitions

### 5.1 Content Types

```typescript
// src/types/content.ts

import type { CollectionEntry } from 'astro:content';

// Tipos de entrada por colección
export type DramaEntry = CollectionEntry<'dramas'>;
export type KpopEntry = CollectionEntry<'kpop'>;
export type NoticiaEntry = CollectionEntry<'noticias'>;
export type GuiaEntry = CollectionEntry<'guias'>;

// Unión de todos los tipos de contenido
export type ContentEntry = DramaEntry | KpopEntry | NoticiaEntry | GuiaEntry;

// Datos de frontmatter (sin contenido MDX)
export type DramaData = DramaEntry['data'];
export type KpopData = KpopEntry['data'];
export type NoticiaData = NoticiaEntry['data'];
export type GuiaData = GuiaEntry['data'];
```

### 5.2 SEO Types

```typescript
// src/types/seo.ts

export interface MetaTags {
  title: string;
  description: string;
  canonical: string;
  openGraph: OpenGraphTags;
  twitter: TwitterTags;
}

export interface OpenGraphTags {
  title: string;
  description: string;
  type: 'website' | 'article';
  url: string;
  image?: string;
  imageAlt?: string;
  siteName: string;
  locale: string;
}

export interface TwitterTags {
  card: 'summary' | 'summary_large_image';
  title: string;
  description: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface JsonLdArticle {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
}
```

### 5.3 Navigation Types

```typescript
// src/types/navigation.ts

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  external?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}
```

---

## 6. Astro Built-in APIs

### 6.1 Astro Global

```typescript
// Disponible en archivos .astro
const {
  props,      // Props pasados al componente
  params,     // Parámetros de ruta dinámica
  request,    // Request object
  cookies,    // Cookies API
  url,        // URL actual
  redirect,   // Función de redirección
  slots,      // Slots disponibles
} = Astro;
```

### 6.2 getStaticPaths

```typescript
// Para rutas dinámicas [slug].astro o [...slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('dramas');

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
```

### 6.3 Environment Variables

```typescript
// Acceso a variables de entorno
const siteUrl = import.meta.env.SITE;        // URL del sitio
const mode = import.meta.env.MODE;           // 'development' | 'production'
const isProd = import.meta.env.PROD;         // boolean
const isDev = import.meta.env.DEV;           // boolean

// Variables personalizadas (prefijo PUBLIC_)
const apiKey = import.meta.env.PUBLIC_API_KEY;
```

---

## 7. Integrations API

### 7.1 Sitemap Integration

```typescript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hallyulatino.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-MX',
          pt: 'pt-BR',
        },
      },
      filter: (page) => !page.includes('/admin/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
```

**Output**: `/sitemap-index.xml` con sitemaps por sección

### 7.2 MDX Integration

```typescript
// astro.config.mjs
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
      },
      remarkPlugins: [],
      rehypePlugins: [],
    }),
  ],
});
```

### 7.3 Tailwind Integration

```typescript
// astro.config.mjs
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    tailwind({
      configFile: './tailwind.config.mjs',
      applyBaseStyles: true,
    }),
  ],
});
```

---

## Quick Reference

### Content Collections Cheatsheet

```typescript
// Obtener colección
const posts = await getCollection('dramas');

// Filtrar colección
const published = await getCollection('dramas', ({ data }) => !data.draft);

// Obtener entrada
const post = await getEntry('dramas', 'slug');

// Renderizar MDX
const { Content, headings } = await post.render();

// Acceder a datos
const { title, description, tags } = post.data;
```

### Component Import Paths

```typescript
// Usando alias @/
import SEOHead from '@/components/seo/SEOHead.astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
```

---

## Referencias

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Component Props](https://docs.astro.build/en/basics/astro-components/#component-props)
- [Schema.org Article](https://schema.org/Article)
- [Open Graph Protocol](https://ogp.me/)

---

*Documento mantenido por el equipo de HallyuLatino.*
