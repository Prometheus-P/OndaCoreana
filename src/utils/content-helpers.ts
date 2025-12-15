/**
 * Content Collection Helper Functions
 * Centralized utilities for fetching and sorting content collections.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

/** Content collections that have pubDate field (excludes features which uses publishDate) */
export type ContentCollection = 'dramas' | 'kpop' | 'noticias' | 'guias';

/** Generic content entry type for collections with pubDate */
export type ContentEntry = CollectionEntry<ContentCollection>;

/**
 * Filter function to exclude draft content
 */
export const filterDrafts = <T extends { data: { draft?: boolean } }>({ data }: T): boolean => !data.draft;

/**
 * Sort entries by pubDate descending (newest first)
 */
export function sortByPubDate<T extends { data: { pubDate: Date } }>(entries: T[]): T[] {
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Get published (non-draft) content from a collection
 */
export async function getPublishedContent<C extends ContentCollection>(
  collection: C
): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, filterDrafts);
}

/**
 * Get published content sorted by pubDate (newest first)
 */
export async function getPublishedContentSorted<C extends ContentCollection>(
  collection: C
): Promise<CollectionEntry<C>[]> {
  const entries = await getPublishedContent(collection);
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Get the most recent entries from a collection
 */
export async function getRecentContent<C extends ContentCollection>(
  collection: C,
  limit: number
): Promise<CollectionEntry<C>[]> {
  const entries = await getPublishedContentSorted(collection);
  return entries.slice(0, limit);
}

/**
 * Get published content from multiple collections, merged and sorted
 */
export async function getMergedContent(
  collections: ContentCollection[]
): Promise<ContentEntry[]> {
  const allEntries = await Promise.all(
    collections.map((c) => getPublishedContent(c))
  );
  return allEntries.flat().sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
