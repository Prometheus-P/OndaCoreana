/**
 * RSS Feed Fetcher
 * Fetches and parses RSS feeds with graceful error handling
 */

import type { RSSSource } from "./sources.js";
import type { ParsedFeed, RSSItem } from "./types.js";

const FETCH_TIMEOUT_MS = 10000;

function parseXMLValue(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([^\\]]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = xml.match(regex);
  if (match) {
    return (match[1] || match[2] || "").trim();
  }
  return undefined;
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: parseXMLValue(itemXml, "title"),
      link: parseXMLValue(itemXml, "link"),
      description: parseXMLValue(itemXml, "description"),
      pubDate: parseXMLValue(itemXml, "pubDate"),
      guid: parseXMLValue(itemXml, "guid"),
      content: parseXMLValue(itemXml, "content:encoded") || parseXMLValue(itemXml, "content"),
    });
  }

  return items;
}

export async function fetchRSSFeed(source: RSSSource): Promise<ParsedFeed | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "OndaCoreana-RSS-Ingest/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      console.warn(`[WARN] Failed to fetch ${source.name}: HTTP ${response.status}`);
      return null;
    }

    const xml = await response.text();
    const items = parseRSSItems(xml);

    return {
      sourceName: source.name,
      sourceUrl: source.url,
      category: source.category,
      items,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn(`[WARN] Timeout fetching ${source.name}`);
      } else {
        console.warn(`[WARN] Error fetching ${source.name}: ${error.message}`);
      }
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAllFeeds(sources: RSSSource[]): Promise<ParsedFeed[]> {
  const results = await Promise.allSettled(
    sources.map((source) => fetchRSSFeed(source))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<ParsedFeed | null> =>
      result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value as ParsedFeed);
}
