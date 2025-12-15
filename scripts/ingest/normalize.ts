import crypto from 'node:crypto';
import type { RawRssItem } from './rss_fetch';
import type { Category, SourceConfig } from './sources';

export type DraftItem = {
  id: string;
  source: { name: string; url: string; itemUrl: string };
  category: Category;
  title: string;
  summary: string;
  publishedAt: string;
  language: 'es';
  raw: { guid?: string; link?: string };
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function createId(title: string, source: SourceConfig, itemUrl: string): string {
  const hash = crypto.createHash('md5').update(itemUrl || title).digest('hex').slice(0, 10);
  const safeTitle = slugify(title).slice(0, 48) || 'item';
  const safeSource = slugify(source.name) || 'source';
  return `${safeSource}-${safeTitle}-${hash}`;
}

function coerceDate(value?: string): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

export function normalizeRssItems(items: RawRssItem[], source: SourceConfig): DraftItem[] {
  const now = new Date();

  return items.map((item) => {
    const title = item.title?.trim() || 'Sin título';
    const itemUrl = item.link || item.guid || source.url;
    const summary = item.summary ? stripHtml(item.summary).trim() : '';

    return {
      id: createId(title, source, itemUrl),
      source: { name: source.name, url: source.url, itemUrl },
      category: source.category,
      title,
      summary,
      publishedAt: coerceDate(item.pubDate || now.toISOString()),
      language: 'es',
      raw: { guid: item.guid, link: item.link },
    } satisfies DraftItem;
  });
}

function isRecent(date: string, lookbackDays: number): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const published = new Date(date);
  return published >= cutoff;
}

export function dedupeDrafts(
  candidates: DraftItem[],
  existingDrafts: DraftItem[],
  lookbackDays = 7,
): DraftItem[] {
  const recentDrafts = existingDrafts.filter((draft) => isRecent(draft.publishedAt, lookbackDays));
  const urlSet = new Set<string>();
  const titleSet = new Set<string>();

  for (const draft of recentDrafts) {
    if (draft.source.itemUrl) {
      urlSet.add(draft.source.itemUrl);
    }
    titleSet.add(slugify(draft.title));
  }

  const filtered: DraftItem[] = [];

  for (const draft of candidates) {
    const titleKey = slugify(draft.title);
    const urlKey = draft.source.itemUrl;

    if (urlKey && urlSet.has(urlKey)) {
      continue;
    }

    if (titleSet.has(titleKey)) {
      continue;
    }

    if (urlKey) {
      urlSet.add(urlKey);
    }
    titleSet.add(titleKey);
    filtered.push(draft);
  }

  return filtered;
}
