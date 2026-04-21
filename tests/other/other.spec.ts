import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Other Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Other submenu items (internal URLs only)
const OTHER_ITEMS = [
  { name: 'SMS Log', url: '/admin/users/sms_log' },
  { name: 'Email Log', url: '/admin/users/email_log' },
  { name: 'Login Log', url: '/admin/login_logs/search' },
  { name: 'Label Bulk Regeneration', url: '/admin/label_bulk_regenerations/new' },
  { name: 'Shipping Info Bulk Edit', url: '/admin/shipping_info_bulk_edits/new' },
  { name: 'New Address', url: '/admin/addresses/new' },
  { name: 'Address Bulk Edit', url: '/admin/address_bulk_edits/new' },
  { name: 'Onfeet - Pending', url: '/admin/microposts?filter=pending' },
  { name: 'Onfeet - Rejected', url: '/admin/microposts?filter=rejected' },
  { name: 'Wants (All)', url: '/admin/wants?want%5Bfilter%5D=all' },
  { name: 'Billing Infos', url: '/admin/billing_infos' },
  { name: 'Gift Cards', url: '/admin/gift_card_v2s/index' },
  { name: 'Disputes', url: '/admin/disputes' },
  { name: 'Shipping Infos', url: '/admin/shipping_infos' },
  { name: 'Campaigns', url: '/admin/campaigns' },
  { name: 'CxCampaigns', url: '/admin/cx_campaigns' },
  { name: 'Addresses', url: '/admin/addresses' },
  { name: 'Flight Club Store List', url: '/admin/flightclub_stores' },
  { name: 'Brands', url: '/admin/brands' },
  { name: 'Stores', url: '/admin/stores' },
  { name: 'UPCs', url: '/admin/upcs' },
  { name: 'Packing Boxes', url: '/admin/packing_boxes' },
  { name: 'Packing Box Defaults', url: '/admin/packing_box_defaults?packing_box_default%5Bproduct_type%5D=sneakers' },
  { name: 'Packing Box Scans', url: '/admin/packing_box_scans' },
  { name: 'Bulk Export POS Receipts', url: '/admin/point_of_sale/bulk_export_pos_receipts' },
  { name: 'Stories', url: '/admin/microposts' },
  { name: 'Process Photos', url: '/admin/product_templates/process_photos' },
  { name: 'Pages', url: '/admin/pages' },
  { name: 'Purchase Used Sneakers', url: '/admin/wants/new_offer_for_internal_buyer' },
  { name: 'Seller Cancelation Buffers', url: '/admin/seller_cancelation_buffers' },
  { name: 'Seller Events', url: '/admin/seller_events' },
  { name: 'Warehouse + Carrier Shipment Date Cutoffs', url: '/admin/warehouse_operating_hours' },
  { name: 'Promo Code Management', url: '/admin/promo_codes' },
  { name: 'Promo Code Bulk Creates', url: '/admin/promo_code_bulk_creates/new' },
  { name: 'Wechat Mini Program', url: '/admin/wechat' },
  { name: 'CNID Blacklist and Risky List', url: '/admin/cnids' },
  { name: 'Credit Adjustment Tool', url: '/admin/credits/new_credit_adjustment' },
  { name: 'Bulk Credit Adjustment Tool', url: '/admin/credits/new_bulk_credit_adjustment' },
  { name: 'Storage Fee Bulk Edit Tool', url: '/admin/storage_fee_bulk_edit/new' },
  { name: 'Credit Escheatment Tool', url: '/admin/credit_escheats/new' },
  { name: 'Manage Admin Permissions', url: '/admin/permissions/resources' },
  { name: 'Bulk Permissions Tool', url: '/admin/permissions/bulk_permissions/new' },
  { name: 'Manual Shipping Labels', url: '/admin/manual_shipments/index' },
  { name: 'PromoCodeLedgers Bulk Edit', url: '/admin/promo_code_ledgers_bulk_edits/new' },
  { name: 'EOR Received Packages Bulk Edit', url: '/admin/eor_receive_package_bulk_edits/new' },
  { name: 'China Tracking Codes Bulk Edit', url: '/admin/china_tracking_code_bulk_edits/new' },
  { name: 'Retail Pricing Tool', url: '/admin/retail_pricing_tool/index' },
  { name: 'Drop Ship Auditing Tool', url: '/admin/drop_ship_auditing_rules' },
  { name: 'PT Cartable List', url: '/admin/carts/pt_cartable_list' },
  { name: '2FA Email User Agents', url: '/admin/email2fa_user_agents' },
  { name: 'Editable Copies', url: '/admin/editable_copies' },
  { name: 'Stale Inventory Campaign Segments', url: '/admin/stale_inventory_campaign_segments' },
  { name: 'Intermediary Order Tool', url: '/admin/intermediary_order_tool/new' },
  { name: 'Tracking Code Bulk Update Tool', url: '/admin/tracking_code_bulk_update_tool/new' },
  { name: 'Product Region Mappings', url: '/admin/sell/product_region_mappings/upload' },
  { name: 'Macros Tool', url: '/admin/macros' },
  { name: 'Ops Costs Table', url: '/admin/ops_cost_adjustments' },
  { name: 'Bulk Global Pricing Breakdown Tool', url: '/admin/global_pricing/bulk_upload_breakdown' },
  { name: 'Instant Ship Markup Fee Bulk Uploader', url: '/admin/instant_ship_markup_bulk_upload/new' },
  { name: 'Ops Cost Bulk Upload Tool', url: '/admin/pricing/ops_cost_adjustment_bulk_upload/new' },
  { name: 'Pricing Type Tool', url: '/admin/pricing/pricing_types/new' },
  { name: 'Global Pricing Breakdown Tool - Custom', url: '/admin/global_pricing/new_breakdown' },
  { name: 'Global Pricing Breakdown Tool - Order', url: '/admin/global_pricing/order_breakdown' },
  { name: 'Global Pricing Breakdown Tool - Product', url: '/admin/global_pricing/product_breakdown' },
  { name: 'Reverse Calculator Breakdown Tool', url: '/admin/pricing/reverse_calculator/new_breakdown' },
  { name: 'Global Availabilities', url: '/admin/global_availabilities/search' },
  { name: 'Global Product Variants', url: '/admin/pricing/global_product_variant/search' },
  { name: 'GPV Resync Tool', url: '/admin/global_pricing/gpv_resync' },
  { name: 'Shipping Options Tool', url: '/admin/pricing/shipping_options_tool/simulate' },
  { name: 'Duty Rate Lookup Tool', url: '/admin/global_pricing/duty_rate_lookup' },
  { name: 'Product Prioritization Tool', url: '/admin/global_pricing/product_prioritization' },
  { name: 'Drop PT Configurations', url: '/admin/pricing/drops_pricing_tool/config_search' },
  { name: 'Global Pricing Drops Tool', url: '/admin/pricing/drops_pricing_tool/index' },
  { name: 'Drops Tax Information', url: '/admin/pricing/drops_pricing_tool/drops_tax' },
  { name: 'Embargo Rules', url: '/admin/pricing/embargo_rules/search' },
  { name: 'QA Tools', url: '/admin/devtools/qa' },
];

test.describe('Other Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Other dropdown menu should be visible and expand on click', async ({ page }) => {
    const otherLink = page.getByRole('link', { name: 'Other' });
    await expect(otherLink).toBeVisible();
    await otherLink.click();
    await expect(otherLink).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Other Pages', () => {
  for (const item of OTHER_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Logs', () => {
  test('SMS Log page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users/sms_log');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Email Log page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users/email_log');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Login Log page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/login_logs/search');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Address Management', () => {
  test('New Address page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/addresses/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Address Bulk Edit page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/address_bulk_edits/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Addresses page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/addresses');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Promo Codes', () => {
  test('Promo Code Management page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/promo_codes');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Promo Code Bulk Creates page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/promo_code_bulk_creates/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Credit Tools', () => {
  test('Credit Adjustment Tool should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/credits/new_credit_adjustment');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Bulk Credit Adjustment Tool should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/credits/new_bulk_credit_adjustment');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Credit Escheatment Tool should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/credit_escheats/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Permissions', () => {
  test('Manage Admin Permissions page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/permissions/resources');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Bulk Permissions Tool should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/permissions/bulk_permissions/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Global Pricing Tools', () => {
  test('Global Pricing Breakdown Tool - Custom should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/global_pricing/new_breakdown');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Global Pricing Breakdown Tool - Order should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/global_pricing/order_breakdown');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Global Pricing Breakdown Tool - Product should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/global_pricing/product_breakdown');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Global Availabilities should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/global_availabilities/search');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Global Product Variants should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/pricing/global_product_variant/search');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('QA Tools', () => {
  test('QA Tools page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/devtools/qa');
    await expect(page.locator('main')).toBeVisible();
  });
});
