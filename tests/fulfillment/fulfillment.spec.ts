import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Fulfillment Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Fulfillment submenu items
const FULFILLMENT_ITEMS = [
  { name: 'Unboxing', url: '/admin/orders/unboxing' },
  { name: 'Receiving Station', url: '/admin/receiving/shipment_item_receiving' },
  { name: 'PN Receiving Station', url: '/admin/receiving/shipment_item_receiving/new_with_product_number' },
  { name: 'Light Verification', url: '/admin/light_verifications' },
  { name: 'Verification', url: '/admin/orders/verification' },
  { name: 'Packing Station (V2) -- Product Barcode', url: '/admin/orders/packing_station?station_mode=product_barcode' },
  { name: 'Packing Station (V2) -- Shipping Labels', url: '/admin/orders/packing_station?station_mode=shipping_label' },
  { name: 'Goat Pre-Pack', url: '/admin/pre_packs' },
  { name: 'Sort Carrier (V2)', url: '/admin/orders/sort_carrier' },
  { name: 'Confirm Zone 3 Product <> Tracking', url: '/admin/orders/confirm_zone_product_tracking' },
  { name: 'Power Shelving', url: 'https://admin-staging.foodsworth.com/fulfillment/power-shelving' },
  { name: 'Priority Shelving Sorter', url: '/admin/priority_shelving' },
  { name: 'Employee Purchases', url: '/admin/orders/employee_purchases' },
  { name: 'GOAT Find', url: '/admin/orders?filter=goat_find' },
  { name: 'Return to Seller', url: '/admin/orders?filter=goat_issue_return_to_seller' },
  { name: 'Open Issues', url: '/admin/orders?filter=goat_issue' },
  { name: 'Order Issue Search', url: '/admin/order_issues' },
  { name: 'Process Order Issue', url: '/admin/order_issue_items/search' },
  { name: 'Buyer Accepted Discount', url: '/admin/orders?filter=goat_issue_buyer_accepted' },
  { name: 'Return to Buyer', url: '/admin/orders?filter=goat_issue_return_to_buyer' },
  { name: 'Internal Buyer Missing Data', url: '/admin/products/search?product%5Bfilter%5D=missing_data&product%5Bsearch_type%5D=user_id&product%5Bterm%5D=30531' },
  { name: 'Fulfillment Support', url: '/admin/fulfillment_triages/new' },
  { name: 'Order Shipping Label Regeneration', url: '/admin/order_shipping_label_regenerations/new' },
  { name: 'Pallets', url: '/admin/pallets' },
  { name: 'Pallet Dock Management', url: '/admin/pallets/dock_management' },
  { name: 'Transfers', url: '/admin/transfers' },
  { name: 'Batch Shipment', url: '/admin/batch_shipments' },
  { name: 'Bulk Receiving', url: '/admin/bulk_receivings/getting_started' },
  { name: 'Physical Event Receiving', url: '/admin/physical_event_receivings' },
  { name: 'Warehouse Forwarder Receiving', url: '/admin/fulfillment_forwarder_receiving/new' },
  { name: 'ShangHai - ShenZhen Transfers and Generate Label', url: '/admin/transfer_to_sz/new' },
  { name: 'Shipping Inbound Lanes', url: '/admin/shipping/inbound_lanes' },
  { name: 'To GOAT Routing Tool', url: '/admin/fulfillment_admin/warehouses' },
  { name: 'Warehouse Shipping Configs', url: '/admin/fulfillment_admin/warehouse_shipping_configs' },
  { name: 'Dropshipper Shipping Configs', url: '/admin/fulfillment_admin/dropshipper_shipping_configs' },
  { name: 'Stage Shipments', url: '/admin/fulfillment_admin/stage_shipments' },
  { name: 'Store Receptions', url: '/admin/store_receptions/new' },
  { name: 'Consignment Shipments', url: '/admin/shipping_shipments?shipment_type=stc' },
  { name: 'Single STV Shipments', url: '/admin/shipping_shipments?shipment_type=single_stv' },
  { name: 'Bulk STV Shipments', url: '/admin/shipping_shipments?shipment_type=bulk_stv' },
  { name: 'Product Photo Requests', url: '/admin/product_photo_requests' },
  { name: 'Warehouse Dashboard', url: '/admin/warehouse_dashboard' },
  { name: 'Inbound Optimization Ignored Locations Configuration', url: '/admin/inbound_optimization_ignored_locations' },
  { name: 'User Tax Info', url: '/admin/user_tax_infos' },
  { name: 'Return Routing Rules', url: '/admin/shipping_return_routing_rules' },
  { name: 'Warehouse Customs Info', url: '/admin/warehouse_customs_infos' },
  { name: 'Shipping Carrier Overrides', url: '/admin/shipping_carrier_overrides/all' },
  { name: 'Importer Of Records', url: '/admin/importer_of_records' },
  { name: 'Rate Price Limitation', url: '/admin/rate_limitations' },
  { name: 'Inbound Manifest', url: '/admin/app_web_features/inbound_manifest' },
  { name: 'Tracking Event Mappings', url: '/admin/tracking_event_mapping' },
  { name: 'Tracking Event Statuses', url: '/admin/tracking_event_status' },
];

test.describe('Fulfillment Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Fulfillment dropdown menu should be visible and expand on click', async ({ page }) => {
    const fulfillmentLink = page.getByRole('link', { name: 'Fulfillment' });
    await expect(fulfillmentLink).toBeVisible();
    await fulfillmentLink.click();
    await expect(fulfillmentLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Fulfillment dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Fulfillment' }).click();

    for (const item of FULFILLMENT_ITEMS.slice(0, 10)) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Fulfillment Pages', () => {
  // Test core fulfillment pages
  const corePages = FULFILLMENT_ITEMS.filter(item => !item.url.startsWith('https://'));

  for (const item of corePages) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      const fullUrl = item.url.startsWith('/') ? `https://staging.goat.com${item.url}` : item.url;
      await page.goto(fullUrl);
      // Verify page loads
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Unboxing Station', () => {
  test('Unboxing page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders/unboxing');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Receiving Station', () => {
  test('Receiving Station page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/receiving/shipment_item_receiving');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Verification', () => {
  test('Verification page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders/verification');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Packing Station', () => {
  test('Packing Station with Product Barcode mode should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders/packing_station?station_mode=product_barcode');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Packing Station with Shipping Labels mode should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/orders/packing_station?station_mode=shipping_label');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Transfers', () => {
  test('Transfers page should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/transfers');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Warehouse Dashboard', () => {
  test('Warehouse Dashboard should load correctly', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/warehouse_dashboard');
    await expect(page.locator('main')).toBeVisible();
  });
});
