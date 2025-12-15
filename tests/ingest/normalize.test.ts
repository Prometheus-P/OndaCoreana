/**
 * Tests for RSS Ingest Normalize Functions
 * Tests slugify and deduplication logic
 */

import {
  slugify,
  normalizeTitle,
  deduplicateItems,
  generateId,
} from "../../scripts/ingest/normalize.js";
import type { DraftItem } from "../../scripts/ingest/types.js";

interface TestResult {
  name: string;
  status: "PASS" | "FAIL";
  error?: string;
}

function createMockDraft(overrides: Partial<DraftItem> = {}): DraftItem {
  return {
    id: "test-id",
    source: {
      name: "Test Source",
      url: "https://example.com/feed",
      itemUrl: "https://example.com/article/1",
    },
    category: "kpop",
    title: "Test Article Title",
    summary: "Test summary",
    publishedAt: new Date().toISOString(),
    language: "es",
    raw: {
      guid: "guid-123",
      link: "https://example.com/article/1",
    },
    ...overrides,
  };
}

// === SLUGIFY TESTS ===

function testSlugifyBasic(): TestResult {
  const result = slugify("Hello World");
  const expected = "hello-world";
  return {
    name: "slugify: basic text",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testSlugifySpecialChars(): TestResult {
  const result = slugify("K-Pop: BTS & BLACKPINK!");
  const expected = "k-pop-bts-blackpink";
  return {
    name: "slugify: special characters",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testSlugifyKorean(): TestResult {
  // Korean characters should be removed, keeping only alphanumeric
  const result = slugify("BTS 방탄소년단 Concert");
  const expected = "bts-concert";
  return {
    name: "slugify: Korean characters",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testSlugifyAccents(): TestResult {
  const result = slugify("Café résumé naïve");
  const expected = "cafe-resume-naive";
  return {
    name: "slugify: accented characters",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testSlugifyMultipleSpaces(): TestResult {
  const result = slugify("Multiple   Spaces   Here");
  const expected = "multiple-spaces-here";
  return {
    name: "slugify: multiple spaces",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testSlugifyEmpty(): TestResult {
  const result = slugify("");
  const expected = "";
  return {
    name: "slugify: empty string",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testSlugifyLongText(): TestResult {
  const longText = "This is a very long title that should be truncated to eighty characters maximum";
  const result = slugify(longText);
  return {
    name: "slugify: truncates to 80 chars",
    status: result.length <= 80 ? "PASS" : "FAIL",
    error: result.length > 80 ? `Expected max 80 chars, got ${result.length}` : undefined,
  };
}

// === NORMALIZE TITLE TESTS ===

function testNormalizeTitleBasic(): TestResult {
  const result = normalizeTitle("Hello World!");
  const expected = "hello world";
  return {
    name: "normalizeTitle: basic text",
    status: result === expected ? "PASS" : "FAIL",
    error: result !== expected ? `Expected "${expected}", got "${result}"` : undefined,
  };
}

function testNormalizeTitleCase(): TestResult {
  const title1 = normalizeTitle("BTS Announces New Album");
  const title2 = normalizeTitle("bts announces new album");
  return {
    name: "normalizeTitle: case insensitive",
    status: title1 === title2 ? "PASS" : "FAIL",
    error: title1 !== title2 ? `"${title1}" !== "${title2}"` : undefined,
  };
}

// === DEDUPLICATE TESTS ===

function testDeduplicateByUrl(): TestResult {
  const existing = [
    createMockDraft({
      title: "Existing Article",
      source: { name: "S1", url: "u1", itemUrl: "https://example.com/article/1" },
    }),
  ];
  const newItems = [
    createMockDraft({
      id: "new-1",
      title: "New Article One",
      source: { name: "S2", url: "u2", itemUrl: "https://example.com/article/1" },
    }),
    createMockDraft({
      id: "new-2",
      title: "New Article Two",
      source: { name: "S3", url: "u3", itemUrl: "https://example.com/article/2" },
    }),
  ];

  const result = deduplicateItems(newItems, existing);
  return {
    name: "dedupe: removes items with same URL",
    status: result.length === 1 && result[0].id === "new-2" ? "PASS" : "FAIL",
    error: result.length !== 1 ? `Expected 1 item, got ${result.length}` : undefined,
  };
}

function testDeduplicateByTitle(): TestResult {
  const today = new Date().toISOString();
  const existing = [
    createMockDraft({
      title: "BTS Announces World Tour",
      source: { name: "S1", url: "u1", itemUrl: "https://site1.com/bts" },
      publishedAt: today,
    }),
  ];
  const newItems = [
    createMockDraft({
      id: "new-1",
      title: "BTS announces WORLD tour!", // Same title, different formatting
      source: { name: "S2", url: "u2", itemUrl: "https://site2.com/bts-tour" },
    }),
    createMockDraft({
      id: "new-2",
      title: "BLACKPINK New Album",
      source: { name: "S3", url: "u3", itemUrl: "https://site3.com/bp" },
    }),
  ];

  const result = deduplicateItems(newItems, existing);
  return {
    name: "dedupe: removes items with same normalized title",
    status: result.length === 1 && result[0].id === "new-2" ? "PASS" : "FAIL",
    error: result.length !== 1 ? `Expected 1 item, got ${result.length}` : undefined,
  };
}

function testDeduplicateWithinBatch(): TestResult {
  const newItems = [
    createMockDraft({
      id: "new-1",
      title: "Unique Title A",
      source: { name: "S1", url: "u1", itemUrl: "https://example.com/same" },
    }),
    createMockDraft({
      id: "new-2",
      title: "Unique Title B",
      source: { name: "S2", url: "u2", itemUrl: "https://example.com/same" },
    }),
    createMockDraft({
      id: "new-3",
      title: "Unique Title C",
      source: { name: "S3", url: "u3", itemUrl: "https://example.com/different" },
    }),
  ];

  const result = deduplicateItems(newItems, []);
  return {
    name: "dedupe: removes duplicates within same batch",
    status: result.length === 2 ? "PASS" : "FAIL",
    error: result.length !== 2 ? `Expected 2 items, got ${result.length}` : undefined,
  };
}

function testDeduplicateOldItemsIgnored(): TestResult {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

  const existing = [
    createMockDraft({
      title: "Old News Article",
      source: { name: "S1", url: "u1", itemUrl: "https://example.com/old" },
      publishedAt: oldDate.toISOString(),
    }),
  ];
  const newItems = [
    createMockDraft({
      id: "new-1",
      title: "Old News Article", // Same title but old item
      source: { name: "S2", url: "u2", itemUrl: "https://example.com/new" },
    }),
  ];

  const result = deduplicateItems(newItems, existing, 7);
  return {
    name: "dedupe: ignores title matches older than recentDays",
    status: result.length === 1 ? "PASS" : "FAIL",
    error: result.length !== 1 ? `Expected 1 item (old title ignored), got ${result.length}` : undefined,
  };
}

// === GENERATE ID TESTS ===

function testGenerateIdUnique(): TestResult {
  const id1 = generateId("https://example.com/1", "Title One");
  const id2 = generateId("https://example.com/2", "Title Two");
  return {
    name: "generateId: different URLs produce different IDs",
    status: id1 !== id2 ? "PASS" : "FAIL",
    error: id1 === id2 ? `IDs should be different: ${id1}` : undefined,
  };
}

function testGenerateIdConsistent(): TestResult {
  const id1 = generateId("https://example.com/1", "Same Title");
  const id2 = generateId("https://example.com/1", "Same Title");
  return {
    name: "generateId: same input produces same ID",
    status: id1 === id2 ? "PASS" : "FAIL",
    error: id1 !== id2 ? `IDs should be same: ${id1} vs ${id2}` : undefined,
  };
}

// === TEST RUNNER ===

function runTests(): void {
  console.log("\n🧪 RSS Ingest Normalize Tests\n");
  console.log("=".repeat(60));

  const tests = [
    // Slugify tests
    testSlugifyBasic,
    testSlugifySpecialChars,
    testSlugifyKorean,
    testSlugifyAccents,
    testSlugifyMultipleSpaces,
    testSlugifyEmpty,
    testSlugifyLongText,
    // Normalize title tests
    testNormalizeTitleBasic,
    testNormalizeTitleCase,
    // Dedupe tests
    testDeduplicateByUrl,
    testDeduplicateByTitle,
    testDeduplicateWithinBatch,
    testDeduplicateOldItemsIgnored,
    // Generate ID tests
    testGenerateIdUnique,
    testGenerateIdConsistent,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = test();
    if (result.status === "PASS") {
      console.log(`  ✅ ${result.name}`);
      passed++;
    } else {
      console.log(`  ❌ ${result.name}`);
      if (result.error) {
        console.log(`     └─ ${result.error}`);
      }
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
