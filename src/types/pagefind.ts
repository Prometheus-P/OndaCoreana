/**
 * Pagefind Type Definitions
 *
 * Type definitions for the Pagefind search library.
 * These types are based on Pagefind's JavaScript API.
 * @see https://pagefind.app/docs/js-api/
 */

/**
 * Pagefind search result metadata
 */
export interface PagefindResultMeta {
  /** Page title from <title> or data-pagefind-meta="title" */
  title?: string;
  /** Page description */
  description?: string;
  /** Content type (custom meta) */
  contentType?: string;
  /** Publication date (custom meta) */
  pubDate?: string;
  /** Hero image URL (custom meta) */
  heroImage?: string;
  /** Any other custom metadata */
  [key: string]: string | undefined;
}

/**
 * Pagefind result data (loaded via result.data())
 */
export interface PagefindResultData {
  /** Page URL */
  url: string;
  /** Highlighted excerpt containing the search term */
  excerpt: string;
  /** Page metadata */
  meta: PagefindResultMeta;
  /** Full content (if loaded) */
  content?: string;
  /** Word count */
  word_count?: number;
  /** Filter values */
  filters?: Record<string, string[]>;
  /** Anchor IDs found on the page */
  anchors?: Array<{
    element: string;
    id: string;
    text: string;
  }>;
  /** Sub-results for heading sections */
  sub_results?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
}

/**
 * A single Pagefind search result (before loading data)
 */
export interface PagefindResult {
  /** Unique result identifier */
  id: string;
  /** Relevance score (0-1, higher is more relevant) */
  score: number;
  /** Array of matched words */
  words: number[];
  /** Load the full result data */
  data: () => Promise<PagefindResultData>;
}

/**
 * Pagefind search response
 */
export interface PagefindSearchResponse {
  /** Array of search results */
  results: PagefindResult[];
  /** Whether there may be more results (for unbounded searches) */
  unfilteredResultCount?: number;
  /** Filter counts for faceted search */
  filters?: Record<string, Record<string, number>>;
  /** Total count of results */
  totalFilters?: Record<string, number>;
  /** Time taken to search (ms) */
  timings?: {
    preload?: number;
    search?: number;
    total?: number;
  };
}

/**
 * Pagefind search options
 */
export interface PagefindSearchOptions {
  /** Filter results by metadata values */
  filters?: Record<string, string | string[]>;
  /** Sort results by a metadata field */
  sort?: Record<string, 'asc' | 'desc'>;
}

/**
 * Pagefind instance (main API)
 */
export interface PagefindInstance {
  /** Initialize Pagefind (must be called before search) */
  init: () => Promise<void>;
  /** Perform a search */
  search: (query: string, options?: PagefindSearchOptions) => Promise<PagefindSearchResponse>;
  /** Preload search index for faster searches */
  preload: (query: string) => Promise<void>;
  /** Set custom base path for the index */
  options: (opts: { basePath?: string; bundlePath?: string }) => Promise<void>;
  /** Destroy the instance */
  destroy: () => Promise<void>;
}
