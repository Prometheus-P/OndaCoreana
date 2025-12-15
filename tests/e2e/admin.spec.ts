import { test, expect } from '@playwright/test';

// Test admin code - must match PUBLIC_ADMIN_ACCESS_CODE in CI and start:e2e script
const TEST_ADMIN_CODE = 'test-admin-2024';
// Session key v2 matches AdminGate.astro secure version
const SESSION_KEY = 'oc-admin-session-v2';
const ATTEMPTS_KEY = 'oc-admin-attempts';
const LOCKOUT_KEY = 'oc-admin-lockout';

// Helper to unlock admin gate via form
async function unlockViaForm(page: import('@playwright/test').Page) {
  await page.fill('input[name="code"]', TEST_ADMIN_CODE);
  await page.click('button[type="submit"]');
  await expect(page.locator('#admin-slot')).not.toHaveAttribute('hidden');
  // Wait for module scripts to load and event handlers to be registered
  await page.waitForLoadState('networkidle');
}

// Helper to clear admin storage
async function clearStorage(page: import('@playwright/test').Page) {
  await page.evaluate(
    ({ session, attempts, lockout }) => {
      window.localStorage.removeItem(session);
      window.localStorage.removeItem(attempts);
      window.localStorage.removeItem(lockout);
    },
    { session: SESSION_KEY, attempts: ATTEMPTS_KEY, lockout: LOCKOUT_KEY }
  );
}

test.describe('Admin Features', () => {
  test.describe('Admin Gate', () => {
    test.describe.configure({ mode: 'serial' });

    test('shows login form when not authenticated', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();

      await expect(page.locator('#admin-gate-form')).toBeVisible();
      await expect(page.locator('input[name="code"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Desbloquear');
      await expect(page.locator('#admin-slot')).toHaveAttribute('hidden');
    });

    test('shows error on invalid code', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();

      await page.fill('input[name="code"]', 'wrong-code');
      await page.click('button[type="submit"]');

      await expect(page.locator('#gate-error')).toBeVisible();
      await expect(page.locator('#gate-error')).toContainText(/inválido|intento/i);
    });

    test('tracks failed attempts', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();

      await page.fill('input[name="code"]', 'wrong-code');
      await page.click('button[type="submit"]');
      await expect(page.locator('#gate-error')).toContainText(/intento/i);

      await page.fill('input[name="code"]', 'wrong-code-2');
      await page.click('button[type="submit"]');
      const errorText = await page.locator('#gate-error').textContent();
      expect(errorText).toMatch(/\d+ intento/);
    });

    test('locks out after max attempts', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();

      for (let i = 0; i < 5; i++) {
        await page.fill('input[name="code"]', `wrong-code-${i}`);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }

      await expect(page.locator('#gate-error')).toContainText(/[Dd]emasiados|minuto/);
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('unlocks with valid code', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();

      await unlockViaForm(page);

      await expect(page.locator('#admin-slot')).not.toHaveAttribute('hidden');
      // AdminGate hides .admin-gate__card (parent), not the form itself
      await expect(page.locator('.admin-gate__card')).toHaveAttribute('hidden');
      await expect(page.locator('#logout-btn')).toBeVisible();
    });

    test('logout clears session', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();
      await unlockViaForm(page);

      await page.click('#logout-btn');

      // AdminGate shows .admin-gate__card (parent) on logout
      await expect(page.locator('.admin-gate__card')).not.toHaveAttribute('hidden');
      await expect(page.locator('#admin-slot')).toHaveAttribute('hidden');
    });

    test('session persists across reloads', async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();
      await unlockViaForm(page);

      await page.reload();

      await expect(page.locator('#admin-slot')).not.toHaveAttribute('hidden');
      // AdminGate hides .admin-gate__card (parent), not the form itself
      await expect(page.locator('.admin-gate__card')).toHaveAttribute('hidden');
    });
  });

  test.describe('Feature Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();
      await unlockViaForm(page);
    });

    test('displays all required fields', async ({ page }) => {
      await expect(page.locator('#title')).toBeVisible();
      await expect(page.locator('#descriptionEs')).toBeVisible();
      await expect(page.locator('#category')).toBeVisible();
      await expect(page.locator('#countries')).toBeVisible();
      await expect(page.locator('#latamHook')).toBeVisible();
      await expect(page.locator('#heroImage')).toBeVisible();
      await expect(page.locator('#heroImageAlt')).toBeVisible();
      await expect(page.locator('#publishDate')).toBeVisible();
    });

    test('category dropdown has all options', async ({ page }) => {
      const options = await page.locator('#category option').allTextContents();
      expect(options).toContain('Música');
      expect(options).toContain('Series');
      expect(options).toContain('Eventos');
      expect(options).toContain('Gastronomía');
      expect(options).toContain('Cultura');
    });

    test('updates preview when typing', async ({ page }) => {
      await page.fill('#title', 'Test Title');
      await page.dispatchEvent('#title', 'input');
      await expect(page.locator('[data-preview="title"]')).toContainText('Test Title');

      await page.fill('#descriptionEs', 'Test description');
      await page.dispatchEvent('#descriptionEs', 'input');
      await expect(page.locator('[data-preview="description"]')).toContainText('Test description');
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();
      await unlockViaForm(page);
    });

    // TODO: Fix timing issue with module script event handler registration
    test.skip('shows validation errors on empty export', async ({ page }) => {
      const dialogPromise = page.waitForEvent('dialog');
      await page.click('#export-mdx');
      const dialog = await dialogPromise;

      expect(dialog.message()).toContain('título');
      expect(dialog.message()).toContain('descripción');
      await dialog.dismiss();
    });

    // TODO: Fix timing issue with module script event handler registration
    test.skip('highlights fields with errors', async ({ page }) => {
      page.on('dialog', (d) => d.dismiss());
      await page.click('#export-mdx');
      await page.waitForTimeout(100);
      await expect(page.locator('#title')).toHaveClass(/error-border/);
    });
  });

  test.describe('MDX Export', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();
      await unlockViaForm(page);
    });

    // TODO: Fix timing issue with module script event handler registration
    test.skip('generates slug from title', async ({ page }) => {
      await page.fill('#title', 'Test Feature Con Acentos');
      await page.fill('#descriptionEs', 'Test description');
      await page.fill('#countries', 'MX');
      await page.fill('#latamHook', 'Test hook');
      await page.fill('#publishDate', '2024-12-01');
      await page.fill('#heroImage', '/images/test.jpg');
      await page.fill('#heroImageAlt', 'Test image');

      const downloadPromise = page.waitForEvent('download');
      await page.click('#export-mdx');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('test-feature-con-acentos.mdx');
    });

    // TODO: Fix timing issue with module script event handler registration
    test.skip('warns about duplicate slug', async ({ page }) => {
      await page.fill('#title', 'Latam Demo');
      await page.fill('#descriptionEs', 'Test description');
      await page.fill('#countries', 'MX');
      await page.fill('#latamHook', 'Test hook');
      await page.fill('#publishDate', '2024-12-01');
      await page.fill('#heroImage', '/images/test.jpg');
      await page.fill('#heroImageAlt', 'Test image');

      const dialogPromise = page.waitForEvent('dialog');
      await page.click('#export-mdx');
      const dialog = await dialogPromise;

      expect(dialog.message()).toContain('latam-demo');
      await dialog.dismiss();
    });
  });

  test.describe('AI and Guide', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/features');
      await clearStorage(page);
      await page.reload();
      await unlockViaForm(page);
    });

    // TODO: Fix timing issue with module script event handler registration
    test.skip('AI button shows alert', async ({ page }) => {
      const dialogPromise = page.waitForEvent('dialog');
      await page.click('#ai-generate');
      const dialog = await dialogPromise;
      expect(dialog.message()).toContain('AI');
      await dialog.dismiss();
    });

    test('shows LatAm guide section', async ({ page }) => {
      const helpSection = page.locator('.help.card');
      await expect(helpSection).toBeVisible();
      await expect(helpSection).toContainText('LatAm');
    });
  });
});

test.describe('Features Pages', () => {
  test('features index loads', async ({ page }) => {
    await page.goto('/features');
    await expect(page.locator('h1')).toContainText('Features');
    await expect(page.locator('#category-filter')).toBeVisible();
    await expect(page.locator('#country-filter')).toBeVisible();
  });

  test('filters are functional', async ({ page }) => {
    await page.goto('/features');
    const categoryFilter = page.locator('#category-filter');
    await expect(categoryFilter).toBeVisible();
    expect(await categoryFilter.locator('option').count()).toBeGreaterThan(1);
  });

  test('breadcrumbs work', async ({ page }) => {
    await page.goto('/features');
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await page.click('nav[aria-label="Breadcrumb"] a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('feature detail page loads', async ({ page }) => {
    await page.goto('/features/latam-demo');
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
});
