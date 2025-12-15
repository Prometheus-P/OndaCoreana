#!/usr/bin/env tsx
/**
 * Check Pagefind index size to ensure it stays under budget.
 * Run after build: pnpm build:check
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const PAGEFIND_DIR = 'dist/pagefind';
const INDEX_SIZE_LIMIT_KB = 250;

function getDirSize(dir: string): number {
  let size = 0;
  try {
    const files = readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const path = join(dir, file.name);
      if (file.isDirectory()) {
        size += getDirSize(path);
      } else {
        size += statSync(path).size;
      }
    }
  } catch {
    return 0;
  }
  return size;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log('🔍 Checking Pagefind index size...\n');

  // Check index and fragment directories (actual search data)
  const indexDir = join(PAGEFIND_DIR, 'index');
  const fragmentDir = join(PAGEFIND_DIR, 'fragment');

  const indexSize = getDirSize(indexDir);
  const fragmentSize = getDirSize(fragmentDir);
  const searchDataSize = indexSize + fragmentSize;
  const searchDataKB = searchDataSize / 1024;

  console.log(`📊 Search Data Size:`);
  console.log(`   Index:     ${formatBytes(indexSize)}`);
  console.log(`   Fragments: ${formatBytes(fragmentSize)}`);
  console.log(`   Total:     ${formatBytes(searchDataSize)}`);
  console.log('');

  // Check total pagefind directory
  const totalSize = getDirSize(PAGEFIND_DIR);
  console.log(`📦 Total Pagefind Directory: ${formatBytes(totalSize)}`);
  console.log('');

  // Verdict
  if (searchDataKB > INDEX_SIZE_LIMIT_KB) {
    console.log(`❌ FAIL: Search data (${formatBytes(searchDataSize)}) exceeds ${INDEX_SIZE_LIMIT_KB}KB limit!`);
    console.log('');
    console.log('💡 Tips to reduce size:');
    console.log('   - Reduce metadata in data-pagefind-meta attributes');
    console.log('   - Exclude unnecessary pages with data-pagefind-ignore');
    console.log('   - Shorten page descriptions');
    process.exit(1);
  } else {
    console.log(`✅ PASS: Search data (${formatBytes(searchDataSize)}) is under ${INDEX_SIZE_LIMIT_KB}KB limit`);
    const remaining = INDEX_SIZE_LIMIT_KB - searchDataKB;
    console.log(`   Budget remaining: ${remaining.toFixed(1)}KB`);
  }
}

main().catch(console.error);
