/**
 * Search Types for OndaCoreana Content Search
 */

// Re-export content type configuration from centralized config
export type { ContentType } from '../config/content-types';
export { contentTypeLabels, contentTypeStyles, getContentTypeLabel } from '../config/content-types';
import type { ContentType } from '../config/content-types';

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
