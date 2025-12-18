import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'dramas' | 'kpop' | 'noticias' | 'guias'>;

const collections: Array<ArticleEntry['collection']> = ['dramas', 'kpop', 'noticias', 'guias'];

/** Maximum pool size for related content calculation - prevents O(n²) build time explosion */
const CONTENT_POOL_LIMIT = 50;
/** Minimum shared tags required for an article to be considered related */
const MIN_SHARED_TAGS = 1;
/** Maximum related articles to return */
const MAX_RELATED = 3;

export interface RelatedResult {
  entry: ArticleEntry;
  score: number;
}

/**
 * Load articles for related content calculation.
 * Limited to most recent 50 articles to maintain O(1) build time.
 */
export async function loadAllArticles(): Promise<ArticleEntry[]> {
  const entries = await Promise.all(
    collections.map((collection) =>
      getCollection(collection, ({ data }) => !data.draft)
    )
  );

  // Sort by pubDate descending and limit to CONTENT_POOL_LIMIT
  return entries
    .flat()
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .slice(0, CONTENT_POOL_LIMIT);
}

export function buildEntryUrl(entry: ArticleEntry) {
  return `/${entry.collection}/${entry.slug}`;
}

/**
 * Get related entries based on shared tags.
 * Falls back to same-collection recent articles if tag matches are insufficient.
 */
export function getRelatedEntries(
  currentEntry: ArticleEntry,
  allEntries: ArticleEntry[],
  limit = MAX_RELATED
): ArticleEntry[] {
  const currentTags = new Set(
    (currentEntry.data.tags || []).map((tag) => tag.toLowerCase())
  );

  const related: RelatedResult[] = [];
  const usedSlugs = new Set<string>();
  usedSlugs.add(`${currentEntry.collection}:${currentEntry.slug}`);

  // Phase 1: Find tag-based matches (only if current entry has tags)
  if (currentTags.size > 0) {
    for (const candidate of allEntries) {
      const candidateKey = `${candidate.collection}:${candidate.slug}`;
      if (usedSlugs.has(candidateKey)) continue;

      // Count shared tags
      const candidateTags = candidate.data.tags || [];
      const sharedTagCount = candidateTags.filter((tag) =>
        currentTags.has(tag.toLowerCase())
      ).length;

      // Only consider if MIN_SHARED_TAGS or more tags match
      if (sharedTagCount < MIN_SHARED_TAGS) continue;

      // Score: shared tags * 2, same collection +3, more recent +1
      let score = sharedTagCount * 2;
      if (candidate.collection === currentEntry.collection) {
        score += 3;
      }
      if (candidate.data.pubDate > currentEntry.data.pubDate) {
        score += 1;
      }

      related.push({ entry: candidate, score });
    }
  }

  // Sort tag-based matches by score, then by date
  related.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime();
  });

  // Take top matches from tag-based results
  const tagMatches = related.slice(0, limit);
  tagMatches.forEach(({ entry }) => {
    usedSlugs.add(`${entry.collection}:${entry.slug}`);
  });

  // Phase 2: Fallback to same-collection recent articles if needed
  if (tagMatches.length < limit) {
    const remaining = limit - tagMatches.length;
    const sameCollectionRecent = allEntries
      .filter((entry) => {
        const key = `${entry.collection}:${entry.slug}`;
        return entry.collection === currentEntry.collection && !usedSlugs.has(key);
      })
      .slice(0, remaining);

    return [...tagMatches.map(({ entry }) => entry), ...sameCollectionRecent];
  }

  return tagMatches.map(({ entry }) => entry);
}
