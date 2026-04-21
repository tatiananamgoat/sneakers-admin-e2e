import { test, expect } from '@playwright/test';

/**
 * E2E Tests for LMS (Labor Management System) Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// LMS submenu items
const LMS_ITEMS = [
  { name: 'Packing Dashboard', url: '/admin/warehouse_labor/packing_dashboard' },
  { name: 'Receiving Dashboard', url: '/admin/warehouse_labor/receiving_dashboard' },
  { name: 'Packing Summaries', url: '/admin/warehouse_labor/packing_summaries' },
  { name: 'Receiving Summaries', url: '/admin/warehouse_labor/receiving_summaries' },
];

test.describe('LMS Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('LMS dropdown menu should be visible and expand on click', async ({ page }) => {
    const lmsLink = page.getByRole('link', { name: 'LMS' });
    await expect(lmsLink).toBeVisible();
    await lmsLink.click();
    await expect(lmsLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('LMS dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'LMS' }).click();

    for (const item of LMS_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('LMS Pages', () => {
  for (const item of LMS_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Packing Dashboard', () => {
  test('Packing Dashboard should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/warehouse_labor/packing_dashboard');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Receiving Dashboard', () => {
  test('Receiving Dashboard should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/warehouse_labor/receiving_dashboard');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Packing Summaries', () => {
  test('Packing Summaries page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/warehouse_labor/packing_summaries');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Receiving Summaries', () => {
  test('Receiving Summaries page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/warehouse_labor/receiving_summaries');
    await expect(page.locator('main')).toBeVisible();
  });
});
