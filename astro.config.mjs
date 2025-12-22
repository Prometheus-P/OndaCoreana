// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import pagefind from 'astro-pagefind';
import node from '@astrojs/node';

const SEARCH_ROUTE = '/buscar';

/**
 * Hybrid Mode Configuration
 *
 * Astro 5.x uses static output with selective SSR (formerly "hybrid").
 * - Most pages are pre-rendered (static)
 * - Auth/dashboard pages use `export const prerender = false` for SSR
 * - Node adapter is always enabled for SSR pages
 *
 * Keystatic CMS Mode:
 * When KEYSTATIC_CMS=true, enables the Keystatic admin UI at /keystatic
 * This requires server mode for all pages.
 *
 * Usage:
 * - Development: pnpm dev
 * - Development with CMS: KEYSTATIC_CMS=true pnpm dev
 * - Production build: pnpm build
 */
const isCmsMode = process.env.KEYSTATIC_CMS === 'true';

// Conditional imports for CMS mode
const cmsConfig = isCmsMode
  ? await import('@keystatic/astro').then((m) => ({
      output: /** @type {const} */ ('server'),
      integrations: [m.default()],
    }))
  : {
      output: /** @type {const} */ ('static'),
      integrations: [],
    };

// https://astro.build/config
export default defineConfig({
  site: 'https://ondacoreana.com',
  output: cmsConfig.output,
  adapter: node({ mode: 'standalone' }),
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
