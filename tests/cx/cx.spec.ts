import { test, expect } from '@playwright/test';

/**
 * E2E Tests for CX (Customer Experience) Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// CX submenu items
const CX_ITEMS = [
  { name: 'Report order issue', url: '/admin/order_issues/cx_new' },
  { name: 'Start Claim', url: '/admin/carrier_claims_cx_start_claim/search' },
  { name: 'Claims Dashboard', url: '/admin/carrier_claims/dashboard' },
  { name: 'Claims Bulk Download', url: '/admin/carrier_claims_bulk_download/new' },
];

test.describe('CX Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('CX dropdown menu should be visible and expand on click', async ({ page }) => {
    const cxLink = page.getByRole('link', { name: 'CX' });
    await expect(cxLink).toBeVisible();
    await cxLink.click();
    await expect(cxLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('CX dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'CX' }).click();

    for (const item of CX_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('CX Pages', () => {
  for (const item of CX_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Report Order Issue', () => {
  test('Report Order Issue page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/order_issues/cx_new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Carrier Claims', () => {
  test('Start Claim search page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims_cx_start_claim/search');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Claims Dashboard should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims/dashboard');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Claims Bulk Download page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims_bulk_download/new');
    await expect(page.locator('main')).toBeVisible();
  });
});
