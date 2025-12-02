import { test, expect } from '@playwright/test';

test.describe('SEO', () => {
  test('homepage has required meta tags', async ({ page }) => {
    await page.goto('/');

    // Title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(70);

    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThanOrEqual(160);

    // Canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('ondacorea.com');

    // Language
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('es');
  });

  test('Open Graph tags are present', async ({ page }) => {
    await page.goto('/');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBeTruthy();

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');
  });

  test('Twitter Card tags are present', async ({ page }) => {
    await page.goto('/');

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');

    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    expect(twitterTitle).toBeTruthy();

    const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
    expect(twitterDescription).toBeTruthy();
  });

  test('article pages have JSON-LD schema', async ({ page }) => {
    await page.goto('/dramas/squid-game');

    // Get all JSON-LD scripts
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThan(0);

    // Find the Article schema
    let hasArticleSchema = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content) {
        const schema = JSON.parse(content);
        if (schema['@type'] === 'Article') {
          hasArticleSchema = true;
          break;
        }
      }
    }
    expect(hasArticleSchema).toBe(true);
  });
});
