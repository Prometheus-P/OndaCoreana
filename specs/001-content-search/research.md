# Research: Content Search

**Feature**: 001-content-search
**Date**: 2025-12-02

## Search Library Selection

### Decision: Pagefind

**Rationale:**
1. **Astro Native** - Official integration via `astro-pagefind`, used by Astro Starlight
2. **Performance** - ~15KB gzipped JS, well under 50KB constitution budget
3. **Build-time Indexing** - Generates static index from dist folder, perfect for SSG
4. **Smart Loading** - Chunked index loading minimizes bandwidth for real-time search
5. **Unicode Support** - Full support for Spanish diacritics and Korean Hangul
6. **Zero Config** - Works with existing Astro content collections out of the box

### Alternatives Considered

| Library | Bundle Size | Korean Support | Astro Integration | Verdict |
|---------|-------------|----------------|-------------------|---------|
| Pagefind | ~15KB gzip | Good (Unicode) | Official | **SELECTED** |
| Fuse.js | ~7KB gzip | Limited | Community | Too basic for full-text |
| Lunr.js | ~9KB gzip | Poor | None | No CJK tokenizer |
| FlexSearch | ~35KB gzip | Excellent | None | Overkill, no integration |

### Performance Analysis

**Pagefind Budget Impact:**
- JavaScript: ~15KB gzipped (loaded only on search interaction)
- Index chunks: ~10-40KB each (lazy-loaded per query)
- Initial page load: 0KB (all search assets lazy-loaded)
- Search page: ~50-100KB total (within budget)

**Meets Constitution Requirements:**
- IV. Performance Budget: PASS (<50KB JS, lazy-loaded)
- I. SEO-First: PASS (SSG with hydration, indexable results page)

## Implementation Patterns

### Pattern: Build-Time Index Generation

```bash
# Pagefind runs post-build on dist folder
pnpm build && npx pagefind --site dist
```

The `astro-pagefind` integration handles this automatically.

### Pattern: Lazy-Loaded Search Assets

Search JavaScript and index chunks are NOT included in initial page bundles:
1. User focuses search input → Load Pagefind JS (~15KB)
2. User types 2+ characters → Load relevant index chunk
3. Subsequent searches → Use cached chunks

### Pattern: Content Annotation

Pagefind automatically indexes all content. For fine-grained control:

```astro
<!-- Include in index -->
<article data-pagefind-body>
  <h1 data-pagefind-meta="title">{title}</h1>
  <p data-pagefind-meta="description">{description}</p>
</article>

<!-- Exclude from index -->
<nav data-pagefind-ignore>...</nav>
```

### Pattern: Custom UI vs Default UI

Pagefind provides a default UI component, but for constitution compliance (Tailwind styling, Spanish labels), we'll build custom components that use the Pagefind API directly.

## Korean Text Handling

### Finding: Unicode Matching Works

Pagefind treats Korean text as Unicode characters. Searching "방탄소년단" will match content containing that exact string.

### Limitation: No Cho-seong Search

Initial consonant search (초성 검색) like "ㅂㅌㅅㄴㄷ" for "방탄소년단" is NOT supported. This is acceptable for MVP since:
1. Target audience is Spanish-speaking (primary queries in Spanish)
2. Korean searches will use full words (artist names, drama titles)
3. Could add cho-seong support later with custom tokenizer if needed

## Edge Case Handling

| Edge Case | Pagefind Behavior | Custom Handling Needed |
|-----------|-------------------|------------------------|
| Empty query | No results | FR-016: Show guidance message |
| Long query (100+ chars) | Truncates internally | FR-015: Truncate with notification |
| Korean text | Unicode match | None - works out of box |
| Spanish diacritics | Accent-aware | None - works out of box |
| No results | Empty result set | FR-012: Friendly message |
| Draft content | Included by default | Filter via data-pagefind-ignore |

## Integration Points

### Astro Config

```javascript
// astro.config.mjs
import pagefind from "astro-pagefind";

export default defineConfig({
  integrations: [
    // ... existing integrations
    pagefind(), // Must be LAST
  ],
});
```

### Package Dependencies

```json
{
  "devDependencies": {
    "astro-pagefind": "^1.x",
    "pagefind": "^1.x"
  }
}
```

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index size grows too large | Low | Medium | Pagefind chunks index automatically |
| Korean search quality issues | Medium | Low | Document limitation, monitor feedback |
| Dev mode search unavailable | Low | Low | astro-pagefind handles dev mode |
| Build time increase | Low | Low | Pagefind is fast (~1s for 100 pages) |

## Conclusion

Pagefind is the optimal choice for OndaCorea search:
- Meets all constitution requirements
- Zero-config Astro integration
- Excellent performance characteristics
- Good enough Korean/Spanish support for MVP

No NEEDS CLARIFICATION items remain. Ready for Phase 1 design.
