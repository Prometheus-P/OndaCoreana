# Search Component Contracts

**Feature**: 001-content-search
**Date**: 2025-12-02

## Components Overview

```
┌─────────────────────────────────────────────────────────────┐
│ BaseLayout.astro (header)                                   │
│  └── SearchInput                                            │
│       ├── on:focus → Load Pagefind                          │
│       ├── on:input → Trigger search (debounced)             │
│       └── on:submit → Navigate to /buscar?q=...             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ /buscar (SearchResultsPage)                                 │
│  ├── SearchInput (pre-filled from URL)                      │
│  ├── SearchFilters                                          │
│  │    └── on:filter-change → Update results                 │
│  └── SearchResults                                          │
│       ├── SearchResultCard (×N)                             │
│       └── LoadMoreButton                                    │
└─────────────────────────────────────────────────────────────┘
```

## SearchInput

**Location**: `src/components/search/SearchInput.astro`

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| initialQuery | string | No | "" | Pre-filled query (from URL param) |
| placeholder | string | No | "Buscar..." | Input placeholder text |
| showInlineResults | boolean | No | false | Show dropdown results (P2 real-time) |
| class | string | No | "" | Additional CSS classes |

### Events (Client-side)

| Event | Payload | Description |
|-------|---------|-------------|
| search | { query: string } | Fired on submit or debounced input |
| focus | void | Fired when input receives focus |
| clear | void | Fired when query is cleared |

### Behavior

1. On focus: Lazy-load Pagefind JS if not loaded
2. On input (2+ chars): Debounce 300ms, then emit `search`
3. On input (<2 chars): Show guidance message
4. On submit (Enter): Navigate to `/buscar?q={query}`
5. On clear (X button): Reset input, emit `clear`

### Accessibility

- `role="search"` on container
- `aria-label="Buscar contenido"`
- `aria-describedby` for guidance messages
- Keyboard: Enter submits, Escape clears

---

## SearchFilters

**Location**: `src/components/search/SearchFilters.astro`

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| activeFilter | ContentType | No | "all" | Currently selected filter |
| resultCounts | Record<ContentType, number> | No | {} | Result count per type |

### Events (Client-side)

| Event | Payload | Description |
|-------|---------|-------------|
| filter-change | { filter: ContentType } | Fired when filter selection changes |

### Filter Options

| Value | Label | Icon (optional) |
|-------|-------|-----------------|
| all | Todos | — |
| dramas | K-Dramas | 🎬 |
| kpop | K-Pop | 🎤 |
| noticias | Noticias | 📰 |
| guias | Guías | 📖 |

### Behavior

1. Render as horizontal tab/pill buttons
2. Show result count badge on each filter
3. Disable filters with 0 results (visually muted)
4. On click: Update URL param `?q=...&type={filter}`, emit event

### Accessibility

- `role="tablist"` on container
- `role="tab"` on each filter button
- `aria-selected` for active filter
- Keyboard: Arrow keys navigate, Enter selects

---

## SearchResults

**Location**: `src/components/search/SearchResults.astro`

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| results | SearchResult[] | Yes | — | Array of search results |
| totalCount | number | Yes | — | Total matches |
| query | string | Yes | — | Search query (for highlighting) |
| hasMore | boolean | No | false | Show load more button |
| isLoading | boolean | No | false | Show loading state |

### Events (Client-side)

| Event | Payload | Description |
|-------|---------|-------------|
| load-more | void | Fired when user requests more results |

### Slots

| Slot | Description |
|------|-------------|
| empty | Custom empty state (default: "No se encontraron resultados") |
| loading | Custom loading state (default: spinner) |

### Behavior

1. Display result count: "X resultados para '{query}'"
2. Render SearchResultCard for each result
3. Show LoadMore button if `hasMore` is true
4. On LoadMore click: Emit `load-more`, show loading state

---

## SearchResultCard

**Location**: `src/components/search/SearchResultCard.astro`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| result | SearchResult | Yes | The search result to display |
| query | string | Yes | Query for excerpt highlighting |

### Rendered Content

```html
<article class="search-result-card">
  <a href="{result.url}">
    <img src="{result.heroImage}" alt="" loading="lazy" /> <!-- if exists -->
    <div class="content">
      <span class="content-type">{contentTypeLabel}</span>
      <h3 class="title">{result.title}</h3>
      <p class="excerpt">{highlightedExcerpt}</p>
      <time class="date">{formattedDate}</time>
    </div>
  </a>
</article>
```

### Behavior

1. Highlight query terms in excerpt using `<mark>` tags
2. Format date in Spanish locale (e.g., "15 de enero de 2025")
3. Show content type badge with appropriate color
4. Lazy-load hero image

---

## /buscar Page

**Location**: `src/pages/buscar.astro`

### URL Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | No | Search query |
| type | ContentType | No | Content type filter (default: "all") |

### SEO Meta Tags

```html
<title>Buscar: {query} | OndaCorea</title>
<meta name="description" content="Resultados de búsqueda para '{query}' en OndaCorea" />
<meta name="robots" content="noindex, follow" /> <!-- Don't index empty searches -->
<link rel="canonical" href="https://ondacorea.com/buscar?q={query}" />

<!-- Open Graph -->
<meta property="og:title" content="Buscar: {query} | OndaCorea" />
<meta property="og:description" content="Encuentra K-Dramas, K-Pop y más..." />
<meta property="og:type" content="website" />
```

### Page States

| State | URL | Behavior |
|-------|-----|----------|
| No query | `/buscar` | Show search input, trending/recent content |
| With query | `/buscar?q=BTS` | Execute search, show results |
| With filter | `/buscar?q=BTS&type=kpop` | Filter results by type |
| No results | `/buscar?q=xyz` | Show friendly empty state |

---

## Pagefind API Usage

### Initialization

```typescript
// Lazy-load Pagefind on first search interaction
let pagefind: PagefindAPI | null = null;

async function initPagefind() {
  if (!pagefind) {
    pagefind = await import('/pagefind/pagefind.js');
    await pagefind.init();
  }
  return pagefind;
}
```

### Search Execution

```typescript
interface PagefindSearchOptions {
  filters?: Record<string, string>;
}

async function executeSearch(
  query: string,
  filter: ContentType
): Promise<SearchResultSet> {
  const pf = await initPagefind();

  const options: PagefindSearchOptions = {};
  if (filter !== 'all') {
    options.filters = { contentType: filter };
  }

  const search = await pf.search(query, options);

  // Load first 10 results
  const results = await Promise.all(
    search.results.slice(0, 10).map(r => r.data())
  );

  return {
    results: results.map(mapToSearchResult),
    totalCount: search.results.length,
    query,
    filter,
    hasMore: search.results.length > 10,
  };
}
```

### Result Mapping

```typescript
function mapToSearchResult(pagefindResult: any): SearchResult {
  return {
    title: pagefindResult.meta.title,
    excerpt: pagefindResult.excerpt,
    url: pagefindResult.url,
    contentType: pagefindResult.meta.contentType as ContentType,
    pubDate: new Date(pagefindResult.meta.pubDate),
    heroImage: pagefindResult.meta.heroImage,
    relevanceScore: pagefindResult.score,
  };
}
```

---

## Error States

| Error | User Message | Technical Handling |
|-------|--------------|-------------------|
| Pagefind failed to load | "La búsqueda no está disponible" | Log error, show fallback |
| Network timeout | "Error de conexión" | Retry with exponential backoff |
| Invalid query | "Ingresa al menos 2 caracteres" | Prevent search execution |
| No results | "No se encontraron resultados para '{query}'" | Show suggestions |
