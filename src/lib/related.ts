import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'dramas' | 'kpop' | 'noticias' | 'guias'>;

const collections: Array<ArticleEntry['collection']> = ['dramas', 'kpop', 'noticias', 'guias'];

/** Maximum pool size for related content calculation - prevents O(n²) build time explosion */
const CONTENT_POOL_LIMIT = 50;
/** Minimum shared tags required for an article to be considered related */
const MIN_SHARED_TAGS = 2;
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
 * Optimized: only returns articles with 2+ shared tags, max 3 results.
 */
export function getRelatedEntries(
  currentEntry: ArticleEntry,
  allEntries: ArticleEntry[],
  limit = MAX_RELATED
): ArticleEntry[] {
  const currentTags = new Set(
    (currentEntry.data.tags || []).map((tag) => tag.toLowerCase())
  );

  // Skip if current entry has no tags
  if (currentTags.size === 0) {
    return [];
  }

  const related: RelatedResult[] = [];

  for (const candidate of allEntries) {
    // Skip self
    if (candidate.slug === currentEntry.slug && candidate.collection === currentEntry.collection) {
      continue;
    }

    // Count shared tags
    const candidateTags = candidate.data.tags || [];
    const sharedTagCount = candidateTags.filter((tag) =>
      currentTags.has(tag.toLowerCase())
    ).length;

    // Only consider if MIN_SHARED_TAGS or more tags match
    if (sharedTagCount < MIN_SHARED_TAGS) {
      continue;
    }

    // Score: shared tags * 2, same collection +3, more recent +1
    let score = sharedTagCount * 2;
    if (candidate.collection === currentEntry.collection) {
      score += 3;
    }
    if (candidate.data.pubDate > currentEntry.data.pubDate) {
      score += 1;
    }

    related.push({ entry: candidate, score });

    // Early exit if we have enough high-scoring candidates
    if (related.length >= limit * 3) {
      break;
    }
  }

  return related
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime();
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}
