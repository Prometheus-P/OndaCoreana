#!/usr/bin/env npx ts-node
/**
 * TDD Test Runner
 *
 * Runs all TDD tests and reports results.
 * Usage: npx ts-node tests/run-tdd.ts
 */

import { execSync } from 'child_process';

const TESTS = [
  { name: 'Content Validation', script: 'tests/content/validate-frontmatter.test.ts' },
  { name: 'Build Validation', script: 'tests/build/validate-build.test.ts' },
  { name: 'SEO Validation', script: 'tests/seo/validate-seo.test.ts' },
];

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  duration: number;
}

async function runTest(test: typeof TESTS[0]): Promise<TestResult> {
  const start = Date.now();

  try {
    execSync(`npx ts-node ${test.script}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    return {
      name: test.name,
      status: 'PASS',
      duration: Date.now() - start,
    };
  } catch {
    return {
      name: test.name,
      status: 'FAIL',
      duration: Date.now() - start,
    };
  }
}

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    TDD TEST RUNNER                           ║');
  console.log('║                  Red → Green → Refactor                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results: TestResult[] = [];

  for (const test of TESTS) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log('─'.repeat(60));

    const result = await runTest(test);
    results.push(result);

    console.log('\n');
  }

  // Summary
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                            ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');

  let allPass = true;
  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    const status = result.status === 'PASS' ? 'GREEN' : 'RED';
    console.log(`║  ${icon} ${result.name.padEnd(30)} ${status.padEnd(8)} ${result.duration}ms`.padEnd(65) + '║');
    if (result.status === 'FAIL') allPass = false;
  }

  console.log('╠══════════════════════════════════════════════════════════════╣');

  if (allPass) {
    console.log('║  ✅ ALL TESTS PASSING - GREEN STATE                          ║');
    console.log('║  → Ready for REFACTOR or next feature                        ║');
  } else {
    console.log('║  ❌ SOME TESTS FAILING - RED STATE                           ║');
    console.log('║  → Fix failing tests before proceeding                       ║');
  }

  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  process.exit(allPass ? 0 : 1);
}

main().catch(console.error);
