import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Products Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Products submenu items
const PRODUCTS_ITEMS = [
  { name: 'All', url: '/admin/products?product%5Bfilter%5D=all' },
  { name: 'Inventory', url: '/admin/products?product%5Bfilter%5D=inventory_active' },
  { name: 'For Sale', url: '/admin/products?product%5Bfilter%5D=for_sale' },
  { name: 'Pending For Sale (users)', url: '/admin/products?product%5Bfilter%5D=for_sale_pending' },
  { name: 'Consigned', url: '/admin/products?product%5Bfilter%5D=in_consignment' },
  { name: 'Shoes to Be Created', url: '/admin/products/search?product%5Bsearch_type%5D=sku&product%5Bterm%5D=STBC' },
  { name: 'Needs Review', url: 'https://admin-staging.foodsworth.com/products/review' },
  { name: 'Needs Review Skipped', url: '/admin/products?product%5Bfilter%5D=in_review_skipped' },
  { name: 'Missing', url: '/admin/products/missing' },
  { name: 'Pending Write Off', url: '/admin/products/pending_write_off' },
  { name: 'Bulk Edit', url: '/admin/product_bulk_edits/new' },
  { name: 'Bulk Create', url: '/admin/product_bulk_creates/new' },
  { name: 'Bulk Active PT Review', url: '/admin/product_bulk_active_pt_reviews/new' },
  { name: 'Inventory Controls Dashboard | Metabase', url: '/admin/metabase_dashboards/inventory_controls' },
  { name: 'Internal Acquisition', url: '/admin/internal_acquisitions/new' },
];

test.describe('Products Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Products dropdown menu should be visible and expand on click', async ({ page }) => {
    const productsLink = page.getByRole('link', { name: 'Products' });
    await expect(productsLink).toBeVisible();
    await productsLink.click();
    await expect(productsLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Products dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();

    for (const item of PRODUCTS_ITEMS.filter(i => !i.url.startsWith('https://'))) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Products Pages', () => {
  const internalPages = PRODUCTS_ITEMS.filter(item => !item.url.startsWith('https://'));

  for (const item of internalPages) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Products List Pages', () => {
  test('All products page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products?product%5Bfilter%5D=all');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Inventory page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products?product%5Bfilter%5D=inventory_active');
    await expect(page.locator('main')).toBeVisible();
  });

  test('For Sale page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products?product%5Bfilter%5D=for_sale');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Pending For Sale page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products?product%5Bfilter%5D=for_sale_pending');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Consigned page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products?product%5Bfilter%5D=in_consignment');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Product Review Pages', () => {
  test('Needs Review Skipped page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products?product%5Bfilter%5D=in_review_skipped');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Missing products page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products/missing');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Pending Write Off page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/products/pending_write_off');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Bulk Operations', () => {
  test('Bulk Edit page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_bulk_edits/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Bulk Create page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_bulk_creates/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Bulk Active PT Review page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/product_bulk_active_pt_reviews/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Internal Acquisition', () => {
  test('Internal Acquisition page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/internal_acquisitions/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Product Search form should be visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Product Search' })).toBeVisible();
  });

  test('Can search by Product Number', async ({ page }) => {
    const dropdown = page.getByRole('combobox').first();
    await dropdown.selectOption('Product Number');

    const searchInput = page.getByRole('textbox', { name: 'Search term' }).first();
    await searchInput.fill('TEST-123');

    await page.getByRole('button', { name: 'Search' }).first().click();
  });

  test('Can search by Product ID', async ({ page }) => {
    const dropdown = page.getByRole('combobox').first();
    await dropdown.selectOption('Product ID');

    const searchInput = page.getByRole('textbox', { name: 'Search term' }).first();
    await searchInput.fill('12345');

    await page.getByRole('button', { name: 'Search' }).first().click();
  });
});
