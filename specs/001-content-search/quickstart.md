# Quickstart: Content Search

**Feature**: 001-content-search
**Date**: 2025-12-02

## Prerequisites

- Node.js 18+
- pnpm installed
- OndaCorea repo cloned and dependencies installed

## Setup

### 1. Install Search Dependencies

```bash
pnpm add -D astro-pagefind pagefind
```

### 2. Configure Astro Integration

Add Pagefind to `astro.config.mjs` (must be LAST integration):

```javascript
import pagefind from "astro-pagefind";

export default defineConfig({
  integrations: [
    // ... existing integrations (tailwind, mdx, etc.)
    pagefind(), // Add as LAST integration
  ],
});
```

### 3. Annotate Content for Indexing

In article layouts (e.g., `ArticleLayout.astro`), add Pagefind attributes:

```astro
<article data-pagefind-body>
  <h1 data-pagefind-meta="title">{title}</h1>
  <p data-pagefind-meta="description">{description}</p>
  <span data-pagefind-meta="contentType" class="hidden">{collection}</span>
  <span data-pagefind-meta="pubDate" class="hidden">{pubDate.toISOString()}</span>

  <!-- Article content (automatically indexed) -->
  <slot />
</article>

<!-- Exclude navigation/footer from index -->
<nav data-pagefind-ignore>...</nav>
```

### 4. Build and Test Index

```bash
# Build site and generate search index
pnpm build

# Preview locally
pnpm preview
```

The search index is generated at `dist/pagefind/`.

## Development

### Running Dev Server

```bash
pnpm dev
```

> **Note**: `astro-pagefind` handles dev mode by using the last built index. Run `pnpm build` once to generate the initial index.

### Testing Search

1. Navigate to `http://localhost:4321/buscar`
2. Enter a search query (e.g., "BTS", "goblin", "streaming")
3. Verify results appear from all content collections

### Running E2E Tests

```bash
# Run all search tests
pnpm test:e2e tests/e2e/search-*.spec.ts

# Run specific test file
pnpm test:e2e tests/e2e/search-basic.spec.ts
```

## File Locations

| File | Purpose |
|------|---------|
| `src/components/search/SearchInput.astro` | Header search field |
| `src/components/search/SearchResults.astro` | Results list |
| `src/components/search/SearchFilters.astro` | Content type filters |
| `src/components/search/SearchResultCard.astro` | Single result card |
| `src/pages/buscar.astro` | Search results page |
| `tests/e2e/search-*.spec.ts` | E2E test files |

## Common Tasks

### Add Content to Search Index

Content is automatically indexed when:
1. It's in a content collection (`src/content/*`)
2. It's not marked as `draft: true`
3. The page has `data-pagefind-body` attribute

### Exclude Content from Index

```astro
<!-- Exclude entire element -->
<div data-pagefind-ignore>
  This content won't be indexed
</div>

<!-- Exclude from body but keep metadata -->
<aside data-pagefind-ignore="all">
  Related articles sidebar
</aside>
```

### Filter by Content Type

Filters work via Pagefind's filter system:

```typescript
// In search execution
const results = await pagefind.search(query, {
  filters: { contentType: 'dramas' }
});
```

### Debug Search Index

```bash
# View index stats after build
cat dist/pagefind/pagefind-entry.json | jq '.index_stats'

# List all indexed pages
cat dist/pagefind/pagefind-entry.json | jq '.pages'
```

## Troubleshooting

### "Search not available"

1. Ensure `pnpm build` completed successfully
2. Check `dist/pagefind/` directory exists
3. Verify `astro-pagefind` is in integrations array

### No Results for Valid Query

1. Check content has `data-pagefind-body` attribute
2. Verify content is not `draft: true`
3. Rebuild: `pnpm build`

### Index Too Large

1. Review what's being indexed (check `data-pagefind-body` scope)
2. Exclude unnecessary content with `data-pagefind-ignore`
3. Check for duplicate content across pages

### Korean Text Not Matching

1. Pagefind uses Unicode matching - exact text must appear
2. Initial consonant search (초성) is not supported
3. Ensure Korean text in content matches expected query format

## Verification Checklist

Before merging, verify:

- [ ] Search input appears in header on all pages
- [ ] Typing 2+ characters triggers search
- [ ] Results show title, excerpt, content type, date
- [ ] Filters narrow results by content type
- [ ] URL updates with query parameters
- [ ] Direct URL access shows correct results
- [ ] No results state shows friendly message
- [ ] Lighthouse Performance score 90+
- [ ] All E2E tests pass
