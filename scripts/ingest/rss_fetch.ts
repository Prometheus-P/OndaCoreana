import { JSDOM } from 'jsdom';
import type { SourceConfig } from './sources';

export interface RawRssItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  summary?: string;
}

function getTextContent(element: Element | null): string | undefined {
  return element?.textContent?.trim() || undefined;
}

function parseFeed(xml: string): RawRssItem[] {
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const document = dom.window.document;
  const entries = Array.from(document.querySelectorAll('item, entry'));

  return entries.map((entry) => {
    const linkElement = entry.querySelector('link');
    const href = linkElement?.getAttribute('href') ?? getTextContent(linkElement);

    return {
      title: getTextContent(entry.querySelector('title')),
      link: href,
      guid: getTextContent(entry.querySelector('guid')) ?? getTextContent(entry.querySelector('id')),
      pubDate:
        getTextContent(entry.querySelector('pubDate')) ??
        getTextContent(entry.querySelector('updated')) ??
        getTextContent(entry.querySelector('published')),
      summary:
        getTextContent(entry.querySelector('description')) ??
        getTextContent(entry.querySelector('summary')) ??
        getTextContent(entry.querySelector('content')),
    } satisfies RawRssItem;
  });
}

export async function fetchFeed(source: SourceConfig): Promise<RawRssItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'OndaCoreana RSS Ingest/1.0',
      },
    });

    if (!response.ok) {
      console.warn(`⚠️  Could not fetch feed for ${source.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseFeed(xml);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️  Skipping ${source.name} (${source.url}): ${message}`);
    return [];
  }
}
