# Data Model: Content Search

**Feature**: 001-content-search
**Date**: 2025-12-02

## Entities

### SearchQuery

Represents a user's search request.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| query | string | Yes | 2-100 chars, trimmed | The search term entered by user |
| filter | ContentType | No | Valid enum value | Content type filter (default: "all") |
| page | number | No | >= 1 | Current page for pagination (default: 1) |

**Validation Rules:**
- Query MUST contain at least 2 non-whitespace characters (FR-016)
- Query MUST be truncated at 100 characters with notification (FR-015)
- Query MUST be URL-encoded for shareability (FR-011)

### SearchResult

A single matched article from the search index.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Article title |
| excerpt | string | Yes | Content snippet (~160 chars) with query highlighted |
| url | string | Yes | Relative URL to article (e.g., "/dramas/goblin") |
| contentType | ContentType | Yes | Collection type (dramas, kpop, noticias, guias) |
| pubDate | Date | Yes | Article publication date |
| heroImage | string | No | Hero image URL for result card |
| relevanceScore | number | Yes | Pagefind relevance score (0-1) |

**Derived from Existing Content Collections:**
- Maps to `dramas`, `kpop`, `noticias`, `guias` collections
- Inherits validation from `src/content/config.ts` schemas

### SearchResultSet

Collection of search results with metadata.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| results | SearchResult[] | Yes | Array of matched articles |
| totalCount | number | Yes | Total matches (before pagination) |
| query | string | Yes | Original search query |
| filter | ContentType | Yes | Applied filter |
| hasMore | boolean | Yes | Whether more results exist |

**Pagination:**
- Initial load: 10 results (FR-014)
- Load more: 10 additional results per request
- `hasMore` indicates if additional results available

### ContentType (Enum)

Valid content type filter values.

| Value | Label (Spanish) | Description |
|-------|-----------------|-------------|
| all | Todos | All content types |
| dramas | K-Dramas | Korean drama reviews |
| kpop | K-Pop | Artist profiles |
| noticias | Noticias | News articles |
| guias | Guías | Cultural guides |

## Relationships

```
SearchQuery (1) ──────> (0..*) SearchResult
     │
     └── filter ──────> ContentType (enum)

SearchResult ──────> (1) Article (from content collection)
     │
     └── contentType ──> ContentType (enum)
```

## State Transitions

### Search Flow States

```
[Idle] ──(focus input)──> [Ready]
   │
[Ready] ──(type <2 chars)──> [Guidance] ──(type 2+ chars)──> [Searching]
   │
[Searching] ──(results found)──> [Results]
   │         ──(no results)──> [Empty]
   │
[Results] ──(apply filter)──> [Filtering] ──> [Results] or [Empty]
   │       ──(load more)──> [Loading More] ──> [Results]
   │       ──(clear)──> [Idle]
   │
[Empty] ──(modify query)──> [Searching]
        ──(clear)──> [Idle]
```

### State Descriptions

| State | UI Indication | User Actions Available |
|-------|---------------|------------------------|
| Idle | Empty search input | Focus, type |
| Ready | Input focused, no query | Type query |
| Guidance | "Enter at least 2 characters" | Continue typing |
| Searching | Loading spinner | Wait |
| Results | Result cards displayed | Filter, load more, click result |
| Empty | "No results" message | Modify query, clear filters |
| Filtering | Brief loading state | Wait |
| Loading More | Spinner at bottom | Scroll, wait |

## Index Schema

Pagefind automatically generates the search index. Custom metadata annotations:

```typescript
// Indexed fields (searched)
interface PagefindIndexedContent {
  title: string;        // data-pagefind-meta="title"
  description: string;  // data-pagefind-meta="description"
  body: string;         // data-pagefind-body (article content)
}

// Metadata fields (returned, not searched)
interface PagefindMetadata {
  contentType: ContentType;  // data-pagefind-meta="contentType"
  pubDate: string;           // data-pagefind-meta="pubDate"
  heroImage?: string;        // data-pagefind-meta="heroImage"
  url: string;               // Automatic from page URL
}
```

## Validation Summary

| Entity | Validation | Source |
|--------|------------|--------|
| SearchQuery.query | 2-100 chars, non-whitespace | FR-015, FR-016 |
| SearchQuery.filter | Valid ContentType enum | FR-009 |
| SearchResult.excerpt | Max ~160 chars | FR-013 |
| SearchResultSet.results | Max 10 per load | FR-014 |
| All text fields | Unicode (Spanish + Korean) | FR-006 |
