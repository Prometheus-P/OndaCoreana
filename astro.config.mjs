// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import pagefind from 'astro-pagefind';

const SEARCH_ROUTE = '/buscar';

/**
 * Keystatic CMS Mode
 *
 * When KEYSTATIC_CMS=true, enables the Keystatic admin UI at /keystatic
 * This requires server mode which is incompatible with pagefind,
 * so we use conditional configuration.
 *
 * Usage:
 * - Development with CMS: KEYSTATIC_CMS=true pnpm dev
 * - Development without CMS: pnpm dev
 * - Production build: pnpm build (always static)
 */
const isCmsMode = process.env.KEYSTATIC_CMS === 'true';

// Conditional imports for CMS mode
const cmsConfig = isCmsMode
  ? await Promise.all([
      import('@keystatic/astro').then((m) => m.default),
      import('@astrojs/node').then((m) => m.default),
    ]).then(([keystatic, node]) => ({
      output: /** @type {const} */ ('server'),
      adapter: node({ mode: 'standalone' }),
      integrations: [keystatic()],
    }))
  : {
      output: /** @type {const} */ ('static'),
      adapter: undefined,
      integrations: [],
    };

// https://astro.build/config
export default defineConfig({
  site: 'https://ondacoreana.com',
  output: cmsConfig.output,
  adapter: cmsConfig.adapter,
  trailingSlash: 'never',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'pt'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  redirects: {
    '/search': SEARCH_ROUTE,
  },

  integrations: [
    react(),
    markdoc(),
    mdx(),
    ...cmsConfig.integrations,
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-MX',
          pt: 'pt-BR',
        },
      },
    }),
    // Pagefind only works in static mode
    ...(isCmsMode ? [] : [pagefind()]),
  ],

  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },

  compressHTML: true,
});
