/**
 * Search Client Utilities
 *
 * Shared utility functions for search functionality.
 * These functions are used by both server-side (Astro) and client-side (script) code.
 */

// Re-export content type configuration from centralized config
export { contentTypeLabels, contentTypeStyles, getContentTypeLabel, getContentTypeStyles } from '../config/content-types';

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
