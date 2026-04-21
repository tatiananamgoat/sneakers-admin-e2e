import { test, expect } from '@playwright/test';

/**
 * E2E Tests for PT (Product Templates) Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// PT submenu items
const PT_ITEMS = [
  { name: 'All', url: '/admin/product_templates' },
  { name: 'Active', url: '/admin/product_templates?product_template%5Bfilter%5D=active' },
  { name: 'Pending', url: '/admin/product_templates?product_template%5Bfilter%5D=pending' },
  { name: 'To Prioritize', url: '/admin/product_templates?product_template%5Bfilter%5D=prioritize' },
  { name: 'Inactive', url: '/admin/product_templates?product_template%5Bfilter%5D=inactive' },
  { name: 'Future Releases', url: '/admin/product_templates?product_template%5Bfilter%5D=future_releases' },
  { name: 'Product Search Tool', url: '/admin/product_templates/search_tool' },
  { name: 'Authentication Guides', url: '/admin/authentication_guides' },
];

test.describe('PT Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('PT dropdown menu should be visible and expand on click', async ({ page }) => {
    const ptLink = page.getByRole('link', { name: 'PT', exact: true });
    await expect(ptLink).toBeVisible();
    await ptLink.click();
    await expect(ptLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('PT dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'PT', exact: true }).click();

    for (const item of PT_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('PT Pages', () => {
  for (const item of PT_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Product Templates List', () => {
  test('All product templates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Active templates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates?product_template%5Bfilter%5D=active');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Pending templates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates?product_template%5Bfilter%5D=pending');
    await expect(page.locator('main')).toBeVisible();
  });

  test('To Prioritize templates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates?product_template%5Bfilter%5D=prioritize');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Inactive templates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates?product_template%5Bfilter%5D=inactive');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Future Releases templates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates?product_template%5Bfilter%5D=future_releases');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Product Search Tool', () => {
  test('Product Search Tool page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_templates/search_tool');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Authentication Guides', () => {
  test('Authentication Guides page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/authentication_guides');
    await expect(page.locator('main')).toBeVisible();
  });
});
