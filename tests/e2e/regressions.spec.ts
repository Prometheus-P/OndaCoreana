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
      const searchContainers = page.locator('[data-testid="site-search"]');
      await expect(searchContainers).toHaveCount(1);
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
