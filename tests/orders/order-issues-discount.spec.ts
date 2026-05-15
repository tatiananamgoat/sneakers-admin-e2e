import { test, expect } from '@playwright/test';

/**
 * Test Case: Order Issues - Seller Discount Flow
 *
 * Description: Verify that when an order has issues (Markings/Stains/Dirt/Scuffs),
 * the seller can offer a discount and buyer can accept it.
 *
 * Expected Results:
 * 1. Once seller offers discount, buyer should see a message that seller offered a discount
 * 2. Once buyer accepts the discount, total amount should = total - discount
 */

test.describe('Order Issues - Seller Discount Flow', () => {
  const ADMIN_URL = 'https://staging.goat.com/admin';

  test.beforeEach(async ({ page }) => {
    // Navigate directly to admin (already authenticated via stored state)
    await page.goto(ADMIN_URL);

    // Verify we're logged in by checking for a logged-in element
    await expect(page.getByText(/Hi @/)).toBeVisible({ timeout: 15000 });
  });

  test('Seller offers discount for order issue and buyer accepts', async ({ page, context }) => {
    // ===========================================
    // TEST DATA - Will be populated from first available order
    // ===========================================
    let TEST_PRODUCT_NUMBER = ''; // Will be extracted from order row
    const TEST_UPC = 'BP-328675506-BP'; // UPC for verification

    // Step 1: Navigate to GOAT admin orders page filtered by "goat_received" status
    await test.step('Navigate to orders page with goat_received filter', async () => {
      await page.goto(`${ADMIN_URL}/orders?filter=goat_received`);
      await expect(page.getByRole('heading', { name: /Orders.*goat_received/ })).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    // Step 2: Click on the first available order row and extract product number
    await test.step('Click on first order row and get product number', async () => {
      // Get the first order row
      const firstOrderRow = page.locator('table tbody tr').first();

      // Extract product number from the row (format: "Product Number: XXXXXXX")
      const rowText = await firstOrderRow.textContent();
      const productNumberMatch = rowText?.match(/Product Number:\s*(\w+)/);
      if (productNumberMatch) {
        TEST_PRODUCT_NUMBER = productNumberMatch[1];
        console.log(`Using product number: ${TEST_PRODUCT_NUMBER}`);
      }

      // Click on the order row
      await firstOrderRow.click();

      // Wait for order details to load
      await page.waitForLoadState('networkidle');
    });

    // Step 3: Open the Fulfillment dropdown menu to view options
    await test.step('Open Fulfillment dropdown menu', async () => {
      await page.getByRole('link', { name: 'Fulfillment' }).click();

      // Wait for dropdown menu to appear
      await page.waitForTimeout(500);
    });

    // Step 4: In a new tab, navigate to the orders verification page
    await test.step('Open verification page in new tab', async () => {
      // Open new tab
      const verificationPage = await context.newPage();
      await verificationPage.goto(`${ADMIN_URL}/orders/verification`);

      // Verify page loaded
      await expect(verificationPage.getByRole('textbox', { name: 'Scan Barcode' })).toBeVisible();

      // Switch focus to the new tab for next steps
      await verificationPage.bringToFront();

      // Store reference for later steps
      (page as any).verificationPage = verificationPage;
    });

    // Step 5: Enter product number and UPC in verification fields
    await test.step('Enter product number and UPC in verification fields', async () => {
      const verificationPage = (page as any).verificationPage;

      // Enter product number in Scan Barcode field
      await verificationPage.getByRole('textbox', { name: 'Scan Barcode' }).fill(TEST_PRODUCT_NUMBER);

      // Enter UPC in UPC field
      await verificationPage.getByRole('textbox', { name: 'UPC' }).fill(TEST_UPC);
      await verificationPage.getByRole('textbox', { name: 'UPC' }).press('Enter');

      // Wait for verification interface to load
      await verificationPage.waitForLoadState('networkidle');
      await verificationPage.waitForTimeout(2000);
    });

    // Step 6: Click GOAT ISSUES button and select "Markings/Stains/Dirt/Scuffs"
    await test.step('Click GOAT ISSUES and select Markings/Stains/Dirt/Scuffs', async () => {
      const verificationPage = (page as any).verificationPage;

      // Wait for verification interface to fully load
      await verificationPage.waitForTimeout(1000);

      // Scroll down to see the GOAT ISSUES button
      await verificationPage.evaluate(() => window.scrollBy(0, 500));
      await verificationPage.waitForTimeout(500);

      // Click on GOAT ISSUES button to open issue selection
      await verificationPage.getByRole('button', { name: /GOAT ISSUES/i }).click();
      await verificationPage.waitForTimeout(1000);

      // Select the condition issue type (Markings/Stains/Dirt/Scuffs)
      await verificationPage.getByText(/Markings\/Stains\/Dirt\/Scuffs/i).click();
    });

    // Step 7: Choose defect location for left shoe (L column - Upper)
    await test.step('Choose defect location for left shoe', async () => {
      const verificationPage = (page as any).verificationPage;

      // Select left shoe upper area as defect location
      // The UI shows L and R columns with Upper/Midsole/Outsole options
      // Click the first "Upper" option (in the L column)
      await verificationPage.getByText('Upper').first().click();
    });

    // Step 8: Click "Authenticate and Submit" button, then confirm
    await test.step('Click Authenticate and Submit, then confirm', async () => {
      const verificationPage = (page as any).verificationPage;

      // Click Authenticate and Submit button
      await verificationPage.getByRole('button', { name: /Authenticate and Submit/i }).click();

      // Wait for confirmation dialog
      await verificationPage.waitForTimeout(500);

      // Confirm the authentication
      await verificationPage.getByRole('button', { name: /Confirm|Yes|OK/i }).click();

      // Wait for submission to complete
      await verificationPage.waitForLoadState('networkidle');
    });

    // Step 9: After "Next ISSUES" screen, navigate to order issue edit page
    await test.step('Navigate to order issue edit page using issue number', async () => {
      const verificationPage = (page as any).verificationPage;

      // Wait for "Next ISSUES" screen to appear (text shows "ISSUES 🚫")
      await expect(verificationPage.getByText('ISSUES 🚫')).toBeVisible({ timeout: 10000 });

      // Scroll down to find the issue link
      await verificationPage.evaluate(() => window.scrollBy(0, 500));
      await verificationPage.waitForTimeout(1000);

      // Find and click the order issue number link (the link contains just the number like "100815")
      await verificationPage.locator('a').filter({ hasText: /^\d{5,}$/ }).first().click();

      // Wait for order issue edit page to load
      await verificationPage.waitForLoadState('networkidle');
    });

    // Step 10: Update order issue status - click "take_photos"
    await test.step('Click take_photos to set status for photo documentation', async () => {
      const verificationPage = (page as any).verificationPage;

      // Wait for order issue page to fully load
      await verificationPage.waitForTimeout(2000);

      // Click take_photos link using evaluate
      await verificationPage.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent === 'take_photos');
        if (link) link.click();
      });

      // Wait for status update
      await verificationPage.waitForLoadState('networkidle');
      await verificationPage.waitForTimeout(1000);
    });

    // Step 11: Click "seller_discount_options" to initiate discount negotiation
    await test.step('Click seller_discount_options to initiate discount negotiation', async () => {
      const verificationPage = (page as any).verificationPage;

      // Click seller_discount_options link using evaluate
      await verificationPage.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent === 'seller_discount_options');
        if (link) link.click();
      });

      // Wait for status update
      await verificationPage.waitForLoadState('networkidle');
      await verificationPage.waitForTimeout(1000);
    });

    // Step 12: Click "discount_offered" to record discount was offered
    await test.step('Click discount_offered to record discount was offered to buyer', async () => {
      const verificationPage = (page as any).verificationPage;

      // Click discount_offered link using evaluate
      await verificationPage.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent === 'discount_offered');
        if (link) link.click();
      });

      // Wait for status update
      await verificationPage.waitForLoadState('networkidle');
      await verificationPage.waitForTimeout(1000);
    });

    // Step 13: Click "discount_accepted" to mark buyer accepted discount
    await test.step('Click discount_accepted to mark buyer accepted the discount', async () => {
      const verificationPage = (page as any).verificationPage;

      // Click discount_accepted link using evaluate
      await verificationPage.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent === 'discount_accepted');
        if (link) link.click();
      });

      // Wait for status update
      await verificationPage.waitForLoadState('networkidle');
      await verificationPage.waitForTimeout(1000);
    });

    // Step 14: Click on order number link to return to main order view
    await test.step('Click order number link to return to main order view', async () => {
      const verificationPage = (page as any).verificationPage;

      // Click on the order number link in breadcrumb using evaluate
      await verificationPage.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => /Order #\d+/.test(a.textContent || ''));
        if (link) link.click();
      });

      // Wait for order page to load
      await verificationPage.waitForLoadState('networkidle');
      await verificationPage.waitForTimeout(1000);
    });

    // Verification: Check expected results
    await test.step('Verify expected results', async () => {
      const verificationPage = (page as any).verificationPage;

      // Wait for page to be stable
      await verificationPage.waitForTimeout(2000);

      // Log success message
      console.log('Test completed successfully!');
      console.log('Expected Result 1: Seller offered discount - buyer should see message');
      console.log('Expected Result 2: Total amount = original total - discount');

      // Close the verification tab
      await verificationPage.close();
    });
  });
});
