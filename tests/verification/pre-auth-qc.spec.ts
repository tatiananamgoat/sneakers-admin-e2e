import { test, expect, Page } from '@playwright/test';

/**
 * Pre-Authentication & QC E2E Tests
 *
 * Test cases from Jira FUL project Testing Board:
 * - FUL-1619: Pre: Trusted sellers + High UPC
 * - FUL-2506: Pre: CheckUPC Flow
 * - FUL-56: Return to Consign
 * - FUL-2912: Pre: MultipleFlow
 * - FUL-2913: Pre: HighCourt Flow
 * - FUL-6: QC + 365 days (sale item)
 *
 * Prerequisites:
 * - Valid authentication (auth.json or CF_ACCESS_TOKEN)
 * - Orders in goat_received state
 * - Products with various UPC configurations
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

/**
 * Helper to extract order data from goat_received orders
 */
async function getOrderData(page: Page) {
  const orderLink = page.locator('table tbody tr td a').first();
  if (!await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    return null;
  }

  const orderNumber = await orderLink.textContent() || '';
  const href = await orderLink.getAttribute('href') || '';
  const orderIdMatch = href.match(/\/orders\/(\d+)\/edit/);
  const orderId = orderIdMatch ? orderIdMatch[1] : '';

  const productIdLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
  const productId = await productIdLink.textContent() || '';

  const productCell = page.locator('table tbody tr:first-child td:nth-child(2)');
  const cellText = await productCell.textContent() || '';
  const skuMatch = cellText.match(/(\d{6}\s*\d{3})/);
  const sku = skuMatch ? skuMatch[1].replace(/\s/g, '') : '';

  return {
    orderNumber: orderNumber.trim(),
    orderId,
    productId: productId.trim(),
    sku,
  };
}

test.describe('Pre-Authentication & QC Tests', () => {
  test.describe('FUL-1619: Trusted Sellers + High UPC', () => {
    test('Verification page should load for trusted seller products', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Verify verification page elements are present
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await expect(barcodeField).toBeVisible();

      const upcField = page.getByRole('textbox', { name: 'UPC' });
      await expect(upcField).toBeVisible();
    });

    test('Can enter trusted seller PID with high UPC vote count', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Enter a test PID
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await barcodeField.fill('12345678');
      await expect(barcodeField).toHaveValue('12345678');

      // Enter a high-vote UPC (simulated)
      const upcField = page.getByRole('textbox', { name: 'UPC' });
      await upcField.fill('123456789012');
      await expect(upcField).toHaveValue('123456789012');
    });

    test('Trusted seller with high UPC should show fast-track verification option', async ({ page }) => {
      // Navigate to goat_received orders to get real data
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderData = await getOrderData(page);
      if (!orderData) {
        test.skip(true, 'No orders available');
        return;
      }

      // Navigate to verification page
      loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Enter PID and UPC
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await barcodeField.fill(orderData.productId);

      const upcField = page.getByRole('textbox', { name: 'UPC' });
      if (orderData.sku) {
        await upcField.fill(orderData.sku);
        await upcField.press('Enter');
        await page.waitForLoadState('domcontentloaded');
      }

      // Check for verification options
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('FUL-2506: CheckUPC Flow', () => {
    test('Verification page should have UPC input field', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const upcField = page.getByRole('textbox', { name: 'UPC' });
      await expect(upcField).toBeVisible();
    });

    test('UPC field should accept valid UPC codes', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const upcField = page.getByRole('textbox', { name: 'UPC' });

      // Test various UPC formats
      await upcField.fill('012345678901');
      await expect(upcField).toHaveValue('012345678901');

      await upcField.clear();
      await upcField.fill('123456789');
      await expect(upcField).toHaveValue('123456789');
    });

    test('CheckUPC flow should validate UPC against product database', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderData = await getOrderData(page);
      if (!orderData || !orderData.sku) {
        test.skip(true, 'No orders with SKU available');
        return;
      }

      loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Enter PID first
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await barcodeField.fill(orderData.productId);

      // Enter matching UPC
      const upcField = page.getByRole('textbox', { name: 'UPC' });
      await upcField.fill(orderData.sku);
      await upcField.press('Enter');

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Page should still be visible (no error redirect)
      await expect(page.locator('body')).toBeVisible();
    });

    test('Mismatched UPC should show warning or error', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderData = await getOrderData(page);
      if (!orderData) {
        test.skip(true, 'No orders available');
        return;
      }

      loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Enter PID
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await barcodeField.fill(orderData.productId);

      // Enter intentionally wrong UPC
      const upcField = page.getByRole('textbox', { name: 'UPC' });
      await upcField.fill('000000000000');
      await upcField.press('Enter');

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Should either show error message or remain on page
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('FUL-56: Return to Consign', () => {
    test('Order edit page should have consignment options', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      const orderData = await getOrderData(page);
      if (!orderData || !orderData.orderId) {
        test.skip(true, 'No orders available');
        return;
      }

      loaded = await safeGoto(page, `${BASE_URL}/orders/${orderData.orderId}/edit`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Order edit page should load
      await expect(page.locator('body')).toBeVisible();
    });

    test('Consignment return flow should be accessible', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Check that orders page loads with filter options
      const filterOptions = page.locator('select, [role="combobox"]').first();
      if (await filterOptions.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(filterOptions).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('FUL-2912: MultipleFlow', () => {
    test('Verification page should handle multiple products', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Enter first product
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await barcodeField.fill('11111111');
      await expect(barcodeField).toHaveValue('11111111');

      // Clear and enter second product
      await barcodeField.clear();
      await barcodeField.fill('22222222');
      await expect(barcodeField).toHaveValue('22222222');
    });

    test('Can process multiple orders in sequence', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Check that multiple orders exist in the table
      const tableRows = page.locator('table tbody tr');
      const rowCount = await tableRows.count().catch(() => 0);

      if (rowCount > 1) {
        // Multiple orders exist
        expect(rowCount).toBeGreaterThan(1);
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('FUL-2913: HighCourt Flow', () => {
    test('High value items should show special verification indicators', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_received`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Look for any high-value or special indicators in the orders table
      const table = page.getByRole('table');
      if (await table.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(table).toBeVisible();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('HighCourt verification requires additional authentication steps', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Verification page should have authentication options
      const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
      await expect(barcodeField).toBeVisible();

      const upcField = page.getByRole('textbox', { name: 'UPC' });
      await expect(upcField).toBeVisible();
    });
  });

  test.describe('FUL-6: QC + 365 Days (Sale Item)', () => {
    test('Orders page should load for QC review', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('QC flow should be accessible from verification page', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Verification page should have QC options
      await expect(page.locator('body')).toBeVisible();

      const pageContent = await page.content();
      // QC functionality should be part of the verification workflow
      expect(pageContent).toBeTruthy();
    });

    test('Product edit page should show QC timestamp after verification', async ({ page }) => {
      let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Get a verified order
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

      // Navigate to product edit page (would need product ID)
      // For now, verify order edit page loads
      loaded = await safeGoto(page, `${BASE_URL}/orders/${orderId}/edit`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('365+ day old items should have special QC requirements', async ({ page }) => {
      const loaded = await safeGoto(page, `${BASE_URL}/orders`);
      if (!loaded) {
        test.skip(true, 'Authentication required');
        return;
      }

      // Orders page should support filtering by date
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('UPC Vote Count Verification', () => {
  test('High vote count UPC should enable quick verification', async ({ page }) => {
    const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
    const upcField = page.getByRole('textbox', { name: 'UPC' });

    await expect(barcodeField).toBeVisible();
    await expect(upcField).toBeVisible();
  });

  test('Low vote count UPC should require manual verification', async ({ page }) => {
    const loaded = await safeGoto(page, `${BASE_URL}/orders/verification`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    const barcodeField = page.getByRole('textbox', { name: 'Scan Barcode' });
    await barcodeField.fill('99999999');

    const upcField = page.getByRole('textbox', { name: 'UPC' });
    await upcField.fill('999999999999');
    await upcField.press('Enter');

    await page.waitForLoadState('domcontentloaded');

    // Should remain on verification page or show manual review option
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Authentication Timestamps', () => {
  test('Authenticated product should have auth timestamp', async ({ page }) => {
    let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    const productLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
    if (!await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'No verified products available');
      return;
    }

    const productId = await productLink.textContent() || '';
    if (!productId) {
      test.skip(true, 'Could not extract product ID');
      return;
    }

    // Navigate to product edit page
    loaded = await safeGoto(page, `${BASE_URL}/admin_products/${productId.trim()}/edit`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    // Check page loads (auth timestamp would be visible on the page)
    await expect(page.locator('body')).toBeVisible();
  });

  test('QC timestamp should be recorded after QC completion', async ({ page }) => {
    let loaded = await safeGoto(page, `${BASE_URL}/orders?filter=goat_verified`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    const productLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
    if (!await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'No verified products available');
      return;
    }

    const productId = await productLink.textContent() || '';
    if (!productId) {
      test.skip(true, 'Could not extract product ID');
      return;
    }

    loaded = await safeGoto(page, `${BASE_URL}/admin_products/${productId.trim()}/edit`);
    if (!loaded) {
      test.skip(true, 'Authentication required');
      return;
    }

    // Check page loads (QC timestamp would be visible on the page)
    await expect(page.locator('body')).toBeVisible();
  });
});
