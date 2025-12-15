#!/usr/bin/env node
/**
 * Content Quality Check Script
 * Validates MDX entries for quality standards before publishing
 *
 * Usage:
 *   pnpm quality:check [--threshold=5] [--strict]
 */

import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

// === CONFIGURATION ===

interface QualityConfig {
  threshold: number; // Max violations before failing build
  strict: boolean; // Fail on any violation
}

const DEFAULT_CONFIG: QualityConfig = {
  threshold: 5,
  strict: false,
};

// === TYPES ===

type Severity = "error" | "warning";

interface Violation {
  file: string;
  rule: string;
  message: string;
  severity: Severity;
}

interface ValidationResult {
  file: string;
  collection: string;
  violations: Violation[];
}

// Suspicious patterns that should not appear in body text
const SUSPICIOUS_PATTERNS = [
  { pattern: /T00:00:00\.000Z/g, name: "Raw ISO timestamp" },
  { pattern: /\[object Object\]/g, name: "Stringified object" },
  { pattern: /undefined/g, name: "Undefined value" },
  { pattern: /null(?!\s*[,}\]])/g, name: "Null value in text" },
  { pattern: /Lorem ipsum/gi, name: "Placeholder text" },
  { pattern: /TODO:|FIXME:|XXX:/gi, name: "TODO comment" },
];

// === VALIDATION RULES ===

function validateTitleLength(frontmatter: Record<string, unknown>, file: string): Violation | null {
  const title = frontmatter.title as string | undefined;
  if (!title || title.length < 12) {
    return {
      file,
      rule: "title-length",
      message: `Title too short: "${title || "(missing)"}" (min 12 chars, got ${title?.length || 0})`,
      severity: "error",
    };
  }
  return null;
}

function validateDescriptionLength(frontmatter: Record<string, unknown>, file: string): Violation | null {
  const description = (frontmatter.description || frontmatter.descriptionEs) as string | undefined;
  if (!description || description.length < 50) {
    return {
      file,
      rule: "description-length",
      message: `Description too short: ${description?.length || 0} chars (min 50)`,
      severity: "error",
    };
  }
  return null;
}

function validateNoticiasSource(
  frontmatter: Record<string, unknown>,
  collection: string,
  file: string
): Violation | null {
  if (collection === "noticias" && !frontmatter.source) {
    return {
      file,
      rule: "noticias-source",
      message: "Noticias entries must have a 'source' field",
      severity: "warning",
    };
  }
  return null;
}

function validateKpopTags(
  frontmatter: Record<string, unknown>,
  collection: string,
  file: string
): Violation | null {
  if (collection === "kpop") {
    const tags = frontmatter.tags as string[] | undefined;
    if (!tags || tags.length < 1) {
      return {
        file,
        rule: "kpop-tags",
        message: "K-Pop entries must have at least 1 tag",
        severity: "error",
      };
    }
  }
  return null;
}

function validateSuspiciousContent(content: string, file: string): Violation[] {
  const violations: Violation[] = [];

  for (const { pattern, name } of SUSPICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file,
        rule: "suspicious-content",
        message: `Found ${name}: "${matches[0]}"`,
        severity: "warning",
      });
    }
  }

  return violations;
}

function validateHeroImage(frontmatter: Record<string, unknown>, file: string): Violation | null {
  const heroImage = frontmatter.heroImage as string | undefined;
  if (heroImage && !frontmatter.heroImageAlt) {
    return {
      file,
      rule: "hero-image-alt",
      message: "Hero image present but missing heroImageAlt (accessibility)",
      severity: "warning",
    };
  }
  return null;
}

function validatePubDate(frontmatter: Record<string, unknown>, file: string): Violation | null {
  const pubDate = frontmatter.pubDate;
  if (!pubDate) {
    return {
      file,
      rule: "pub-date",
      message: "Missing pubDate field",
      severity: "error",
    };
  }
  return null;
}

// === MAIN VALIDATION ===

function validateFile(filePath: string, collection: string): ValidationResult {
  const result: ValidationResult = {
    file: path.relative(process.cwd(), filePath),
    collection,
    violations: [],
  };

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // Run all validation rules
    const checks = [
      validateTitleLength(frontmatter, result.file),
      validateDescriptionLength(frontmatter, result.file),
      validateNoticiasSource(frontmatter, collection, result.file),
      validateKpopTags(frontmatter, collection, result.file),
      validateHeroImage(frontmatter, result.file),
      validatePubDate(frontmatter, result.file),
      ...validateSuspiciousContent(content, result.file),
    ];

    result.violations = checks.filter((v): v is Violation => v !== null);
  } catch (error) {
    result.violations.push({
      file: result.file,
      rule: "parse-error",
      message: `Failed to parse: ${error instanceof Error ? error.message : "Unknown error"}`,
      severity: "error",
    });
  }

  return result;
}

function validateCollection(collection: string): ValidationResult[] {
  const contentDir = path.join(process.cwd(), "src", "content", collection);

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  return files.map((file) => validateFile(path.join(contentDir, file), collection));
}

// === CLI ===

function parseArgs(): QualityConfig {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (const arg of args) {
    if (arg.startsWith("--threshold=")) {
      config.threshold = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--strict") {
      config.strict = true;
    }
  }

  return config;
}

function main(): void {
  const config = parseArgs();
  const collections = ["dramas", "kpop", "noticias", "guias", "features"];

  console.log("\n🔍 Content Quality Check\n");
  console.log("=".repeat(60));
  console.log(`Mode: ${config.strict ? "STRICT" : "THRESHOLD"}`);
  if (!config.strict) {
    console.log(`Threshold: ${config.threshold} violations max`);
  }
  console.log("");

  let totalErrors = 0;
  let totalWarnings = 0;
  const allResults: ValidationResult[] = [];

  for (const collection of collections) {
    const results = validateCollection(collection);
    allResults.push(...results);

    const collectionViolations = results.flatMap((r) => r.violations);
    if (collectionViolations.length > 0) {
      console.log(`\n📁 ${collection}/`);
      console.log("-".repeat(40));

      for (const result of results) {
        if (result.violations.length > 0) {
          console.log(`\n  📄 ${path.basename(result.file)}`);
          for (const v of result.violations) {
            const icon = v.severity === "error" ? "❌" : "⚠️";
            console.log(`     ${icon} [${v.rule}] ${v.message}`);
            if (v.severity === "error") totalErrors++;
            else totalWarnings++;
          }
        }
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Summary\n");
  console.log(`   Files checked:  ${allResults.length}`);
  console.log(`   Errors:         ${totalErrors}`);
  console.log(`   Warnings:       ${totalWarnings}`);
  console.log(`   Total:          ${totalErrors + totalWarnings}`);
  console.log("");

  // Determine exit code
  const shouldFail = config.strict
    ? totalErrors + totalWarnings > 0
    : totalErrors > config.threshold;

  if (shouldFail) {
    console.log("❌ Quality check FAILED\n");
    if (config.strict) {
      console.log("   Strict mode: Any violation fails the build.");
    } else {
      console.log(`   Error count (${totalErrors}) exceeds threshold (${config.threshold}).`);
    }
    console.log("\n💡 Fix the errors above before proceeding.\n");
    process.exit(1);
  } else {
    console.log("✅ Quality check PASSED\n");
    if (totalWarnings > 0) {
      console.log(`   Note: ${totalWarnings} warning(s) found. Consider fixing them.\n`);
    }
  }
}

main();
