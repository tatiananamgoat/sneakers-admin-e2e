import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Instant Ship Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Instant Ship submenu items
const INSTANT_SHIP_ITEMS = [
  { name: 'IS Received', url: '/admin/orders?filter=goat_received&instant_ship=true' },
  { name: 'IS Verifying', url: '/admin/orders?filter=goat_verifying&instant_ship=true' },
  { name: 'IS Verified', url: '/admin/orders?filter=goat_verified&instant_ship=true' },
  { name: 'IS Prepackaged', url: '/admin/orders?filter=goat_prepackaged&instant_ship=true' },
  { name: 'IS Packaged', url: '/admin/orders?filter=goat_packaged&instant_ship=true' },
  { name: 'IS Shipped Buyer', url: '/admin/orders?filter=shipped_buyer&instant_ship=true' },
  { name: 'IS Find', url: '/admin/orders?filter=goat_find&instant_ship=true' },
  { name: 'IS Loss', url: '/admin/orders?filter=goat_loss&instant_ship=true' },
  { name: 'IS Undeliverable', url: '/admin/orders?filter=undeliverable&instant_ship=true' },
  { name: 'IS GOAT Issue', url: '/admin/orders?filter=goat_issue&instant_ship=true' },
  { name: 'IS GOAT Check', url: '/admin/orders?filter=goat_check&instant_ship=true' },
];

test.describe('Instant Ship Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Instant Ship dropdown menu should be visible and expand on click', async ({ page }) => {
    const instantShipLink = page.getByRole('link', { name: 'Instant Ship' });
    await expect(instantShipLink).toBeVisible();
    await instantShipLink.click();
    await expect(instantShipLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Instant Ship dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Instant Ship' }).click();

    for (const item of INSTANT_SHIP_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Instant Ship Pages', () => {
  for (const item of INSTANT_SHIP_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('main')).toBeVisible();
    });
  }
});

test.describe('IS Order Status Pages', () => {
  test('IS Received page should show instant ship orders', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_received&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
    // Verify filter is applied
    await expect(page).toHaveURL(/instant_ship=true/);
  });

  test('IS Verifying page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_verifying&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Verified page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_verified&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Prepackaged page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_prepackaged&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Packaged page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_packaged&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Shipped Buyer page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=shipped_buyer&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('IS Issue Pages', () => {
  test('IS Find page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_find&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Loss page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_loss&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Undeliverable page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=undeliverable&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS GOAT Issue page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_issue&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS GOAT Check page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_check&instant_ship=true');
    await expect(page.locator('main')).toBeVisible();
  });
});
