import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Cashouts Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Cashouts submenu items
const CASHOUTS_ITEMS = [
  { name: 'All', url: '/admin/cashouts?cashout%5Bfilter%5D=all' },
  { name: 'Processing', url: '/admin/cashouts?cashout%5Bfilter%5D=processing' },
  { name: 'Approved', url: '/admin/cashouts?cashout%5Bfilter%5D=approved' },
  { name: 'Auto Approved', url: '/admin/cashouts?cashout%5Bfilter%5D=auto-approved' },
  { name: 'Success', url: '/admin/cashouts?cashout%5Bfilter%5D=success' },
  { name: 'Rejected', url: '/admin/cashouts?cashout%5Bfilter%5D=rejected' },
  { name: 'Failed', url: '/admin/cashouts?cashout%5Bfilter%5D=failed' },
  { name: 'Cashout Review', url: '/admin/cashout_reviews' },
  { name: 'Flagged Cashout Accounts', url: '/admin/cashout_accounts?cashout_account%5Bfilter%5D=is-fraud' },
];

test.describe('Cashouts Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Cashouts dropdown menu should be visible and expand on click', async ({ page }) => {
    const cashoutsLink = page.getByRole('link', { name: 'Cashouts' });
    await expect(cashoutsLink).toBeVisible();
    await cashoutsLink.click();
    await expect(cashoutsLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Cashouts dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Cashouts' }).click();

    for (const item of CASHOUTS_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Cashouts Pages', () => {
  for (const item of CASHOUTS_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Cashouts Status Pages', () => {
  test('All cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=all');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Processing cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=processing');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Approved cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=approved');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Auto Approved cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=auto-approved');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Success cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=success');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Rejected cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=rejected');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Failed cashouts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashouts?cashout%5Bfilter%5D=failed');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Cashout Review', () => {
  test('Cashout Review page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashout_reviews');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Flagged Cashout Accounts', () => {
  test('Flagged Cashout Accounts page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/cashout_accounts?cashout_account%5Bfilter%5D=is-fraud');
    await expect(page.locator('main')).toBeVisible();
  });
});
