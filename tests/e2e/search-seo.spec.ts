import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Story 4: SEO-Friendly Search Results Page
 * TDD: These tests must be written FIRST and FAIL before implementation
 */

test.describe('US4: SEO-Friendly Search Results Page', () => {
  // T050: Direct URL access /buscar?q=BTS renders with pre-populated results
  test('direct URL access with query renders pre-populated results', async ({ page }) => {
    // Navigate directly to search page with query
    await page.goto('/buscar?q=BTS');

    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    // Should have search results displayed
    const results = page.locator('[data-testid="search-result-card"]');
    await expect(results.first()).toBeVisible();

    // Search input on the buscar page should be pre-populated with the query
    // Use the main search input specific to the buscar page (the lg size one)
    const searchInput = page.locator('#main-content [data-testid="search-input"]');
    await expect(searchInput).toHaveValue('BTS');
  });

  // T051: Page has correct title, description, canonical meta tags
  test('page has correct SEO meta tags', async ({ page }) => {
    await page.goto('/buscar?q=BTS');

    // Wait for page to load
    await expect(page.locator('[data-testid="search-results"]').first()).toBeVisible({ timeout: 10000 });

    // Check title contains the search query
    const title = await page.title();
    expect(title).toContain('BTS');
    expect(title).toContain('Buscar');

    // Check meta description exists and is relevant
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check canonical URL exists and includes query
    const canonical = page.locator('link[rel="canonical"]');
    const canonicalHref = await canonical.getAttribute('href');
    expect(canonicalHref).toContain('/buscar');
    expect(canonicalHref).toContain('q=BTS');
  });

  // T052: Shared URL shows same results for different users (simulated by reload)
  test('shared URL shows same results after reload', async ({ page }) => {
    // Navigate to search page with query
    await page.goto('/buscar?q=drama');

    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    // Get result count
    const resultCountText = await page.locator('[data-testid="result-count"]').textContent();

    // Reload page (simulating sharing URL to another user)
    await page.reload();

    // Wait for results again
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    // Result count should be the same
    const newResultCountText = await page.locator('[data-testid="result-count"]').textContent();
    expect(newResultCountText).toBe(resultCountText);
  });

  // Additional test: Open Graph tags are present
  test('page has Open Graph meta tags', async ({ page }) => {
    await page.goto('/buscar?q=BTS');

    // Wait for page to load
    await expect(page.locator('[data-testid="search-results"]').first()).toBeVisible({ timeout: 10000 });

    // Check og:title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /BTS/);

    // Check og:description
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);

    // Check og:type
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');

    // Check og:url
    const ogUrl = page.locator('meta[property="og:url"]');
    const ogUrlContent = await ogUrl.getAttribute('content');
    expect(ogUrlContent).toContain('/buscar');
  });

  // Additional test: noindex for empty queries
  test('empty query page has noindex directive', async ({ page }) => {
    await page.goto('/buscar');

    // Check for noindex meta tag
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', /noindex/);
  });

  // Additional test: noindex is NOT present when there's a valid query
  test('valid query page does not have noindex', async ({ page }) => {
    await page.goto('/buscar?q=BTS');

    // Wait for results
    await expect(page.locator('[data-testid="search-results"]').first()).toBeVisible({ timeout: 10000 });

    // Check that noindex is not present (or robots allows indexing)
    const robotsMeta = page.locator('meta[name="robots"][content*="noindex"]');
    await expect(robotsMeta).toHaveCount(0);
  });

  // Additional test: Twitter card meta tags
  test('page has Twitter card meta tags', async ({ page }) => {
    await page.goto('/buscar?q=BTS');

    // Wait for page to load
    await expect(page.locator('[data-testid="search-results"]').first()).toBeVisible({ timeout: 10000 });

    // Check twitter:card
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', /.+/);

    // Check twitter:title
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveAttribute('content', /BTS/);
  });
});
