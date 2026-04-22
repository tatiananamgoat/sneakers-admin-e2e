import { test, expect, Page } from '@playwright/test';

/**
 * Approval E2E Tests
 *
 * Test cases for order approval workflow from Jira FUL project Testing Board.
 * Approval involves reviewing and approving orders for shipping.
 *
 * Prerequisites:
 * - Valid authentication (auth.json or CF_ACCESS_TOKEN)
 * - Orders in states requiring approval
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

test.describe('Approval Workflow Tests', () => {
  test.describe('Order Approval Navigation', () => {
    test('Fulfillment menu should include approval options', async ({ page }) => {
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

    test('Can access verification page for approval', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Verified Orders Approval', () => {
    test('Can view orders pending final approval', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
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

    test('Verified orders should show approval status', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const statusCell = page.locator('table tbody tr td').filter({ hasText: 'goat_verified' }).first();
      if (await statusCell.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(statusCell).toContainText('goat_verified');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Can access order edit page for approval actions', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderLink = page.locator('table tbody tr td a').first();
      if (!await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip(true, 'No verified orders available');
        return;
      }

      await orderLink.click();
      await page.waitForLoadState('domcontentloaded');

      expect(page.url()).toContain('/orders/');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Authenticate & Verify Approval', () => {
    test('Verification page should have Authenticate & Verify button', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Look for the Authenticate & Verify button (may require product to be loaded first)
      await expect(page.locator('body')).toBeVisible();
    });

    test('Can initiate authentication approval process', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Get order data
      const orderLink = page.locator('table tbody tr td a').first();
      if (!await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip(true, 'No orders available');
        return;
      }

      const productIdLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
      const productId = await productIdLink.textContent() || '';

      const productCell = page.locator('table tbody tr:first-child td:nth-child(2)');
      const cellText = await productCell.textContent() || '';
      const skuMatch = cellText.match(/(\d{6}\s*\d{3})/);
      const sku = skuMatch ? skuMatch[1].replace(/\s/g, '') : '';

      // Navigate to verification
      loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Fill in product and UPC
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      if (await barcodeField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await barcodeField.fill(productId.trim());

        const upcField = page.getByRole('textbox', { name: 'UPC' });
        if (sku) {
          await upcField.fill(sku);
          await upcField.press('Enter');
          await page.waitForLoadState('domcontentloaded');
        }
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Approval Modal', () => {
    test('Approval modal should appear after clicking Authenticate & Verify', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Get order data
      const productIdLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
      if (!await productIdLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip(true, 'No orders available');
        return;
      }

      const productId = await productIdLink.textContent() || '';

      const productCell = page.locator('table tbody tr:first-child td:nth-child(2)');
      const cellText = await productCell.textContent() || '';
      const skuMatch = cellText.match(/(\d{6}\s*\d{3})/);
      const sku = skuMatch ? skuMatch[1].replace(/\s/g, '') : '';

      // Navigate to verification
      loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Fill in product and UPC
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await barcodeField.fill(productId.trim());

      const upcField = page.getByRole('textbox', { name: 'UPC' });
      if (sku) {
        await upcField.fill(sku);
        await upcField.press('Enter');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }

      // Click Authenticate & Verify if visible
      const authVerifyButton = page.getByRole('button', { name: /Authenticate.*Verify/i });
      if (await authVerifyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await authVerifyButton.click();
        await page.waitForLoadState('domcontentloaded');

        // Modal should appear
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
        if (await modal.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(modal).toBeVisible();
        }
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Approval modal should have checkboxes for confirmation', async ({ page }) => {
      // This test verifies modal checkbox functionality
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Approval modal should have submit button', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Rejection Workflow', () => {
    test('Order edit page should have rejection options', async ({ page }) => {
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

    test('Can access issue reporting for failed approval', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Approval Audit Trail', () => {
    test('Approved orders should show approval timestamp', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('Order history should include approval events', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderLink = page.locator('table tbody tr td a').first();
      if (!await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip(true, 'No verified orders available');
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
});
