/**
 * Search Result Renderer Utilities
 *
 * HTML template functions for rendering search results.
 * Used by buscar.astro for client-side rendering.
 */

import { escapeHtml, highlightMatch, contentTypeLabels } from './search-client';

/**
 * Search result type (simplified for rendering)
 */
export interface SearchResultItem {
  title: string;
  excerpt: string;
  url: string;
  contentType: string;
  pubDate: Date;
  heroImage?: string;
}

/**
 * Render loading spinner state
 */
export function renderLoadingState(): string {
  return `
    <div id="search-loading" class="py-12 text-center">
      <svg class="mx-auto h-8 w-8 animate-spin" viewBox="0 0 24 24" style="color: var(--md-color-primary);">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p style="margin-top: var(--md-spacing-sm); color: var(--md-color-on-surface-variant);">Buscando...</p>
    </div>
  `;
}

/**
 * Render empty state (no query entered)
 */
export function renderEmptyState(): string {
  return `
    <div class="search-empty" style="text-align: center;">
      <svg class="mx-auto h-12 w-12" style="color: var(--md-color-on-surface-variant);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h2 style="margin-top: var(--md-spacing-sm); font-size: var(--md-typo-title-medium-size); color: var(--md-color-on-surface);">
        ¿Qué quieres encontrar?
      </h2>
      <p style="margin-top: var(--md-spacing-xs); color: var(--md-color-on-surface-variant);">
        Usa el campo de búsqueda para encontrar K-Dramas, artistas de K-Pop, noticias y guías sobre cultura coreana.
      </p>
    </div>
  `;
}

/**
 * Render minimum length warning
 */
export function renderMinLengthWarning(): string {
  return `
    <div class="search-empty">
      <p>Por favor ingresa al menos 2 caracteres para buscar.</p>
    </div>
  `;
}

/**
 * Render error state
 */
export function renderErrorState(): string {
  return `
    <div class="search-empty" role="status">
      <h3>Error al cargar los resultados</h3>
      <p>Por favor intenta de nuevo más tarde.</p>
    </div>
  `;
}

/**
 * Render load more button
 */
export function renderLoadMoreButton(): string {
  return `
    <button
      id="load-more-btn"
      class="btn btn--outline"
      style="width: 100%;"
      data-testid="load-more-btn"
    >
      Cargar más resultados
    </button>
  `;
}

/**
 * Render no results state
 */
export function renderNoResults(query: string): string {
  return `
    <section class="search-results">
      <p class="result-count" data-testid="result-count">
        0 resultados para "${escapeHtml(query)}"
      </p>
      <div class="search-empty" data-testid="no-results">
        <h3>No se encontraron resultados</h3>
        <p>
          No encontramos artículos que coincidan con "${escapeHtml(query)}".
          Intenta con otros términos de búsqueda.
        </p>
        <div style="margin-top: var(--md-spacing-sm); text-align: left;">
          <p class="result-count">Sugerencias:</p>
          <ul style="margin-top: var(--md-spacing-xs); color: var(--md-color-on-surface-variant); padding-left: var(--md-spacing-lg); list-style: disc;">
            <li>Verifica la ortografía</li>
            <li>Usa palabras más generales</li>
            <li>Prueba con menos palabras clave</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

/**
 * Render a single result card
 */
export function renderResultCard(result: SearchResultItem, query: string): string {
  const typeLabel = contentTypeLabels[result.contentType] || result.contentType;

  const formattedDate = result.pubDate.toLocaleDateString('es-419', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const highlightedExcerpt = highlightMatch(result.excerpt, query);
  const highlightedTitle = highlightMatch(result.title, query);

  const heroImageHtml = result.heroImage ? `
    <div class="hidden sm:block search-result-card__media" aria-hidden="true">
      <img
        src="${escapeHtml(result.heroImage)}"
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  ` : '';

  return `
    <article class="search-result-card" data-testid="search-result-card">
      <a href="${escapeHtml(result.url)}" class="search-result-card__link">
        ${heroImageHtml}
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2" style="margin-bottom: var(--md-spacing-xs);">
            <span
              class="search-result-chip"
              data-testid="result-type"
              data-variant="${result.contentType}"
            >
              ${typeLabel}
            </span>
          </div>
          <h3 class="search-result-title" data-testid="result-title">
            ${highlightedTitle}
          </h3>
          <p class="search-result-excerpt" data-testid="result-excerpt">
            ${highlightedExcerpt}
          </p>
          <time
            datetime="${result.pubDate.toISOString()}"
            class="search-result-date"
            data-testid="result-date"
          >
            ${formattedDate}
          </time>
        </div>
      </a>
    </article>
  `;
}

/**
 * Render full search results section
 */
export function renderSearchResults(
  results: SearchResultItem[],
  totalCount: number,
  query: string,
  hasMore: boolean = false
): string {
  const resultMessage = totalCount === 1
    ? `1 resultado para "${escapeHtml(query)}"`
    : `${totalCount} resultados para "${escapeHtml(query)}"`;

  const loadMoreHtml = hasMore ? `
    <div id="load-more-container">
      ${renderLoadMoreButton()}
    </div>
  ` : '';

  return `
    <section class="search-results" data-testid="search-results">
      <p class="result-count" data-testid="result-count">
        ${resultMessage}
      </p>
      <div class="space-y-4">
        ${results.map(result => renderResultCard(result, query)).join('')}
      </div>
      ${loadMoreHtml}
    </section>
  `;
}
