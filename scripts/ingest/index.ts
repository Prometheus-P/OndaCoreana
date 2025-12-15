import type { DraftItem } from './normalize';
import { dedupeDrafts, normalizeRssItems } from './normalize';
import { fetchFeed } from './rss_fetch';
import { sources } from './sources';
import { loadRecentDrafts, writeDrafts } from './write_drafts';

const LOOKBACK_DAYS = 7;

async function ingest() {
  const normalized: DraftItem[] = [];

  for (const source of sources) {
    console.log(`Fetching feed: ${source.name}`);
    const items = await fetchFeed(source);
    if (!items.length) {
      continue;
    }
    normalized.push(...normalizeRssItems(items, source));
  }

  const existing = loadRecentDrafts(LOOKBACK_DAYS);
  const drafts = dedupeDrafts(normalized, existing, LOOKBACK_DAYS);

  const written = writeDrafts(drafts);
  console.log(`Ingest complete. Wrote ${written.length} drafts.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingest().catch((error) => {
    console.error('RSS ingest failed.', error);
    process.exit(1);
  });
}
