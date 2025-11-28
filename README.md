---
title: HallyuLatino - README
version: 1.0.0
status: Approved
owner: @hallyulatino-team
created: 2024-11-28
updated: 2024-11-28
---

# HallyuLatino

<p align="center">
  <strong>🇰🇷 Tu portal de K-Dramas, K-Pop y cultura coreana en español 🇲🇽</strong>
</p>

<p align="center">
  <a href="#inicio-rápido">Inicio Rápido</a> •
  <a href="#características">Características</a> •
  <a href="#documentación">Documentación</a> •
  <a href="#contribuir">Contribuir</a>
</p>

---

## Descripción

**HallyuLatino** es un portal de contenido estático optimizado para SEO, diseñado para la comunidad hispanohablante interesada en la cultura coreana. El sitio ofrece reseñas de K-Dramas, perfiles de artistas K-Pop, noticias y guías culturales.

### Objetivos

- **Audiencia**: Hispanohablantes en Latinoamérica y Estados Unidos
- **Contenido**: K-Dramas, K-Pop, noticias, guías culturales
- **Monetización**: Google AdSense → Mediavine
- **Meta**: 50,000 sesiones mensuales en 12 meses

---

## Tecnologías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Astro (SSG) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Content | MDX + Content Collections | - |
| Language | TypeScript | 5.x |
| Package Manager | pnpm | latest |
| Hosting | Cloudflare Pages | - |

---

## Inicio Rápido

### Prerrequisitos

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/Prometheus-P/hallyulatino.git
cd hallyulatino

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

El sitio estará disponible en `http://localhost:4321`

### Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo (localhost:4321) |
| `pnpm build` | Build de producción en `./dist/` |
| `pnpm preview` | Preview del build local |
| `pnpm check` | Verificar tipos TypeScript |

---

## Estructura del Proyecto

```
📦 hallyulatino/
├── 📄 CONTEXT.md              # Single Source of Truth
├── 📄 README.md               # Este archivo
├── 📄 ENVIRONMENT.md          # Configuración de entorno
├── 📄 plan.md                 # Plan de desarrollo TDD
│
├── 📁 public/                 # Archivos estáticos
│   ├── favicon.svg
│   ├── robots.txt
│   └── 📁 images/
│
├── 📁 src/
│   ├── 📁 components/         # Componentes reutilizables
│   │   ├── 📁 seo/            # SEOHead, JsonLd
│   │   └── 📁 ui/             # UI components
│   │
│   ├── 📁 content/            # Contenido MDX
│   │   ├── config.ts          # Schemas
│   │   ├── 📁 dramas/         # K-Dramas
│   │   ├── 📁 kpop/           # K-Pop
│   │   ├── 📁 noticias/       # Noticias
│   │   └── 📁 guias/          # Guías
│   │
│   ├── 📁 layouts/            # Layouts
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   │
│   ├── 📁 pages/              # Rutas
│   │   ├── index.astro
│   │   ├── 📁 dramas/
│   │   ├── 📁 kpop/
│   │   ├── 📁 noticias/
│   │   └── 📁 guias/
│   │
│   └── 📁 styles/
│       └── global.css
│
├── 📄 astro.config.mjs
├── 📄 package.json
└── 📄 tsconfig.json
```

---

## Características

### SEO Optimizado

- ✅ Static Site Generation (SSG) - HTML pre-renderizado
- ✅ Meta tags (Open Graph, Twitter Cards)
- ✅ Schema.org JSON-LD (Article, BreadcrumbList, WebSite, Organization)
- ✅ Sitemap automático (`/sitemap-index.xml`)
- ✅ robots.txt configurado
- ✅ Soporte i18n (es-MX, pt-BR)
- 🎯 Core Web Vitals optimizados

### Content Collections

4 tipos de contenido con schemas tipados:

| Colección | Descripción | Campos especiales |
|-----------|-------------|-------------------|
| `dramas` | Reseñas de K-Dramas | dramaTitle, network, cast, whereToWatch |
| `kpop` | Perfiles de artistas | artistName, agency, members |
| `noticias` | Noticias del momento | category, breaking, source |
| `guias` | Guías culturales | category, difficulty, readingTime |

### Diseño Responsive

- Mobile-first design
- Tailwind CSS utility classes
- Dark mode ready (futuro)

---

## Agregar Contenido

### Crear un K-Drama

```bash
# Crear archivo
touch src/content/dramas/nombre-del-drama.mdx
```

```mdx
---
title: "Título SEO (max 60 chars)"
description: "Descripción SEO (max 160 chars)"
pubDate: 2024-01-15
heroImage: "/images/dramas/nombre.jpg"
heroImageAlt: "Descripción de la imagen"
author: "HallyuLatino"
tags: ["romance", "comedia", "2024"]

# Campos específicos de drama
dramaTitle: "제목 (título en coreano)"
dramaYear: 2024
network: "tvN"
episodes: 16
genre: ["Romance", "Comedia"]
cast: ["Actor 1", "Actor 2"]
whereToWatch: ["Netflix", "Viki"]
---

## Sinopsis

Contenido del artículo en Markdown...

## Por qué verlo

- Punto 1
- Punto 2
```

### Crear un artista K-Pop

```mdx
---
title: "Nombre del Artista - Perfil Completo"
description: "Todo sobre Nombre del Artista..."
pubDate: 2024-01-15
artistName: "Nombre del Artista"
artistType: "grupo"
agency: "HYBE"
debutYear: 2020
members: ["Miembro 1", "Miembro 2"]
---

## Historia

...
```

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [CONTEXT.md](./CONTEXT.md) | Single Source of Truth del proyecto |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Configuración del entorno |
| [plan.md](./plan.md) | Plan de desarrollo TDD |

---

## Despliegue

### Cloudflare Pages

1. Conectar repositorio en [Cloudflare Pages](https://pages.cloudflare.com/)
2. Configurar:
   - **Build command**: `pnpm build`
   - **Build output**: `dist`
   - **Node.js version**: 18

### Variables de Entorno

No se requieren variables de entorno para el build (sitio 100% estático).

---

## Contribuir

### Workflow

1. Crear branch: `git checkout -b feat/nueva-funcionalidad`
2. Hacer cambios
3. Commit: `git commit -m "feat(scope): descripción"`
4. Push: `git push origin feat/nueva-funcionalidad`
5. Crear Pull Request

### Commit Convention

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, content
```

Ejemplos:
- `feat(dramas): add filtering by genre`
- `content(kpop): add BTS profile`
- `fix(seo): correct canonical URL`

---

## Roadmap

- [x] **v1.0** - Estructura base, layouts, SEO
- [ ] **v1.1** - 10+ artículos de contenido
- [ ] **v1.2** - Google Analytics + Search Console
- [ ] **v1.3** - Búsqueda interna
- [ ] **v2.0** - Google AdSense

---

## Licencia

MIT License - ver [LICENSE](./LICENSE)

---

## Enlaces

- **Producción**: https://hallyulatino.com
- **Repositorio**: https://github.com/Prometheus-P/hallyulatino
- **Issues**: https://github.com/Prometheus-P/hallyulatino/issues

---

<p align="center">
  Hecho con 💖 para la comunidad latina de K-Culture
</p>
