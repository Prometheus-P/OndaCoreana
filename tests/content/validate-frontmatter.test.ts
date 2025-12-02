/**
 * TDD Test: Content Frontmatter Validation
 *
 * RED: 이 테스트가 실패해야 TDD 사이클 시작
 * GREEN: 올바른 frontmatter 작성 후 통과
 * REFACTOR: 콘텐츠 품질 개선
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// === SCHEMAS (src/content/config.ts와 동일) ===

const baseArticleSchema = z.object({
  title: z.string().max(60, 'Title must be 60 characters or less for SEO'),
  description: z.string().max(160, 'Description must be 160 characters or less for SEO'),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  author: z.string().default('OndaCorea'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const dramaSchema = baseArticleSchema.extend({
  dramaTitle: z.string({ required_error: 'dramaTitle is required for dramas collection' }),
  dramaYear: z.number().optional(),
  network: z.string().optional(),
  episodes: z.number().optional(),
  genre: z.array(z.string()).default([]),
  cast: z.array(z.string()).default([]),
  whereToWatch: z.array(z.string()).default([]),
});

const kpopSchema = baseArticleSchema.extend({
  artistName: z.string({ required_error: 'artistName is required for kpop collection' }),
  artistType: z.enum(['solista', 'grupo', 'banda']).default('grupo'),
  agency: z.string().optional(),
  debutYear: z.number().optional(),
  members: z.array(z.string()).optional(),
});

const noticiasSchema = baseArticleSchema.extend({
  category: z.enum(['drama', 'kpop', 'cine', 'cultura', 'general'], {
    required_error: 'category is required for noticias collection',
  }),
  breaking: z.boolean().default(false),
  source: z.string().optional(),
});

const guiasSchema = baseArticleSchema.extend({
  category: z.enum(['streaming', 'viaje', 'idioma', 'cultura', 'general'], {
    required_error: 'category is required for guias collection',
  }),
  difficulty: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
  readingTime: z.number().optional(),
});

// === TEST UTILITIES ===

interface TestResult {
  file: string;
  status: 'PASS' | 'FAIL';
  errors: string[];
}

function getSchema(collection: string) {
  switch (collection) {
    case 'dramas': return dramaSchema;
    case 'kpop': return kpopSchema;
    case 'noticias': return noticiasSchema;
    case 'guias': return guiasSchema;
    default: throw new Error(`Unknown collection: ${collection}`);
  }
}

function validateFile(filePath: string, collection: string): TestResult {
  const result: TestResult = {
    file: path.basename(filePath),
    status: 'PASS',
    errors: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(content);

    const schema = getSchema(collection);
    schema.parse(frontmatter);
  } catch (error) {
    result.status = 'FAIL';
    if (error instanceof z.ZodError) {
      result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    } else if (error instanceof Error) {
      result.errors = [error.message];
    }
  }

  return result;
}

function validateCollection(collection: string): TestResult[] {
  const contentDir = path.join(process.cwd(), 'src', 'content', collection);

  if (!fs.existsSync(contentDir)) {
    return [{ file: collection, status: 'FAIL', errors: [`Directory not found: ${contentDir}`] }];
  }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  return files.map(file => validateFile(path.join(contentDir, file), collection));
}

// === TEST RUNNER ===

function runTests() {
  console.log('\n🧪 TDD Content Validation Tests\n');
  console.log('=' .repeat(60));

  const collections = ['dramas', 'kpop', 'noticias', 'guias'];
  let totalPass = 0;
  let totalFail = 0;

  for (const collection of collections) {
    console.log(`\n📁 Collection: ${collection}`);
    console.log('-'.repeat(40));

    const results = validateCollection(collection);

    for (const result of results) {
      if (result.status === 'PASS') {
        console.log(`  ✅ ${result.file}`);
        totalPass++;
      } else {
        console.log(`  ❌ ${result.file}`);
        result.errors.forEach(err => console.log(`     └─ ${err}`));
        totalFail++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${totalPass} passed, ${totalFail} failed\n`);

  if (totalFail > 0) {
    console.log('❌ RED: Tests failing - Fix frontmatter to proceed to GREEN\n');
    process.exit(1);
  } else {
    console.log('✅ GREEN: All tests passing!\n');
    process.exit(0);
  }
}

runTests();
