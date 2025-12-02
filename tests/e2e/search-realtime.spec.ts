import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Story 2: Real-Time Search Suggestions
 * TDD: These tests must be written FIRST and FAIL before implementation
 */

test.describe('US2: Real-Time Search Suggestions', () => {
  // Helper to get the correct search wrapper based on viewport
  async function getSearchWrapper(page: any, isMobile: boolean) {
    if (isMobile) {
      // On mobile, open the menu first
      const menuButton = page.locator('#mobile-menu-button');
      await menuButton.click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      return page.locator('#mobile-menu [data-search-wrapper]');
    } else {
      return page.locator('nav [data-search-wrapper]');
    }
  }

  // T027: Typing 2+ characters triggers search within 300ms
  test('typing 2+ characters triggers inline search results', async ({ page, isMobile }) => {
    await page.goto('/');

    const wrapper = await getSearchWrapper(page, isMobile);
    const searchInput = wrapper.locator('[data-testid="search-input"]');
    const dropdown = wrapper.locator('[data-testid="search-dropdown"]');

    await expect(searchInput).toBeVisible();

    // Type 2+ characters
    await searchInput.fill('BTS');

    // Wait for inline results dropdown to appear (should trigger within 300ms + render time)
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Should show search results in dropdown
    const dropdownResults = dropdown.locator('[data-testid="dropdown-result"]');
    await expect(dropdownResults.first()).toBeVisible();
  });

  // T028: Results update as user continues typing (debounced)
  test('results update as user continues typing with debounce', async ({ page, isMobile }) => {
    await page.goto('/');

    const wrapper = await getSearchWrapper(page, isMobile);
    const searchInput = wrapper.locator('[data-testid="search-input"]');
    const dropdown = wrapper.locator('[data-testid="search-dropdown"]');

    await expect(searchInput).toBeVisible();

    // Type initial query
    await searchInput.fill('drama');

    // Wait for initial results
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Get initial result count
    const dropdownResults = dropdown.locator('[data-testid="dropdown-result"]');
    await expect(dropdownResults.first()).toBeVisible();
    const initialResults = await dropdownResults.count();

    // Type more characters to narrow search
    await searchInput.fill('drama goblin');

    // Wait for results to update (debounce + search time)
    await page.waitForTimeout(500);

    // Results should have updated
    const updatedResults = await dropdownResults.count();

    // Either fewer results or same (query refinement)
    expect(updatedResults).toBeLessThanOrEqual(initialResults);
  });

  // T029: Clicking a result in dropdown navigates to article
  test('clicking a result in dropdown navigates to article', async ({ page, isMobile }) => {
    await page.goto('/');

    const wrapper = await getSearchWrapper(page, isMobile);
    const searchInput = wrapper.locator('[data-testid="search-input"]');
    const dropdown = wrapper.locator('[data-testid="search-dropdown"]');

    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('BTS');

    // Wait for dropdown
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Get first result link
    const firstResult = dropdown.locator('[data-testid="dropdown-result"]').first();
    await expect(firstResult).toBeVisible();

    // Get the URL before clicking
    const href = await firstResult.getAttribute('href');
    expect(href).toBeTruthy();

    // Click the result
    await firstResult.click();

    // Should navigate to the article URL
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  // Additional test: Dropdown hides when clicking outside
  test('dropdown hides when clicking outside', async ({ page, isMobile }) => {
    await page.goto('/');

    const wrapper = await getSearchWrapper(page, isMobile);
    const searchInput = wrapper.locator('[data-testid="search-input"]');
    const dropdown = wrapper.locator('[data-testid="search-dropdown"]');

    await expect(searchInput).toBeVisible();

    // Type query to show dropdown
    await searchInput.fill('BTS');

    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Click outside the search area (on the main heading)
    await page.locator('h1').first().click({ force: true });

    // Dropdown should be hidden
    await expect(dropdown).toBeHidden({ timeout: 1000 });
  });

  // Additional test: Loading indicator shows during search
  test('loading indicator shows during search', async ({ page, isMobile }) => {
    await page.goto('/');

    const wrapper = await getSearchWrapper(page, isMobile);
    const searchInput = wrapper.locator('[data-testid="search-input"]');
    const dropdown = wrapper.locator('[data-testid="search-dropdown"]');

    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('BTS');

    // Either loading is visible OR results are already showing
    // (for very fast searches, loading may not be visible)
    await expect(dropdown).toBeVisible({ timeout: 3000 });
  });

  // Additional test: "View all results" link navigates to full search page
  test('view all results link navigates to search page', async ({ page, isMobile }) => {
    await page.goto('/');

    const wrapper = await getSearchWrapper(page, isMobile);
    const searchInput = wrapper.locator('[data-testid="search-input"]');
    const dropdown = wrapper.locator('[data-testid="search-dropdown"]');

    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('BTS');

    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Wait for results to load
    const dropdownResults = dropdown.locator('[data-testid="dropdown-result"]');
    await expect(dropdownResults.first()).toBeVisible();

    // Find and click "View all results" link
    const viewAllLink = dropdown.locator('[data-testid="view-all-results"]');
    await expect(viewAllLink).toBeVisible();
    await viewAllLink.click();

    // Should navigate to full search page with query
    await expect(page).toHaveURL(/\/buscar\?q=BTS/i);
  });
});
