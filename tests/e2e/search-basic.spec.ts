import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Story 1: Basic Content Search
 * TDD: These tests must be written FIRST and FAIL before implementation
 */

test.describe('US1: Basic Content Search', () => {
  // T013: Search form submission navigates to /buscar with query param
  test('search form submission navigates to /buscar with query param', async ({ page, isMobile }) => {
    await page.goto('/');

    let searchInput;
    if (isMobile) {
      // On mobile, need to open the menu first
      const menuButton = page.locator('#mobile-menu-button');
      await menuButton.click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      // Use the mobile menu search input
      searchInput = page.locator('#mobile-menu [data-testid="search-input"]');
    } else {
      // Desktop: use nav search input
      searchInput = page.locator('nav [data-testid="search-input"]');
    }

    await expect(searchInput).toBeVisible();

    // Enter search query
    await searchInput.fill('BTS');
    await searchInput.press('Enter');

    // Should navigate to /buscar with query parameter
    await expect(page).toHaveURL(/\/buscar\?q=BTS/i);
  });

  // T014: Search results page displays matching articles
  test('search results page displays matching articles with title, type, excerpt, date', async ({ page }) => {
    await page.goto('/buscar?q=BTS');

    // Wait for Pagefind to load and search to complete (loading spinner disappears)
    await expect(page.locator('#search-loading')).toBeHidden({ timeout: 10000 });

    // Should display search results
    const resultsContainer = page.locator('[data-testid="search-results"]');
    await expect(resultsContainer).toBeVisible({ timeout: 10000 });

    // Should show result count
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible();
    await expect(resultCount).toContainText(/resultado/i);

    // Each result card should have required elements
    const firstResult = page.locator('[data-testid="search-result-card"]').first();
    await expect(firstResult).toBeVisible();

    // Title
    await expect(firstResult.locator('[data-testid="result-title"]')).toBeVisible();

    // Content type badge
    await expect(firstResult.locator('[data-testid="result-type"]')).toBeVisible();

    // Excerpt
    await expect(firstResult.locator('[data-testid="result-excerpt"]')).toBeVisible();

    // Publication date
    await expect(firstResult.locator('[data-testid="result-date"]')).toBeVisible();
  });

  // T015: No results message appears for queries with no matches
  test('"no results" message appears for queries with no matches', async ({ page }) => {
    // Search for something that definitely won't match (use uncommon unicode characters)
    await page.goto('/buscar?q=zzzzqqqq');

    // Wait for Pagefind to load and search to complete
    await expect(page.locator('#search-loading')).toBeHidden({ timeout: 10000 });

    // Should show "no results" message
    const noResults = page.locator('[data-testid="no-results"]');
    await expect(noResults).toBeVisible({ timeout: 10000 });
    await expect(noResults).toContainText(/no se encontraron/i);
  });

  // Additional test: Search input exists in header on all pages
  test('search input is accessible from homepage header', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      // On mobile, need to open the menu first
      const menuButton = page.locator('#mobile-menu-button');
      await menuButton.click();
      await expect(page.locator('#mobile-menu')).toBeVisible();

      // Check mobile search input
      const searchInput = page.locator('#mobile-menu [data-testid="search-input"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
    } else {
      // Desktop: search is visible in nav (not in mobile menu)
      const searchInput = page.locator('nav [data-testid="search-input"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
    }
  });

  // Additional test: Query is displayed on results page
  test('search query is displayed on results page', async ({ page }) => {
    await page.goto('/buscar?q=drama');

    // Wait for search to complete
    await expect(page.locator('#search-loading')).toBeHidden({ timeout: 10000 });

    // Query term should be visible in the result count
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toContainText(/drama/i);
  });

  // C2: Error handling when search index fails to load
  test('shows error message when search fails to load', async ({ page }) => {
    // Block the Pagefind script to simulate unavailable index
    await page.route('**/pagefind/**', route => route.abort());

    // Navigate to search page with query
    await page.goto('/buscar?q=test');

    // Wait for error state to appear (search will fail after attempting to load)
    await page.waitForTimeout(3000);

    // Should show error message
    const errorMessage = page.locator('text=Error al cargar los resultados');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  // C1: Verify draft articles are excluded from search (FR-007)
  // Note: Pagefind only indexes published content in dist/ - drafts are implicitly excluded
  // This test verifies the search index doesn't contain draft-specific markers
  test('search results only contain published content', async ({ page }) => {
    // Search for a broad term that would match most content
    await page.goto('/buscar?q=content');

    // Wait for search to complete
    await expect(page.locator('[data-testid="search-results"]').or(page.locator('[data-testid="no-results"]'))).toBeVisible({ timeout: 10000 });

    // Get all result URLs
    const results = page.locator('[data-testid="search-result-card"] a');
    const count = await results.count();

    // Verify none of the results contain "/draft" in their URLs
    // (Draft content should never be indexed by Pagefind)
    for (let i = 0; i < count; i++) {
      const href = await results.nth(i).getAttribute('href');
      expect(href).not.toContain('/draft');
      expect(href).not.toContain('draft=true');
    }
  });
});
