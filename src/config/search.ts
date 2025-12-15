/**
 * Search Configuration
 *
 * Centralized configuration for search filters and options.
 */

import type { ContentType } from './content-types';

/**
 * Search filter definition
 */
export interface SearchFilter {
  type: ContentType;
  label: string;
  testId: string;
}

/**
 * Search filter options
 */
export const searchFilters: SearchFilter[] = [
  { type: 'all', label: 'Todos', testId: 'filter-all' },
  { type: 'dramas', label: 'K-Dramas', testId: 'filter-dramas' },
  { type: 'kpop', label: 'K-Pop', testId: 'filter-kpop' },
  { type: 'noticias', label: 'Noticias', testId: 'filter-noticias' },
  { type: 'guias', label: 'Guías', testId: 'filter-guias' },
];

/**
 * Get filter by type
 */
export function getSearchFilter(type: ContentType): SearchFilter | undefined {
  return searchFilters.find((f) => f.type === type);
}
