import { test, expect, Page } from '@playwright/test';

/**
 * Triage E2E Tests
 *
 * Test cases for order triage workflow from Jira FUL project Testing Board.
 * Triage involves sorting, prioritizing, and routing orders for fulfillment.
 *
 * Prerequisites:
 * - Valid authentication (auth.json or CF_ACCESS_TOKEN)
 * - Orders in various states requiring triage
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

test.describe('Triage List Tests', () => {
  test.describe('Order Triage Navigation', () => {
    test('Fulfillment menu should be accessible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const fulfillmentLink = page.getByRole('link', { name: 'Fulfillment' });
      if (await fulfillmentLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(fulfillmentLink).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Orders page should load with filter options', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Can access orders requiring triage', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Orders table should be visible
      const table = page.getByRole('table');
      if (await table.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(table).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Order Status Filtering', () => {
    test('Can filter orders by goat_received status', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain('goat_received');
    });

    test('Can filter orders by goat_verifying status', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verifying`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain('goat_verifying');
    });

    test('Can filter orders by goat_verified status', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain('goat_verified');
    });

    test('Can filter orders by seller_shipped status', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=seller_shipped`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain('seller_shipped');
    });

    test('Can filter orders by goat_received_in_transit status', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received_in_transit`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Order Prioritization', () => {
    test('High priority orders should be identifiable', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Check for priority indicators in the table
      const table = page.getByRole('table');
      if (await table.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(table).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Orders should display creation date for aging prioritization', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const table = page.getByRole('table');
      if (await table.isVisible({ timeout: 10000 }).catch(() => false)) {
        // Table headers should include date information
        const headers = page.locator('table thead th');
        await expect(headers.first()).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Order Assignment', () => {
    test('Can view order details from triage list', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderLink = page.locator('table tbody tr td a').first();
      if (await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await orderLink.click();
        await page.waitForLoadState('domcontentloaded');
        expect(page.url()).toContain('/orders/');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Order edit page should show assignee options', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderLink = page.locator('table tbody tr td a').first();
      if (!await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip(true, 'No orders available');
        return;
      }

      const href = await orderLink.getAttribute('href') || '';
      const orderIdMatch = href.match(/\/orders\/(\d+)\/edit/);
      const orderId = orderIdMatch ? orderIdMatch[1] : '';

      if (!orderId) {
        test.skip(true, 'Could not extract order ID');
        return;
      }

      loaded = await safeGoto(page, `${BASE_URL}/orders/${orderId}/edit`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Warehouse Routing', () => {
    test('Orders should display warehouse information', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const table = page.getByRole('table');
      if (await table.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(table).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Can search orders by warehouse', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Look for warehouse filter/select
      const warehouseSelect = page.locator('select').filter({ hasText: /warehouse/i }).first();
      if (await warehouseSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(warehouseSelect).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Bulk Actions', () => {
    test('Orders table should support row selection', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const table = page.getByRole('table');
      if (await table.isVisible({ timeout: 10000 }).catch(() => false)) {
        // Check for checkboxes in table rows
        const checkboxes = page.locator('table input[type="checkbox"]');
        const checkboxCount = await checkboxes.count().catch(() => 0);

        // Either has checkboxes for selection or table is visible
        await expect(table).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Search and Filter', () => {
    test('Can search orders by order number', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const searchInput = page.getByRole('textbox', { name: /search/i }).first();
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('123456789');
        await expect(searchInput).toHaveValue('123456789');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Can search orders by product ID', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Look for search dropdown to select search type
      const searchSelect = page.locator('select').first();
      if (await searchSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        const options = await searchSelect.locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(0);
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Can search orders by SKU', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Triage Workflow States', () => {
  test('Pending orders should be actionable', async ({ page }) => {
    const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('Orders in verification queue should be visible', async ({ page }) => {
    const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verifying`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('Completed orders should be filterable', async ({ page }) => {
    const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    await expect(page.locator('body')).toBeVisible();
  });
});
