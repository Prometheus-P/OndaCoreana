/**
 * Write Draft Files
 * Writes normalized items to daily draft JSON files
 */

import * as fs from "fs";
import * as path from "path";
import type { DraftItem } from "./types.js";

const DATA_DIR = "data/drafts";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Get the output directory path for a given date
 */
export function getOutputDir(dateString: string): string {
  return path.join(process.cwd(), DATA_DIR, dateString);
}

/**
 * Ensure the output directory exists
 */
export function ensureOutputDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Load existing items from a date directory
 */
export function loadExistingItems(dateString: string): DraftItem[] {
  const dirPath = getOutputDir(dateString);
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const items: DraftItem[] = [];
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
      const item = JSON.parse(content) as DraftItem;
      items.push(item);
    } catch {
      // Skip invalid files
    }
  }

  return items;
}

/**
 * Load existing items from recent days
 */
export function loadRecentItems(days: number = 7): DraftItem[] {
  const items: DraftItem[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    items.push(...loadExistingItems(dateString));
  }

  return items;
}

/**
 * Write a single draft item to a JSON file
 */
export function writeDraftItem(item: DraftItem, dateString: string): string {
  const dirPath = getOutputDir(dateString);
  ensureOutputDir(dirPath);

  const filename = `${item.id}.json`;
  const filePath = path.join(dirPath, filename);

  fs.writeFileSync(filePath, JSON.stringify(item, null, 2), "utf-8");

  return filePath;
}

/**
 * Write multiple draft items and return the paths
 */
export function writeDraftItems(
  items: DraftItem[],
  dateString?: string
): string[] {
  const date = dateString || getTodayDateString();
  return items.map((item) => writeDraftItem(item, date));
}

/**
 * Get stats about existing drafts
 */
export function getDraftStats(): {
  totalDrafts: number;
  byDate: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const dataPath = path.join(process.cwd(), DATA_DIR);
  const stats = {
    totalDrafts: 0,
    byDate: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
  };

  if (!fs.existsSync(dataPath)) {
    return stats;
  }

  const dateDirs = fs.readdirSync(dataPath).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

  for (const dateDir of dateDirs) {
    const items = loadExistingItems(dateDir);
    stats.byDate[dateDir] = items.length;
    stats.totalDrafts += items.length;

    for (const item of items) {
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    }
  }

  return stats;
}
