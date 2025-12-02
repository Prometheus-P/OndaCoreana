import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/OndaCorea/);

    // Check main heading
    await expect(page.locator('h1')).toBeVisible();

    // Check navigation exists
    await expect(page.locator('nav')).toBeVisible();
  });

  test('navigation links work', async ({ page, isMobile }) => {
    await page.goto('/');

    // On mobile, navigation might be in a hamburger menu
    // Use direct navigation for mobile, click for desktop
    if (isMobile) {
      // Test by direct navigation on mobile
      await page.goto('/dramas');
      await expect(page.locator('h1')).toContainText(/[Dd]ramas/);

      await page.goto('/kpop');
      await expect(page.locator('h1')).toContainText(/[Kk]-?[Pp]op/);

      await page.goto('/noticias');
      await expect(page.locator('h1')).toContainText(/[Nn]oticias/);

      await page.goto('/guias');
      await expect(page.locator('h1')).toContainText(/[Gg]u[ií]as/);
    } else {
      // Desktop: click navigation links
      await page.click('a[href="/dramas"]');
      await expect(page).toHaveURL('/dramas');
      await expect(page.locator('h1')).toContainText(/[Dd]ramas/);

      await page.click('a[href="/kpop"]');
      await expect(page).toHaveURL('/kpop');
      await expect(page.locator('h1')).toContainText(/[Kk]-?[Pp]op/);

      await page.click('a[href="/noticias"]');
      await expect(page).toHaveURL('/noticias');
      await expect(page.locator('h1')).toContainText(/[Nn]oticias/);

      await page.click('a[href="/guias"]');
      await expect(page).toHaveURL('/guias');
      await expect(page.locator('h1')).toContainText(/[Gg]u[ií]as/);
    }
  });

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/dramas');
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });
});
