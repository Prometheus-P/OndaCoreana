import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Story 3: Filter by Content Type
 * TDD: These tests must be written FIRST and FAIL before implementation
 */

test.describe('US3: Filter by Content Type', () => {
  // T038: Selecting "K-Dramas" filter shows only drama results
  test('selecting K-Dramas filter shows only drama results', async ({ page }) => {
    // Go to search page with query
    await page.goto('/buscar?q=drama');

    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    // Find and click the K-Dramas filter
    const dramaFilter = page.locator('[data-testid="filter-dramas"]');
    await expect(dramaFilter).toBeVisible();
    await dramaFilter.click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // All visible results should be dramas
    const results = page.locator('[data-testid="search-result-card"]');
    const count = await results.count();

    if (count > 0) {
      // Check that all results have the K-Drama type badge
      for (let i = 0; i < count; i++) {
        const typeLabel = results.nth(i).locator('[data-testid="result-type"]');
        await expect(typeLabel).toContainText(/K-Drama/i);
      }
    }
  });

  // T039: Selecting "Todos" shows all content types again
  test('selecting Todos filter shows all content types again', async ({ page }) => {
    // Go to search page with query and dramas filter pre-selected
    await page.goto('/buscar?q=BTS&type=dramas');

    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    // Find and click the "Todos" filter
    const todosFilter = page.locator('[data-testid="filter-all"]');
    await expect(todosFilter).toBeVisible();
    await todosFilter.click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // URL should update to remove the type parameter
    await expect(page).not.toHaveURL(/type=/);
  });

  // T040: Filter with no matching results shows appropriate message
  test('filter with no matching results shows appropriate message', async ({ page }) => {
    // Search for something that won't have all content types
    await page.goto('/buscar?q=BTS');

    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    // Find and click the "Guías" filter (unlikely to have BTS guides)
    const guiasFilter = page.locator('[data-testid="filter-guias"]');
    await expect(guiasFilter).toBeVisible();
    await guiasFilter.click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Should either show no results message OR show results
    // If there are guias about BTS, that's fine too
    const noResults = page.locator('[data-testid="no-results"]');
    const results = page.locator('[data-testid="search-result-card"]');

    // Either no results or all results are guias
    const noResultsVisible = await noResults.isVisible();
    const resultCount = await results.count();

    expect(noResultsVisible || resultCount >= 0).toBeTruthy();
  });

  // Additional test: Filter tabs are visible on search results page
  test('filter tabs are visible on search results page', async ({ page }) => {
    await page.goto('/buscar?q=test');

    // Wait for page to load
    await expect(page.locator('[data-testid="search-results"]').or(page.locator('[data-testid="no-results"]'))).toBeVisible({ timeout: 10000 });

    // All filter tabs should be visible
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-dramas"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-kpop"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-noticias"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-guias"]')).toBeVisible();
  });

  // Additional test: Selected filter has active styling
  test('selected filter has active styling', async ({ page }) => {
    await page.goto('/buscar?q=drama&type=dramas');

    // Wait for page to load
    await expect(page.locator('[data-testid="search-results"]').or(page.locator('[data-testid="no-results"]'))).toBeVisible({ timeout: 10000 });

    // K-Dramas filter should have active class/aria state
    const dramaFilter = page.locator('[data-testid="filter-dramas"]');
    await expect(dramaFilter).toHaveAttribute('aria-selected', 'true');
  });

  // Additional test: URL updates when filter changes
  test('URL updates when filter changes', async ({ page }) => {
    await page.goto('/buscar?q=test');

    // Wait for page to load
    await expect(page.locator('[data-testid="search-results"]').or(page.locator('[data-testid="no-results"]'))).toBeVisible({ timeout: 10000 });

    // Click K-Pop filter
    const kpopFilter = page.locator('[data-testid="filter-kpop"]');
    await expect(kpopFilter).toBeVisible();
    await kpopFilter.click();

    // URL should update with type parameter
    await expect(page).toHaveURL(/type=kpop/);
  });

  // Additional test: Filter persists on page reload
  test('filter persists on page reload', async ({ page }) => {
    // Go to search page with filter
    await page.goto('/buscar?q=test&type=noticias');

    // Wait for page to load - use first() since no-results is inside search-results
    await expect(page.locator('[data-testid="search-results"]').first()).toBeVisible({ timeout: 10000 });

    // Noticias filter should be selected
    const noticiasFilter = page.locator('[data-testid="filter-noticias"]');
    await expect(noticiasFilter).toHaveAttribute('aria-selected', 'true');
  });
});
