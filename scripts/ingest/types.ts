/**
 * Draft Item Types for RSS Ingestion Pipeline
 */

import type { Category } from "./sources.js";

export interface DraftItem {
  id: string;
  source: {
    name: string;
    url: string;
    itemUrl: string;
  };
  category: Category;
  title: string;
  summary: string;
  publishedAt: string;
  language: "es";
  raw: {
    guid?: string;
    link?: string;
  };
}

export interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  guid?: string;
  content?: string;
}

export interface ParsedFeed {
  sourceName: string;
  sourceUrl: string;
  category: Category;
  items: RSSItem[];
}

export interface IngestResult {
  totalFetched: number;
  totalDeduplicated: number;
  totalWritten: number;
  errors: string[];
  outputPath: string;
}
