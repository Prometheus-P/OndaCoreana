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

// ============================================
// Consumer Demand Features - Helper Functions
// ============================================

/** Streaming platform type */
export type StreamingPlatform =
  | 'netflix'
  | 'viki'
  | 'disney-plus'
  | 'amazon-prime'
  | 'apple-tv'
  | 'kocowa'
  | 'wavve'
  | 'tving';

/**
 * Get currently airing dramas
 */
export async function getAiringDramas(): Promise<CollectionEntry<'dramas'>[]> {
  const dramas = await getCollection('dramas', filterDrafts);
  return dramas
    .filter((d) => d.data.airingStatus === 'airing')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Get dramas available on a specific streaming platform
 */
export async function getDramasByPlatform(
  platform: StreamingPlatform
): Promise<CollectionEntry<'dramas'>[]> {
  const dramas = await getCollection('dramas', filterDrafts);
  return dramas
    .filter((d) => d.data.whereToWatch?.includes(platform))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Get all dramas grouped by platform with counts
 */
export async function getDramaCountsByPlatform(): Promise<Map<StreamingPlatform, number>> {
  const dramas = await getCollection('dramas', filterDrafts);
  const counts = new Map<StreamingPlatform, number>();

  for (const drama of dramas) {
    for (const platform of drama.data.whereToWatch || []) {
      counts.set(platform, (counts.get(platform) || 0) + 1);
    }
  }

  return counts;
}

/**
 * Get editor's picks from a collection
 */
export async function getEditorPicks<C extends 'dramas' | 'kpop'>(
  collection: C,
  limit = 10
): Promise<CollectionEntry<C>[]> {
  const items = await getCollection(collection, filterDrafts);
  return items
    .filter((item) => item.data.isEditorPick)
    .sort((a, b) => (a.data.editorPickOrder || 99) - (b.data.editorPickOrder || 99))
    .slice(0, limit);
}

/**
 * Get K-Pop artists with recent comebacks
 */
export async function getRecentComebacks(days = 30): Promise<CollectionEntry<'kpop'>[]> {
  const artists = await getCollection('kpop', filterDrafts);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return artists.filter(
    (a) =>
      a.data.recentActivity === 'comeback' &&
      a.data.lastComebackDate &&
      a.data.lastComebackDate >= cutoff
  );
}

/**
 * Get upcoming dramas (not yet aired)
 */
export async function getUpcomingDramas(): Promise<CollectionEntry<'dramas'>[]> {
  const dramas = await getCollection('dramas', filterDrafts);
  return dramas
    .filter((d) => d.data.airingStatus === 'upcoming')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
