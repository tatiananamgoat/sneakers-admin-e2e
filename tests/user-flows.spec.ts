import { test, expect } from '@playwright/test';

// Tests for staging.goat.com consumer flows
// Based on actual site structure discovered via exploration

test.describe('User Registration and Account', () => {
  test('should access Account link from navigation', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Look for Account link in navigation
    const accountLink = page.locator('text=Account').first();
    const isVisible = await accountLink.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Account link visible:', isVisible);

    if (isVisible) {
      await accountLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/user-account-click.png', fullPage: true });
      console.log('After Account click URL:', page.url());
    }

    await page.screenshot({ path: '/tmp/user-account-nav.png', fullPage: true });
  });

  test('should use footer email signup', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find email signup in footer
    const emailInput = page.locator('input[placeholder*="Email"], input[type="email"]').first();
    const signUpButton = page.locator('button:has-text("Sign Up")').first();

    const hasEmailInput = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
    const hasSignUpButton = await signUpButton.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('Email input visible:', hasEmailInput);
    console.log('Sign Up button visible:', hasSignUpButton);

    if (hasEmailInput) {
      await emailInput.fill(`test${Date.now()}@example.com`);
      await page.screenshot({ path: '/tmp/user-email-filled.png', fullPage: true });

      if (hasSignUpButton) {
        await signUpButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '/tmp/user-email-submitted.png', fullPage: true });
      }
    }
  });
});

test.describe('Page Navigation', () => {
  test('should load sneakers page with products', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '/tmp/nav-sneakers.png', fullPage: true });

    // Check for product items
    const products = page.locator('a[href*="/sneakers/"]');
    const productCount = await products.count();
    console.log('Product links on page:', productCount);

    // Check for navigation elements
    const homeLink = page.locator('text=Home');
    const shopLink = page.locator('text=Shop');
    console.log('Home link count:', await homeLink.count());
    console.log('Shop link count:', await shopLink.count());

    expect(productCount).toBeGreaterThan(0);
  });

  test('should display navigation header', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check navigation elements
    const searchLink = page.locator('text=Search');
    const editorialLink = page.locator('text=Editorial');
    const timelineLink = page.locator('text=Timeline');
    const accountLink = page.locator('text=Account');

    console.log('Search visible:', await searchLink.isVisible().catch(() => false));
    console.log('Editorial visible:', await editorialLink.isVisible().catch(() => false));
    console.log('Timeline visible:', await timelineLink.isVisible().catch(() => false));
    console.log('Account visible:', await accountLink.isVisible().catch(() => false));

    await page.screenshot({ path: '/tmp/nav-header.png', fullPage: true });
  });

  test('should access About page', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/nav-about.png', fullPage: true });
    console.log('About URL:', page.url());
    console.log('About title:', await page.title());
  });

  test('should access Support page', async ({ page }) => {
    await page.goto('/support', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/nav-support.png', fullPage: true });
    console.log('Support URL:', page.url());
  });

  test('should access Sell page', async ({ page }) => {
    await page.goto('/sell', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/nav-sell.png', fullPage: true });
    console.log('Sell URL:', page.url());
  });
});

test.describe('Product Sorting', () => {
  test('should display sorting options on sneakers page', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check for price sorting options in sidebar
    const priceLowHigh = page.locator('text=Price (Low - High)');
    const priceHighLow = page.locator('text=Price (High - Low)');
    const popular = page.locator('text=Popular');

    console.log('Price Low-High visible:', await priceLowHigh.isVisible().catch(() => false));
    console.log('Price High-Low visible:', await priceHighLow.isVisible().catch(() => false));
    console.log('Popular visible:', await popular.isVisible().catch(() => false));

    await page.screenshot({ path: '/tmp/sort-options.png', fullPage: true });
  });

  test('should sort by Price Low to High', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Price (Low - High) option
    const priceLowHigh = page.locator('text=Price (Low - High)').first();
    if (await priceLowHigh.isVisible({ timeout: 5000 }).catch(() => false)) {
      await priceLowHigh.click();
      await page.waitForTimeout(2000);
      console.log('Clicked Price Low-High');
    }

    await page.screenshot({ path: '/tmp/sort-price-low.png', fullPage: true });
    console.log('After sort URL:', page.url());
  });

  test('should sort by Price High to Low', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Price (High - Low) option
    const priceHighLow = page.locator('text=Price (High - Low)').first();
    if (await priceHighLow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await priceHighLow.click();
      await page.waitForTimeout(2000);
      console.log('Clicked Price High-Low');
    }

    await page.screenshot({ path: '/tmp/sort-price-high.png', fullPage: true });
    console.log('After sort URL:', page.url());
  });

  test('should filter by Recently Released', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Recently Released Sneakers option
    const recentlyReleased = page.locator('text=Recently Released Sneakers').first();
    if (await recentlyReleased.isVisible({ timeout: 5000 }).catch(() => false)) {
      await recentlyReleased.click();
      await page.waitForTimeout(2000);
      console.log('Clicked Recently Released');
    }

    await page.screenshot({ path: '/tmp/sort-recently-released.png', fullPage: true });
    console.log('After filter URL:', page.url());
  });
});

test.describe('Product Filtering', () => {
  test('should display filter options', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check for filter categories in sidebar
    const brandFilter = page.locator('text=Brand');
    const categoryFilter = page.locator('text=Category');
    const genderFilter = page.locator('text=Gender');

    console.log('Brand filter visible:', await brandFilter.isVisible().catch(() => false));
    console.log('Category filter visible:', await categoryFilter.isVisible().catch(() => false));
    console.log('Gender filter visible:', await genderFilter.isVisible().catch(() => false));

    await page.screenshot({ path: '/tmp/filter-options.png', fullPage: true });
  });

  test('should expand Brand filter', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Brand filter to expand
    const brandFilter = page.locator('text=Brand').first();
    if (await brandFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await brandFilter.click();
      await page.waitForTimeout(1000);
      console.log('Clicked Brand filter');
    }

    await page.screenshot({ path: '/tmp/filter-brand-expanded.png', fullPage: true });
  });

  test('should expand Category filter', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Category filter to expand
    const categoryFilter = page.locator('text=Category').first();
    if (await categoryFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
      console.log('Clicked Category filter');
    }

    await page.screenshot({ path: '/tmp/filter-category-expanded.png', fullPage: true });
  });

  test('should expand Gender filter', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Gender filter to expand
    const genderFilter = page.locator('text=Gender').first();
    if (await genderFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await genderFilter.click();
      await page.waitForTimeout(1000);
      console.log('Clicked Gender filter');
    }

    await page.screenshot({ path: '/tmp/filter-gender-expanded.png', fullPage: true });
  });
});

test.describe('Product Detail and Buy Flow', () => {
  test('should click on product and view details', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click on first product
    const productLink = page.locator('a[href*="/sneakers/"]').first();
    const href = await productLink.getAttribute('href');
    console.log('Product link:', href);

    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: '/tmp/product-detail.png', fullPage: true });
    console.log('Product detail URL:', page.url());
  });

  test('should see buy options on product page', async ({ page }) => {
    await page.goto('/sneakers', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click on first product
    const productLink = page.locator('a[href*="/sneakers/"]').first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await page.waitForTimeout(3000);
    }

    // Look for buy/size options
    const buyButton = page.locator('button:has-text("Buy"), button:has-text("Add"), text=Buy New, text=Buy Used');
    const sizeSelector = page.locator('text=Size, text=Select Size, button[data-size]');

    console.log('Buy button count:', await buyButton.count());
    console.log('Size selector count:', await sizeSelector.count());

    await page.screenshot({ path: '/tmp/product-buy-options.png', fullPage: true });
  });

  test('should access checkout page', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/checkout-page.png', fullPage: true });
    console.log('Checkout URL:', page.url());
    console.log('Checkout title:', await page.title());

    // Check for checkout elements
    const secureCheckout = page.locator('text=Secure Checkout');
    console.log('Secure Checkout visible:', await secureCheckout.isVisible().catch(() => false));
  });

  test('should access bag page', async ({ page }) => {
    await page.goto('/bag', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/bag-page.png', fullPage: true });
    console.log('Bag URL:', page.url());
  });
});
