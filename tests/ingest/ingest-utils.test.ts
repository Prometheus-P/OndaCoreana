import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { DraftItem } from '../../scripts/ingest/normalize';
import { dedupeDrafts, slugify } from '../../scripts/ingest/normalize';

function createDraft(overrides: Partial<DraftItem>): DraftItem {
  return {
    id: overrides.id ?? 'id',
    source: overrides.source ?? { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/item' },
    category: overrides.category ?? 'kpop',
    title: overrides.title ?? 'Sample Title',
    summary: overrides.summary ?? 'Summary',
    publishedAt: overrides.publishedAt ?? new Date().toISOString(),
    language: 'es',
    raw: overrides.raw ?? {},
  } satisfies DraftItem;
}

test('slugify normalizes accents, casing, and symbols', () => {
  assert.equal(slugify('K-Pop en Español!'), 'k-pop-en-espanol');
  assert.equal(slugify('  Hola   Mundo  '), 'hola-mundo');
  assert.equal(slugify('Árbol & Río'), 'arbol-rio');
});

test('dedupeDrafts removes duplicates by URL or recent title match', () => {
  const day = 24 * 60 * 60 * 1000;
  const existing: DraftItem[] = [
    createDraft({
      id: 'existing-1',
      source: { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/a' },
      title: 'Nuevo comeback',
      publishedAt: new Date().toISOString(),
    }),
    createDraft({
      id: 'old-title',
      source: { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/old' },
      title: 'Historia antigua',
      publishedAt: new Date(Date.now() - 10 * day).toISOString(),
    }),
  ];

  const candidates: DraftItem[] = [
    createDraft({
      id: 'duplicate-url',
      source: { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/a' },
      title: 'Algo diferente',
    }),
    createDraft({
      id: 'duplicate-title',
      source: { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/b' },
      title: 'Nuevo comeback!!!',
    }),
    createDraft({
      id: 'old-title-match',
      source: { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/c' },
      title: 'Historia antigua',
    }),
    createDraft({
      id: 'unique',
      source: { name: 'Source', url: 'https://example.com', itemUrl: 'https://example.com/d' },
      title: 'Publicación fresca',
    }),
  ];

  const deduped = dedupeDrafts(candidates, existing, 7);

  assert.equal(deduped.length, 2);
  assert.ok(deduped.some((draft) => draft.id === 'old-title-match'));
  assert.ok(deduped.some((draft) => draft.id === 'unique'));
});
