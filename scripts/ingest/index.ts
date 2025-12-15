#!/usr/bin/env node
/**
 * RSS Ingest CLI
 * Fetches RSS feeds, normalizes items, and writes daily draft JSON files
 *
 * Usage:
 *   pnpm ingest:rss [--dry-run] [--stats]
 */

import { RSS_SOURCES } from "./sources.js";
import { fetchAllFeeds } from "./rss_fetch.js";
import { normalizeFeeds } from "./normalize.js";
import {
  writeDraftItems,
  loadRecentItems,
  getTodayDateString,
  getOutputDir,
  getDraftStats,
} from "./write_drafts.js";
import type { IngestResult } from "./types.js";

async function showStats(): Promise<void> {
  console.log("\n📊 Draft Statistics\n");
  const stats = getDraftStats();

  console.log(`Total drafts: ${stats.totalDrafts}`);
  console.log("\nBy date:");
  for (const [date, count] of Object.entries(stats.byDate).sort().reverse().slice(0, 10)) {
    console.log(`  ${date}: ${count}`);
  }
  console.log("\nBy category:");
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`  ${category}: ${count}`);
  }
}

async function runIngest(dryRun: boolean = false): Promise<IngestResult> {
  const result: IngestResult = {
    totalFetched: 0,
    totalDeduplicated: 0,
    totalWritten: 0,
    errors: [],
    outputPath: getOutputDir(getTodayDateString()),
  };

  console.log("\n🚀 RSS Ingest Pipeline\n");
  console.log(`📅 Date: ${getTodayDateString()}`);
  console.log(`📁 Output: ${result.outputPath}`);
  console.log(`🔄 Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  // Step 1: Fetch all feeds
  console.log(`📡 Fetching ${RSS_SOURCES.length} RSS feeds...`);
  const feeds = await fetchAllFeeds(RSS_SOURCES);
  const fetchedCount = feeds.reduce((sum, f) => sum + f.items.length, 0);
  result.totalFetched = fetchedCount;
  console.log(`   ✓ Fetched ${fetchedCount} items from ${feeds.length} feeds`);

  if (feeds.length < RSS_SOURCES.length) {
    const failedCount = RSS_SOURCES.length - feeds.length;
    result.errors.push(`${failedCount} feed(s) failed to fetch`);
    console.log(`   ⚠ ${failedCount} feed(s) failed (will retry next run)`);
  }

  // Step 2: Load existing items for deduplication
  console.log("\n🔍 Loading recent items for deduplication...");
  const existingItems = loadRecentItems(7);
  console.log(`   ✓ Found ${existingItems.length} existing items (last 7 days)`);

  // Step 3: Normalize and deduplicate
  console.log("\n🔧 Normalizing and deduplicating...");
  const drafts = normalizeFeeds(feeds, existingItems);
  result.totalDeduplicated = fetchedCount - drafts.length;
  console.log(`   ✓ ${drafts.length} new items (${result.totalDeduplicated} duplicates removed)`);

  // Step 4: Write drafts
  if (drafts.length > 0) {
    if (dryRun) {
      console.log("\n📝 [DRY RUN] Would write the following drafts:");
      for (const draft of drafts.slice(0, 5)) {
        console.log(`   - ${draft.category}: ${draft.title.slice(0, 60)}...`);
      }
      if (drafts.length > 5) {
        console.log(`   ... and ${drafts.length - 5} more`);
      }
    } else {
      console.log("\n📝 Writing draft files...");
      const paths = writeDraftItems(drafts);
      result.totalWritten = paths.length;
      console.log(`   ✓ Wrote ${paths.length} draft files`);
    }
  } else {
    console.log("\n📝 No new items to write");
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("📊 Summary");
  console.log("═".repeat(50));
  console.log(`   Fetched:      ${result.totalFetched}`);
  console.log(`   Deduplicated: ${result.totalDeduplicated}`);
  console.log(`   Written:      ${dryRun ? `${drafts.length} (dry run)` : result.totalWritten}`);
  if (result.errors.length > 0) {
    console.log(`   Errors:       ${result.errors.length}`);
  }
  console.log("");

  return result;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const showStatsFlag = args.includes("--stats");

  if (showStatsFlag) {
    await showStats();
    return;
  }

  try {
    const result = await runIngest(dryRun);

    if (result.errors.length > 0 && result.totalWritten === 0 && result.totalFetched === 0) {
      console.error("❌ Ingest failed completely");
      process.exit(1);
    }

    console.log("✅ Ingest completed successfully\n");
  } catch (error) {
    console.error("❌ Fatal error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
