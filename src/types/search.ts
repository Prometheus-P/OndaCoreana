/**
 * Search Types for OndaCorea Content Search
 */

// T008: ContentType enum
export type ContentType = 'all' | 'dramas' | 'kpop' | 'noticias' | 'guias';

// Content type labels in Spanish
export const contentTypeLabels: Record<ContentType, string> = {
  all: 'Todos',
  dramas: 'K-Dramas',
  kpop: 'K-Pop',
  noticias: 'Noticias',
  guias: 'Guías',
};

// T009: SearchResult interface
export interface SearchResult {
  /** Article title */
  title: string;
  /** Content snippet with query highlighted (~160 chars) */
  excerpt: string;
  /** Relative URL to article (e.g., "/dramas/goblin") */
  url: string;
  /** Collection type */
  contentType: ContentType;
  /** Article publication date */
  pubDate: Date;
  /** Hero image URL for result card */
  heroImage?: string;
  /** Pagefind relevance score (0-1) */
  relevanceScore: number;
}

// T010: SearchResultSet interface
export interface SearchResultSet {
  /** Array of matched articles */
  results: SearchResult[];
  /** Total matches (before pagination) */
  totalCount: number;
  /** Original search query */
  query: string;
  /** Applied filter */
  filter: ContentType;
  /** Whether more results exist */
  hasMore: boolean;
}

// SearchQuery interface
export interface SearchQuery {
  /** The search term (2-100 chars, trimmed) */
  query: string;
  /** Content type filter (default: "all") */
  filter?: ContentType;
  /** Current page for pagination (default: 1) */
  page?: number;
}
