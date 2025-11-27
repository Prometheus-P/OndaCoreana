# HallyuLatino

Portal de K-Dramas, K-Pop y cultura coreana en español para la comunidad latina.

## Tecnologías

- **Framework**: Astro 5.x (Static Site Generation)
- **Styling**: Tailwind CSS 4.x
- **Content**: Astro Content Collections (MDX)
- **Hosting**: Cloudflare Pages

## Estructura del Proyecto

```
/
├── public/
│   ├── images/          # Imágenes estáticas
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── seo/         # Componentes SEO (meta tags, JSON-LD)
│   │   └── ui/          # Componentes de UI
│   ├── content/
│   │   ├── dramas/      # Contenido de K-Dramas (MDX)
│   │   ├── kpop/        # Contenido de K-Pop (MDX)
│   │   ├── noticias/    # Noticias (MDX)
│   │   ├── guias/       # Guías (MDX)
│   │   └── config.ts    # Esquemas de Content Collections
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   └── pages/
│       ├── dramas/
│       ├── kpop/
│       ├── noticias/
│       ├── guias/
│       └── index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Comandos

| Comando | Acción |
|---------|--------|
| `pnpm install` | Instalar dependencias |
| `pnpm dev` | Iniciar servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Construir sitio para producción en `./dist/` |
| `pnpm preview` | Previsualizar build localmente |
| `pnpm check` | Verificar tipos TypeScript |

## Agregar Contenido

### K-Drama

Crear archivo en `src/content/dramas/nombre-del-drama.mdx`:

```mdx
---
title: "Título del artículo"
description: "Descripción SEO (max 160 caracteres)"
pubDate: 2024-01-01
dramaTitle: "제목"
dramaYear: 2024
network: "tvN"
episodes: 16
genre: ["Romance", "Drama"]
cast: ["Actor 1", "Actor 2"]
whereToWatch: ["Netflix"]
---

Contenido del artículo...
```

### K-Pop

Crear archivo en `src/content/kpop/nombre-artista.mdx`:

```mdx
---
title: "Título del artículo"
description: "Descripción SEO"
pubDate: 2024-01-01
artistName: "Nombre del artista"
artistType: "grupo" # solista | grupo | banda
agency: "Agencia"
debutYear: 2020
members: ["Miembro 1", "Miembro 2"]
---

Contenido del artículo...
```

## SEO

El proyecto incluye:

- Meta tags (title, description, og:*, twitter:*)
- Schema.org JSON-LD (Article, BreadcrumbList, WebSite, Organization)
- Sitemap automático
- robots.txt
- Soporte i18n (es-MX, pt-BR)

## Despliegue

El sitio está configurado para Cloudflare Pages:

1. Conectar repositorio a Cloudflare Pages
2. Build command: `pnpm build`
3. Build output directory: `dist`
4. Node.js version: 18+

## Licencia

MIT
