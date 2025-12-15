/**
 * Normalize and Deduplicate RSS Items
 */

import * as crypto from "crypto";
import type { Category } from "./sources.js";
import type { DraftItem, ParsedFeed, RSSItem } from "./types.js";

/**
 * Normalize a title for comparison (lowercase, remove special chars, collapse whitespace)
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s]/g, "") // Keep only alphanumeric and spaces
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Generate a URL-safe slug from a title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") // Trim hyphens from ends
    .slice(0, 80); // Limit length
}

/**
 * Generate a unique ID for a draft item
 */
export function generateId(itemUrl: string, title: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(itemUrl || title)
    .digest("hex")
    .slice(0, 12);
  const slug = slugify(title).slice(0, 40);
  return `${slug}-${hash}`;
}

/**
 * Decode HTML numeric entities (&#NNN; or &#xHHH;)
 */
function decodeNumericEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Strip HTML tags and decode entities from a string
 */
function stripHTML(html: string): string {
  return decodeNumericEntities(html)
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract a clean summary from description/content
 */
function extractSummary(description?: string, content?: string): string {
  const text = stripHTML(description || content || "");
  if (text.length <= 200) return text;
  return text.slice(0, 197) + "...";
}

/**
 * Convert an RSS item to a DraftItem
 */
export function convertToDraft(
  item: RSSItem,
  sourceName: string,
  sourceUrl: string,
  category: Category
): DraftItem | null {
  if (!item.title || !item.link) {
    return null;
  }

  const itemUrl = item.link;
  const title = stripHTML(item.title);

  return {
    id: generateId(itemUrl, title),
    source: {
      name: sourceName,
      url: sourceUrl,
      itemUrl,
    },
    category,
    title,
    summary: extractSummary(item.description, item.content),
    publishedAt: item.pubDate || new Date().toISOString(),
    language: "es",
    raw: {
      guid: item.guid,
      link: item.link,
    },
  };
}

/**
 * Deduplicate items based on URL and normalized title
 */
export function deduplicateItems(
  newItems: DraftItem[],
  existingItems: DraftItem[] = [],
  recentDays: number = 7
): DraftItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - recentDays);

  // Build sets for fast lookup
  const existingUrls = new Set(existingItems.map((item) => item.source.itemUrl));
  const existingTitles = new Set(
    existingItems
      .filter((item) => new Date(item.publishedAt) >= cutoffDate)
      .map((item) => normalizeTitle(item.title))
  );

  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const deduplicated: DraftItem[] = [];

  for (const item of newItems) {
    const normalizedTitle = normalizeTitle(item.title);
    const itemUrl = item.source.itemUrl;

    // Check against existing items
    if (existingUrls.has(itemUrl)) continue;
    if (existingTitles.has(normalizedTitle)) continue;

    // Check against items in current batch
    if (seenUrls.has(itemUrl)) continue;
    if (seenTitles.has(normalizedTitle)) continue;

    seenUrls.add(itemUrl);
    seenTitles.add(normalizedTitle);
    deduplicated.push(item);
  }

  return deduplicated;
}

/**
 * Process all feeds and return deduplicated draft items
 */
export function normalizeFeeds(
  feeds: ParsedFeed[],
  existingItems: DraftItem[] = []
): DraftItem[] {
  const allItems: DraftItem[] = [];

  for (const feed of feeds) {
    for (const item of feed.items) {
      const draft = convertToDraft(
        item,
        feed.sourceName,
        feed.sourceUrl,
        feed.category
      );
      if (draft) {
        allItems.push(draft);
      }
    }
  }

  return deduplicateItems(allItems, existingItems);
}
