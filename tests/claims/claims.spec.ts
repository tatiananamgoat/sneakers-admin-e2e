import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Claims Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Claims submenu items
const CLAIMS_ITEMS = [
  { name: 'Dashboard', url: '/admin/carrier_claims/dashboard' },
  { name: 'All', url: '/admin/carrier_claims' },
  { name: 'UPS Imports', url: '/admin/carrier_claims_ups_imports/new' },
  { name: 'Generic Imports', url: '/admin/carrier_claims_imports/new' },
  { name: 'Claims Bulk Download', url: '/admin/carrier_claims_bulk_download/new' },
];

test.describe('Claims Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Claims dropdown menu should be visible and expand on click', async ({ page }) => {
    const claimsLink = page.getByRole('link', { name: 'Claims', exact: true });
    await expect(claimsLink).toBeVisible();
    await claimsLink.click();
    await expect(claimsLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Claims dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Claims', exact: true }).click();

    for (const item of CLAIMS_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Claims Pages', () => {
  for (const item of CLAIMS_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Claims Dashboard', () => {
  test('Claims Dashboard should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims/dashboard');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('All Claims', () => {
  test('All Claims page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Claims Imports', () => {
  test('UPS Imports page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims_ups_imports/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Generic Imports page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims_imports/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Claims Bulk Download', () => {
  test('Claims Bulk Download page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/carrier_claims_bulk_download/new');
    await expect(page.locator('main')).toBeVisible();
  });
});
