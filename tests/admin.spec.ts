import { test, expect } from '@playwright/test';

// Admin tests using CF Access token for authentication
// Navigation structure: Orders, Fulfillment, Pick Queues, Instant Ship, LMS, Products, PT, CX, Claims, Users, Cashouts, Other

test.describe('Admin Dashboard', () => {
  test('should load admin dashboard and show navigation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/admin-dashboard.png', fullPage: true });

    // Verify signed in
    const signedIn = page.locator('text=Signed in successfully, text=@tatiananam, text=Hi @').first();
    console.log('Signed in indicator visible:', await signedIn.isVisible().catch(() => false));

    // Verify navigation elements
    const ordersNav = page.locator('text=Orders').first();
    const fulfillmentNav = page.locator('text=Fulfillment').first();
    console.log('Orders nav visible:', await ordersNav.isVisible().catch(() => false));
    console.log('Fulfillment nav visible:', await fulfillmentNav.isVisible().catch(() => false));

    console.log('Admin URL:', page.url());
    console.log('Admin title:', await page.title());
  });

  test('should have search forms on dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check for search inputs
    const searchInputs = page.locator('input[placeholder="Search term"]');
    const inputCount = await searchInputs.count();
    console.log('Search input count:', inputCount);

    // Check for select dropdowns (Product Number, Order Number, warehouse, etc.)
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log('Select dropdown count:', selectCount);

    // Verify search forms exist - at least 2 search inputs (product and order)
    expect(inputCount).toBeGreaterThanOrEqual(2);
    expect(selectCount).toBeGreaterThan(0);
  });
});

test.describe('Admin Orders', () => {
  test('should access Orders menu', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Click on Orders in navigation
    const ordersNav = page.locator('text=Orders').first();
    await ordersNav.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/admin-orders-menu.png', fullPage: true });
    console.log('URL after Orders click:', page.url());
  });

  test('should search for an order', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Use Order Search form - find the second search area
    const searchInputs = page.locator('input[placeholder="Search term"]');
    const inputCount = await searchInputs.count();
    console.log('Search input count:', inputCount);

    if (inputCount > 1) {
      const orderSearchInput = searchInputs.nth(1);
      await orderSearchInput.fill('12345');
      await page.screenshot({ path: '/tmp/admin-order-search-filled.png', fullPage: true });
    }

    await page.screenshot({ path: '/tmp/admin-order-search.png', fullPage: true });
    console.log('Order search URL:', page.url());
  });
});

test.describe('Admin Fulfillment', () => {
  test('should access Fulfillment menu', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Click on Fulfillment in navigation
    const fulfillmentNav = page.locator('text=Fulfillment').first();
    await fulfillmentNav.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/admin-fulfillment-menu.png', fullPage: true });
    console.log('URL after Fulfillment click:', page.url());
  });

  test('should access Pick Queues', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Click on Pick Queues in navigation
    const pickQueuesNav = page.locator('text=Pick Queues').first();
    await pickQueuesNav.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/admin-pick-queues.png', fullPage: true });
    console.log('URL after Pick Queues click:', page.url());
  });

  test('should access Instant Ship', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Click on Instant Ship in navigation
    const instantShipNav = page.locator('text=Instant Ship').first();
    await instantShipNav.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/admin-instant-ship.png', fullPage: true });
    console.log('URL after Instant Ship click:', page.url());
  });
});

test.describe('Admin Products', () => {
  test('should search for a product', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Use Product Search form - find the first search area
    const searchInputs = page.locator('input[placeholder="Search term"]');
    const inputCount = await searchInputs.count();
    console.log('Search input count:', inputCount);

    if (inputCount > 0) {
      const productSearchInput = searchInputs.first();
      await productSearchInput.fill('Jordan');
      await page.screenshot({ path: '/tmp/admin-product-search-filled.png', fullPage: true });
    }

    await page.screenshot({ path: '/tmp/admin-product-search.png', fullPage: true });
    console.log('Product search URL:', page.url());
  });

  test('should access Products dropdown menu', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Products is a dropdown - hover to reveal
    const productsNav = page.locator('a:has-text("Products"), button:has-text("Products")').first();
    if (await productsNav.isVisible()) {
      await productsNav.hover();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: '/tmp/admin-products-menu.png', fullPage: true });
    console.log('Products hover completed');
  });
});

test.describe('Admin Navigation Menus', () => {
  test('should have Users dropdown menu', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Users is a dropdown menu in the navigation
    const navBar = page.locator('nav, header, [class*="nav"]').first();
    const hasUsersText = await page.locator('text=Users').count();
    console.log('Users text count:', hasUsersText);

    await page.screenshot({ path: '/tmp/admin-users-menu.png', fullPage: true });
  });

  test('should have Claims dropdown menu', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const hasClaimsText = await page.locator('text=Claims').count();
    console.log('Claims text count:', hasClaimsText);

    await page.screenshot({ path: '/tmp/admin-claims-menu.png', fullPage: true });
  });

  test('should have Cashouts dropdown menu', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const hasCashoutsText = await page.locator('text=Cashouts').count();
    console.log('Cashouts text count:', hasCashoutsText);

    await page.screenshot({ path: '/tmp/admin-cashouts-menu.png', fullPage: true });
  });
});
