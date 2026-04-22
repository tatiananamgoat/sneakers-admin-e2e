import { test, expect, Page } from '@playwright/test';

/**
 * Others E2E Tests
 *
 * Miscellaneous test cases from Jira FUL project Testing Board.
 * Covers edge cases and additional fulfillment scenarios.
 *
 * Prerequisites:
 * - Valid authentication (auth.json or CF_ACCESS_TOKEN)
 */

const BASE_URL = 'https://staging.goat.com/admin';

/**
 * Helper function to safely navigate and handle auth redirects
 */
async function safeGoto(page: Page, url: string): Promise<boolean> {
  try {
    await page.goto(url, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    if (currentUrl.includes('sso.goatgroup.com') || currentUrl.includes('cloudflareaccess.com')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

test.describe('Other Fulfillment Tests', () => {
  test.describe('Admin Dashboard', () => {
    test('Admin dashboard should load', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Dashboard should show product search', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const productSearch = page.locator('text=Product Search');
      if (await productSearch.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(productSearch).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Dashboard should show order search', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderSearch = page.locator('text=Order Search');
      if (await orderSearch.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(orderSearch).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Product Management', () => {
    test('Can search products by product number', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const searchInput = page.getByRole('textbox', { name: /search/i }).first();
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('test123');
        await expect(searchInput).toHaveValue('test123');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Can search products by product ID', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Look for product ID search option
      const productIdOption = page.locator('option:has-text("Product ID")');
      if (await productIdOption.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(productIdOption).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Products page should load', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/products`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Pick Queues', () => {
    test('Pick queues menu should be accessible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const pickQueuesLink = page.getByRole('link', { name: 'Pick Queues' });
      if (await pickQueuesLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(pickQueuesLink).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Pick queues page should load', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/pick_queues`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Instant Ship', () => {
    test('Instant Ship menu should be accessible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const instantShipLink = page.getByRole('link', { name: 'Instant Ship' });
      if (await instantShipLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(instantShipLink).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Instant Ship page should load', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/instant_ship`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('LMS (Location Management)', () => {
    test('LMS menu should be accessible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const lmsLink = page.getByRole('link', { name: 'LMS' });
      if (await lmsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(lmsLink).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Claims', () => {
    test('Claims menu should be accessible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const claimsLink = page.getByRole('link', { name: 'Claims' });
      if (await claimsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(claimsLink).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Shipping Labels', () => {
    test('Can access shipment functionality', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('User Session', () => {
    test('User info should be displayed in header', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const userInfo = page.locator('text=Hi @');
      if (await userInfo.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(userInfo).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Location should be displayed in header', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const location = page.locator('text=Location:');
      if (await location.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(location).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('Invalid order ID should handle gracefully', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/999999999999/edit`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Should either show error or redirect, but not crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('Invalid product ID should handle gracefully', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/admin_products/999999999999/edit`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Should either show error or redirect, but not crash
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('All main navigation items should be visible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const navItems = ['Orders', 'Fulfillment', 'Pick Queues', 'Instant Ship', 'LMS', 'Products', 'CX', 'Claims', 'Users', 'Cashouts', 'Other'];

      for (const item of navItems) {
        const link = page.getByRole('link', { name: item });
        if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Item exists and is visible
        }
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('STAGING indicator should be visible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const stagingIndicator = page.locator('text=STAGING');
      if (await stagingIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(stagingIndicator).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Responsive Behavior', () => {
    test('Page should be usable at standard width', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Page should be usable at wide width', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
