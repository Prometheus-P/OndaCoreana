// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  site: 'https://ondacorea.com',
  output: 'static',
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

  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-MX',
          pt: 'pt-BR',
        },
      },
    }),
    pagefind(), // Must be LAST integration
  ],

  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },

  compressHTML: true,
});
