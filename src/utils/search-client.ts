/**
 * Search Client Utilities
 *
 * Shared utility functions for search functionality.
 * These functions are used by both server-side (Astro) and client-side (script) code.
 */

/**
 * Escape HTML special characters to prevent XSS
 * Uses regex replacement for universal compatibility (works in both browser and SSR)
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape regex special characters
 * Used when building dynamic RegExp from user input
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight query terms in text
 * Returns HTML string with matching terms wrapped in <mark> tags
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Content type labels for display
 */
export const contentTypeLabels: Record<string, string> = {
  dramas: 'K-Drama',
  kpop: 'K-Pop',
  noticias: 'Noticia',
  guias: 'Guía',
  all: 'Contenido',
};

/**
 * Content type badge styles
 */
export const contentTypeStyles: Record<string, { bg: string; color: string }> = {
  dramas: { bg: 'var(--md-color-primary-container)', color: 'var(--md-color-on-primary-container)' },
  kpop: { bg: 'var(--md-color-tertiary-container)', color: 'var(--md-color-on-tertiary-container)' },
  noticias: { bg: 'var(--md-color-secondary-container)', color: 'var(--md-color-on-secondary-container)' },
  guias: { bg: 'color-mix(in srgb, var(--md-color-tertiary) 15%, var(--md-color-surface-variant))', color: 'var(--md-color-on-surface)' },
  all: { bg: 'var(--md-color-surface-variant)', color: 'var(--md-color-on-surface-variant)' },
};
