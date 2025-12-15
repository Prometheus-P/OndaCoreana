import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'dramas' | 'kpop' | 'noticias' | 'guias'>;

const collections: Array<ArticleEntry['collection']> = ['dramas', 'kpop', 'noticias', 'guias'];

export interface RelatedResult {
  entry: ArticleEntry;
  score: number;
}

export async function loadAllArticles() {
  const entries = await Promise.all(
    collections.map((collection) =>
      getCollection(collection, ({ data }) => !data.draft)
    )
  );

  return entries.flat();
}

export function buildEntryUrl(entry: ArticleEntry) {
  return `/${entry.collection}/${entry.slug}`;
}

export function getRelatedEntries(
  currentEntry: ArticleEntry,
  allEntries: ArticleEntry[],
  limit = 6
) {
  const related: RelatedResult[] = [];

  for (const candidate of allEntries) {
    if (candidate.slug === currentEntry.slug && candidate.collection === currentEntry.collection) {
      continue;
    }

    let score = 0;

    if (candidate.collection === currentEntry.collection) {
      score += 3;
    }

    const currentTags = new Set((currentEntry.data.tags || []).map((tag) => tag.toLowerCase()));
    const sharedTags = (candidate.data.tags || []).filter((tag) => currentTags.has(tag.toLowerCase()));
    score += sharedTags.length * 2;

    const isMoreRecent = candidate.data.pubDate > currentEntry.data.pubDate;
    score += isMoreRecent ? 1 : 0;

    related.push({ entry: candidate, score });
  }

  return related
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime();
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}
