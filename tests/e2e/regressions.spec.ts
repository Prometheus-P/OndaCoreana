import { test, expect } from '@playwright/test';

test.describe('regression coverage', () => {
  test('article content does not leak frontmatter metadata', async ({ page }) => {
    await page.goto('/noticias/bts-regreso-2025');

    const articleContent = page.locator('article .prose');
    const bodyText = await articleContent.innerText();

    expect(bodyText).not.toContain('T00:00:00.000Z');
    expect(bodyText).not.toContain('/images/');
  });

  test('site search renders once per page', async ({ page }) => {
    for (const path of ['/', '/noticias']) {
      await page.goto(path);

      // There may be multiple search containers in the DOM for responsive design
      // (one for desktop header, one for mobile menu) but at most one should be visible
      const allSearchContainers = page.locator('[data-testid="site-search"]');
      const visibleSearchContainers = page.locator('[data-testid="site-search"]:visible');

      // Verify we have search containers in DOM (1-2 is acceptable for responsive design)
      const totalCount = await allSearchContainers.count();
      expect(totalCount).toBeGreaterThanOrEqual(1);
      expect(totalCount).toBeLessThanOrEqual(2);

      // At most one should be visible at any viewport
      const visibleCount = await visibleSearchContainers.count();
      expect(visibleCount).toBeLessThanOrEqual(1);
    }
  });

  test('canonical, og, and twitter URLs stay in sync', async ({ page }) => {
    await page.goto('/noticias');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const twitterUrl = await page.locator('meta[name="twitter:url"]').getAttribute('content');

    expect(canonical).toBeTruthy();
    expect(ogUrl).toBe(canonical);
    expect(twitterUrl).toBe(canonical);
  });
});
