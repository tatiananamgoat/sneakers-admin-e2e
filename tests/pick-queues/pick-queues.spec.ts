import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Pick Queues Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Pick Queues submenu items
const PICK_QUEUE_ITEMS = [
  { name: 'Goat Pick', url: '/admin/orders?filter=goat_pick' },
  { name: 'Goat Pick & Pack', url: '/admin/pick_and_packs?instant_ship_orders=false' },
  { name: 'IS Pick And Pack', url: '/admin/pick_and_packs?instant_ship_orders=true' },
  { name: 'Batch Picking', url: '/admin/pick_request_batches/new' },
  { name: 'Batch Picking Dashboard', url: '/admin/pick_request_batches/dashboard' },
  { name: 'Apparel Pick', url: '/admin/orders?filter=goat_pick&order%5Bapparel_only%5D=true' },
  { name: 'Apparel Pick And Pack', url: '/admin/pick_and_packs?apparel_only=true&instant_ship_orders=false' },
  { name: 'Apparel IS Pick And Pack', url: '/admin/pick_and_packs?apparel_only=true&instant_ship_orders=true' },
  { name: 'Goat Pick & Swap', url: '/admin/pick_and_packs/pick_and_swap' },
  { name: 'Batch Pick Order Dashboard | Metabase', url: '/admin/metabase_dashboards/batch_pick_order' },
  { name: 'Ops Fulfillment Dashboard | Metabase', url: '/admin/metabase_dashboards/ops_fulfillment' },
];

test.describe('Pick Queues Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Pick Queues dropdown menu should be visible and expand on click', async ({ page }) => {
    const pickQueuesLink = page.getByRole('link', { name: 'Pick Queues' });
    await expect(pickQueuesLink).toBeVisible();
    await pickQueuesLink.click();
    await expect(pickQueuesLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Pick Queues dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Pick Queues' }).click();

    for (const item of PICK_QUEUE_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Pick Queues Pages', () => {
  for (const item of PICK_QUEUE_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Goat Pick', () => {
  test('Goat Pick page should load with order list', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_pick');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Pick And Pack', () => {
  test('Goat Pick & Pack page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pick_and_packs?instant_ship_orders=false');
    await expect(page.locator('main')).toBeVisible();
  });

  test('IS Pick And Pack page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pick_and_packs?instant_ship_orders=true');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Batch Picking', () => {
  test('Batch Picking new page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pick_request_batches/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Batch Picking Dashboard should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pick_request_batches/dashboard');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Apparel Pick', () => {
  test('Apparel Pick page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders?filter=goat_pick&order%5Bapparel_only%5D=true');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Apparel Pick And Pack page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pick_and_packs?apparel_only=true&instant_ship_orders=false');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Pick & Swap', () => {
  test('Goat Pick & Swap page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pick_and_packs/pick_and_swap');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Metabase Dashboards', () => {
  test('Batch Pick Order Dashboard should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/metabase_dashboards/batch_pick_order');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Ops Fulfillment Dashboard should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/metabase_dashboards/ops_fulfillment');
    await expect(page.locator('body')).toBeVisible();
  });
});
