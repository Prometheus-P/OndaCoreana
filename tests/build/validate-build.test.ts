/**
 * TDD Test: Build Validation
 *
 * RED: 빌드 실패 또는 필수 파일 누락
 * GREEN: 빌드 성공 및 모든 필수 파일 존재
 * REFACTOR: 빌드 최적화
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// === BUILD REQUIREMENTS ===

interface BuildRequirement {
  name: string;
  path: string;
  type: 'file' | 'directory';
  required: boolean;
}

const buildRequirements: BuildRequirement[] = [
  // Core pages
  { name: 'Homepage', path: 'index.html', type: 'file', required: true },
  { name: 'Dramas Index', path: 'dramas.html', type: 'file', required: true },
  { name: 'K-Pop Index', path: 'kpop.html', type: 'file', required: true },
  { name: 'Noticias Index', path: 'noticias.html', type: 'file', required: true },
  { name: 'Guias Index', path: 'guias.html', type: 'file', required: true },

  // SEO files
  { name: 'Sitemap Index', path: 'sitemap-index.xml', type: 'file', required: true },
  { name: 'Robots.txt', path: 'robots.txt', type: 'file', required: true },

  // Content directories
  { name: 'Dramas Content', path: 'dramas', type: 'directory', required: true },
  { name: 'K-Pop Content', path: 'kpop', type: 'directory', required: true },
  { name: 'Guias Content', path: 'guias', type: 'directory', required: true },

  // Assets
  { name: 'Assets Directory', path: '_astro', type: 'directory', required: true },
];

// === TEST UTILITIES ===

interface BuildTestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

function checkRequirement(req: BuildRequirement, distDir: string): BuildTestResult {
  const fullPath = path.join(distDir, req.path);
  const exists = fs.existsSync(fullPath);

  if (req.type === 'directory') {
    const isDir = exists && fs.statSync(fullPath).isDirectory();
    if (isDir) {
      const files = fs.readdirSync(fullPath);
      return {
        name: req.name,
        status: 'PASS',
        message: `Found with ${files.length} files`,
      };
    }
  } else {
    if (exists) {
      const stats = fs.statSync(fullPath);
      return {
        name: req.name,
        status: 'PASS',
        message: `Found (${(stats.size / 1024).toFixed(1)} KB)`,
      };
    }
  }

  return {
    name: req.name,
    status: req.required ? 'FAIL' : 'PASS',
    message: req.required ? 'Missing required file/directory' : 'Optional, not found',
  };
}

function countHTMLFiles(dir: string): number {
  let count = 0;

  if (!fs.existsSync(dir)) return 0;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      count += countHTMLFiles(fullPath);
    } else if (item.name.endsWith('.html')) {
      count++;
    }
  }

  return count;
}

function getBuildSize(dir: string): number {
  let size = 0;

  if (!fs.existsSync(dir)) return 0;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      size += getBuildSize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }

  return size;
}

// === TEST RUNNER ===

function runTests() {
  console.log('\n🏗️ TDD Build Validation Tests\n');
  console.log('='.repeat(60));

  // Astro with server mode outputs to dist/client for static files
  const baseDistDir = path.join(process.cwd(), 'dist');
  const clientDistDir = path.join(baseDistDir, 'client');

  // Check if build exists
  if (!fs.existsSync(baseDistDir)) {
    console.log('\n⚠️ Build directory not found. Running build...\n');
    try {
      execSync('pnpm build', { stdio: 'inherit', cwd: process.cwd() });
    } catch {
      console.log('\n❌ RED: Build failed!\n');
      process.exit(1);
    }
  }

  // Re-check for client directory after build
  const finalDistDir = fs.existsSync(clientDistDir) ? clientDistDir : baseDistDir;

  console.log('\n📋 Checking build requirements:\n');

  let totalPass = 0;
  let totalFail = 0;

  for (const req of buildRequirements) {
    const result = checkRequirement(req, finalDistDir);
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} ${result.name}: ${result.message}`);

    if (result.status === 'PASS') totalPass++;
    else totalFail++;
  }

  // Summary statistics
  console.log('\n📊 Build Statistics:\n');
  const htmlCount = countHTMLFiles(finalDistDir);
  const buildSize = getBuildSize(finalDistDir);
  console.log(`  📄 HTML Pages: ${htmlCount}`);
  console.log(`  📦 Total Size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);

  // Content counts
  console.log('\n📁 Content Counts:\n');
  const collections = ['dramas', 'kpop', 'noticias', 'guias'];
  for (const col of collections) {
    const colDir = path.join(finalDistDir, col);
    if (fs.existsSync(colDir)) {
      const files = fs.readdirSync(colDir).filter(f => f.endsWith('.html'));
      console.log(`  ${col}: ${files.length} pages`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${totalPass} passed, ${totalFail} failed\n`);

  if (totalFail > 0) {
    console.log('❌ RED: Build validation failing!\n');
    process.exit(1);
  } else {
    console.log('✅ GREEN: Build validation passing!\n');
    process.exit(0);
  }
}

runTests();
