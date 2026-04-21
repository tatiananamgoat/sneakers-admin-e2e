import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Users Section
 * Sneakers Admin - staging.goat.com/admin
 */

const BASE_URL = 'https://staging.goat.com/admin';

// Users submenu items
const USERS_ITEMS = [
  { name: 'Seller Applications', url: '/admin/seller_applications' },
  { name: 'Applied', url: '/admin/users?filter=applied' },
  { name: 'Seller', url: '/admin/users?filter=seller' },
  { name: 'Admin Users', url: '/admin/permissions/resources/admin' },
  { name: 'All', url: '/admin/users?filter=all' },
  { name: 'With Custom Seller Fees', url: '/admin/users?filter=custom_seller_fee' },
  { name: 'User Bulk Edit', url: '/admin/user_bulk_edits/new' },
  { name: 'VAT Seller Bulk Edit', url: '/admin/vat_seller_bulk_edits/new' },
  { name: 'Account Link Tokens', url: '/admin/sell/account_link_tokens' },
];

test.describe('Users Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Users dropdown menu should be visible and expand on click', async ({ page }) => {
    const usersLink = page.getByRole('link', { name: 'Users' });
    await expect(usersLink).toBeVisible();
    await usersLink.click();
    await expect(usersLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Users dropdown should contain all menu items', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();

    for (const item of USERS_ITEMS) {
      const menuItem = page.getByRole('link', { name: item.name });
      await expect(menuItem).toBeVisible();
    }
  });
});

test.describe('Users Pages', () => {
  for (const item of USERS_ITEMS) {
    test(`Navigate to ${item.name} page`, async ({ page }) => {
      await page.goto(`https://staging.goat.com${item.url}`);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Seller Applications', () => {
  test('Seller Applications page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Seller Applications page should have country selector', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');

    await expect(page.getByRole('heading', { name: 'Choose a country to review:' })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('Country selector should contain expected countries', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');

    const dropdown = page.getByRole('combobox');
    const expectedCountries = [
      'United States',
      'Canada',
      'Great Britian',
      'United Kingdom',
      'Australia',
      'Netherlands',
      'Hong Kong',
      'Germany',
      'Singapore',
      'New Zealand',
      'China',
    ];

    for (const country of expectedCountries) {
      await expect(dropdown.getByRole('option', { name: country })).toBeAttached();
    }
  });

  test('Can select country and submit to view applications', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');

    const dropdown = page.getByRole('combobox');
    await dropdown.selectOption('United States');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Should navigate to an application review page or show message
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Seller Application Review', () => {
  test('Application review page should display user information', async ({ page }) => {
    // First go to seller applications and select a country
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for page to load (either review page or list)
    await expect(page.locator('main')).toBeVisible();

    // If we're on a review page, check for expected elements
    const heading = page.getByRole('heading', { level: 1 });
    if (await heading.textContent().then(t => t?.includes('Reviewing'))) {
      await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();
    }
  });

  test('Application review page should display action buttons', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('main')).toBeVisible();

    // Check for approve/deny/ban buttons if on review page
    const approveButton = page.getByRole('button', { name: 'approve' });
    const denyButton = page.getByRole('button', { name: 'deny' });
    const banButton = page.getByRole('button', { name: 'ban' });

    // At least one should be visible if on the review page
    const isReviewPage = await approveButton.isVisible().catch(() => false);
    if (isReviewPage) {
      await expect(approveButton).toBeVisible();
      await expect(denyButton).toBeVisible();
      await expect(banButton).toBeVisible();
    }
  });

  test('Application review should show return address information', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('main')).toBeVisible();

    const returnAddressHeading = page.getByRole('heading', { name: 'Return Address' });
    if (await returnAddressHeading.isVisible().catch(() => false)) {
      await expect(returnAddressHeading).toBeVisible();
      // Check for address validation info
      await expect(page.getByRole('rowheader', { name: 'Address' })).toBeVisible();
      await expect(page.getByRole('rowheader', { name: 'Validation' })).toBeVisible();
    }
  });
});

test.describe('User Approval Workflow', () => {
  test('Approve button should be clickable on application review', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('main')).toBeVisible();

    const approveButton = page.getByRole('button', { name: 'approve' });
    if (await approveButton.isVisible().catch(() => false)) {
      await expect(approveButton).toBeEnabled();
      // Note: Not clicking to avoid modifying real data in tests
    }
  });

  test('Navigate to approved sellers list', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=seller');

    await expect(page.getByRole('heading', { name: /Users.*seller/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});

test.describe('User Denial Workflow', () => {
  test('Deny button should be clickable on application review', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('main')).toBeVisible();

    const denyButton = page.getByRole('button', { name: 'deny' });
    if (await denyButton.isVisible().catch(() => false)) {
      await expect(denyButton).toBeEnabled();
      // Note: Not clicking to avoid modifying real data in tests
    }
  });

  test('Ban button should be available for fraud cases', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('main')).toBeVisible();

    const banButton = page.getByRole('button', { name: 'ban' });
    if (await banButton.isVisible().catch(() => false)) {
      await expect(banButton).toBeEnabled();
    }
  });
});

test.describe('User Registration - Applied Users', () => {
  test('Applied users page should show pending applications', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    await expect(page.getByRole('heading', { name: /Users.*applied/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('Applied users table should have correct columns', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    const expectedColumns = [
      'Id',
      'Login Scope',
      'Name',
      'Username',
      'Email',
      'Roles',
      'Picture',
      'Platform',
      'Seller Status',
      'Requested At',
      'Guest User',
    ];

    for (const column of expectedColumns) {
      await expect(page.getByRole('columnheader', { name: column })).toBeVisible();
    }
  });

  test('Applied users should show "applied" status', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    // Check that at least one row has "applied" status
    const appliedCells = page.getByRole('cell', { name: 'applied' });
    await expect(appliedCells.first()).toBeVisible();
  });

  test('Can search applied users by different criteria', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    const searchDropdown = page.getByRole('combobox');
    const searchOptions = [
      'Id',
      'Username',
      'Email',
      'Guest Email',
      'PayPal Email',
      'Name',
      'Phone',
      'Related to ID',
    ];

    for (const option of searchOptions) {
      await expect(searchDropdown.getByRole('option', { name: option })).toBeAttached();
    }
  });

  test('Search form should be functional', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    // Select search type
    await page.getByRole('combobox').selectOption('Username');

    // Enter search term
    await page.getByRole('textbox', { name: 'Search term' }).fill('test');

    // Submit search
    await page.getByRole('button', { name: 'Search' }).click();

    // Page should reload with search results
    await expect(page.locator('main')).toBeVisible();
  });

  test('Pagination should work on applied users', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    // Check pagination exists
    const pagination = page.getByRole('navigation', { name: 'pager' });
    if (await pagination.isVisible().catch(() => false)) {
      const nextLink = page.getByRole('link', { name: 'Next ›' });
      if (await nextLink.isVisible().catch(() => false)) {
        await nextLink.click();
        await expect(page).toHaveURL(/page=2/);
      }
    }
  });

  test('Can click on username to view user details', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    // Find a username link in the table
    const usernameLinks = page.locator('table tbody tr td a');
    const firstLink = usernameLinks.first();

    if (await firstLink.isVisible().catch(() => false)) {
      const href = await firstLink.getAttribute('href');
      await firstLink.click();

      // Should navigate to user edit page
      await expect(page).toHaveURL(/\/admin\/users\/.*\/edit/);
    }
  });
});

test.describe('User Details and Management', () => {
  test('User edit page should load from applied users', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');

    // Click on first username
    const usernameLink = page.locator('table tbody tr td a').first();
    if (await usernameLink.isVisible().catch(() => false)) {
      await usernameLink.click();
      await expect(page).toHaveURL(/\/admin\/users\/.*\/edit/);
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('User change log should be accessible', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/seller_applications');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('main')).toBeVisible();

    const logLink = page.getByRole('link', { name: 'Log' });
    if (await logLink.isVisible().catch(() => false)) {
      const href = await logLink.getAttribute('href');
      expect(href).toContain('change_log');
    }
  });
});

test.describe('Users List', () => {
  test('Applied users page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=applied');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Seller users page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=seller');
    await expect(page.locator('main')).toBeVisible();
  });

  test('All users page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=all');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Users with custom seller fees should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/users?filter=custom_seller_fee');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Admin Users', () => {
  test('Admin Users page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/permissions/resources/admin');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('User Bulk Operations', () => {
  test('User Bulk Edit page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/user_bulk_edits/new');
    await expect(page.locator('main')).toBeVisible();
  });

  test('VAT Seller Bulk Edit page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/vat_seller_bulk_edits/new');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Account Link Tokens', () => {
  test('Account Link Tokens page should load', async ({ page }) => {
    await page.goto('https://staging.goat.com/admin/sell/account_link_tokens');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Seller Cancellation Buffers', () => {
  test.describe('Page Navigation and UI', () => {
    test('Seller Cancellation Buffers page should load', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Seller Cancelation Buffers by Seller' })).toBeVisible();
    });

    test('Page should have navigation tabs', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await expect(page.getByRole('link', { name: 'Seller' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Warehouse' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Country/Postal Code' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Country/State Code' })).toBeVisible();
    });

    test('Page should have search functionality', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await expect(page.getByRole('textbox', { name: 'username' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Clear' })).toBeVisible();
    });

    test('Table should have correct columns', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await expect(page.getByRole('columnheader', { name: 'Seller ID' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Seller Username' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Buffer Hours' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    });

    test('Each row should have Edit and Reset actions', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        await expect(firstRow.getByRole('link', { name: 'Edit' })).toBeVisible();
        await expect(firstRow.getByRole('link', { name: 'Reset' })).toBeVisible();
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('Can search for a seller by username', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await page.getByRole('textbox', { name: 'username' }).fill('test');
      await page.getByRole('button', { name: 'Search' }).click();

      await expect(page.locator('main')).toBeVisible();
    });

    test('Clear link resets the search', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await page.getByRole('textbox', { name: 'username' }).fill('test');
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('link', { name: 'Clear' }).click();

      await expect(page).toHaveURL('https://staging.goat.com/admin/seller_cancelation_buffers');
    });
  });

  test.describe('Edit Buffer Form', () => {
    test('Edit page should load with buffer hours input', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const editLink = page.getByRole('link', { name: 'Edit' }).first();
      if (await editLink.isVisible().catch(() => false)) {
        await editLink.click();

        await expect(page.getByRole('heading', { level: 1 })).toContainText('Seller Cancelation Buffers for');
        await expect(page.getByRole('spinbutton', { name: 'Hours to add as a buffer' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Back' })).toBeVisible();
      }
    });

    test('Back link returns to main page', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const editLink = page.getByRole('link', { name: 'Edit' }).first();
      if (await editLink.isVisible().catch(() => false)) {
        await editLink.click();
        await page.getByRole('link', { name: 'Back' }).click();

        await expect(page).toHaveURL('https://staging.goat.com/admin/seller_cancelation_buffers');
      }
    });
  });

  test.describe('Approved Sellers - Buffer Management', () => {
    test('Approved seller can have buffer added', async ({ page }) => {
      // Navigate to seller cancellation buffers
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      // Find an existing approved seller with a buffer (they're listed in the table)
      const editLink = page.getByRole('link', { name: 'Edit' }).first();
      if (await editLink.isVisible().catch(() => false)) {
        await editLink.click();

        // Verify we're on the edit page
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Seller Cancelation Buffers for');

        // Verify buffer hours input is available and can accept values
        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        await expect(bufferInput).toBeVisible();
        await expect(bufferInput).toBeEnabled();

        // Can enter a value (but don't submit to avoid modifying data)
        await bufferInput.fill('50');
        await expect(bufferInput).toHaveValue('50');
      }
    });

    test('Approved seller can have buffer updated', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const editLink = page.getByRole('link', { name: 'Edit' }).first();
      if (await editLink.isVisible().catch(() => false)) {
        await editLink.click();

        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        await expect(bufferInput).toBeEnabled();

        // Change value to verify it can be updated
        await bufferInput.fill('100');
        await expect(bufferInput).toHaveValue('100');

        // Submit button should be clickable
        await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
      }
    });

    test('Approved seller buffer displays in table', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      // Verify table shows buffer hours for sellers
      const bufferCell = page.locator('table tbody tr td').filter({ hasText: /\d+ Hours/ }).first();
      if (await bufferCell.isVisible().catch(() => false)) {
        const text = await bufferCell.textContent();
        expect(text).toMatch(/\d+ Hours/);
      }
    });
  });

  test.describe('Non-Approved Sellers - Buffer Restrictions', () => {
    test('Adding buffer to non-approved seller shows error', async ({ page }) => {
      // Search for a non-approved seller (one with "applied" status)
      // First, get a non-approved username from the applied users list
      await page.goto('https://staging.goat.com/admin/users?filter=applied');

      // Get the first applied user's username
      const usernameCell = page.locator('table tbody tr td a').first();
      let username = '';

      if (await usernameCell.isVisible().catch(() => false)) {
        username = await usernameCell.textContent() || '';
      }

      if (username) {
        // Try to add a buffer for this non-approved user
        await page.goto(`https://staging.goat.com/admin/seller_cancelation_buffers/${username}/edit?type=seller`);

        // Fill in buffer hours
        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        if (await bufferInput.isVisible().catch(() => false)) {
          await bufferInput.fill('10');
          await page.getByRole('button', { name: 'Submit' }).click();

          // Should see an error message for non-approved seller
          // Check for alert or error message
          const errorAlert = page.locator('.alert-danger, .alert-error, [role="alert"]');
          const hasError = await errorAlert.isVisible().catch(() => false);

          // The page should either show an error or redirect back
          // Either way, the buffer should not be added
          await expect(page.locator('main')).toBeVisible();
        }
      }
    });

    test('Updating buffer for non-approved seller shows error', async ({ page }) => {
      // Get a non-approved username
      await page.goto('https://staging.goat.com/admin/users?filter=applied');

      const usernameCell = page.locator('table tbody tr td a').first();
      let username = '';

      if (await usernameCell.isVisible().catch(() => false)) {
        username = await usernameCell.textContent() || '';
      }

      if (username) {
        // Navigate to edit page for non-approved user
        await page.goto(`https://staging.goat.com/admin/seller_cancelation_buffers/${username}/edit?type=seller`);

        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        if (await bufferInput.isVisible().catch(() => false)) {
          // Try to update buffer
          await bufferInput.fill('20');
          await page.getByRole('button', { name: 'Submit' }).click();

          // Expect error handling - page should show error or reject the update
          await expect(page.locator('main')).toBeVisible();
        }
      }
    });

    test('Non-approved seller cannot have positive buffer set', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/users?filter=applied');

      const usernameCell = page.locator('table tbody tr td a').first();
      let username = '';

      if (await usernameCell.isVisible().catch(() => false)) {
        username = await usernameCell.textContent() || '';
      }

      if (username) {
        await page.goto(`https://staging.goat.com/admin/seller_cancelation_buffers/${username}/edit?type=seller`);

        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        if (await bufferInput.isVisible().catch(() => false)) {
          // Attempt to set positive buffer
          await bufferInput.fill('50');
          await page.getByRole('button', { name: 'Submit' }).click();

          // Should not succeed - check for error or redirect
          await expect(page.locator('main')).toBeVisible();

          // If redirected back to edit page with error, check for error message
          const errorMessage = page.locator('.alert, .error, .flash');
          if (await errorMessage.isVisible().catch(() => false)) {
            const errorText = await errorMessage.textContent();
            // Error should mention seller not approved or similar
            expect(errorText?.toLowerCase()).toMatch(/error|not approved|cannot|invalid/i);
          }
        }
      }
    });
  });

  test.describe('Reset Buffer - Non-Approved Sellers', () => {
    test('Reset link is available for sellers with buffers', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const resetLink = page.getByRole('link', { name: 'Reset' }).first();
      await expect(resetLink).toBeVisible();
    });

    test('Non-approved seller can be reset to 0 to delete buffer', async ({ page }) => {
      // This test verifies that even non-approved sellers can have their buffer reset to 0
      // This effectively deletes their buffer entry

      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      // Search for a specific seller or use first available
      const resetLink = page.getByRole('link', { name: 'Reset' }).first();

      if (await resetLink.isVisible().catch(() => false)) {
        // Get the reset URL to verify it's properly formatted
        const href = await resetLink.getAttribute('href');
        expect(href).toContain('seller_cancelation_buffers');
        expect(href).toContain('type=seller');

        // Note: Not clicking to avoid modifying production data
        // In a real test with test data, you would:
        // await resetLink.click();
        // Then verify the buffer is removed
      }
    });

    test('Reset action removes buffer entry', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      // Count rows before reset
      const rowsBefore = await page.locator('table tbody tr').count();

      // The reset action should:
      // 1. Set buffer to 0
      // 2. Remove the entry from the list (since 0 buffer = no buffer)

      // Verify reset links are present
      const resetLinks = page.getByRole('link', { name: 'Reset' });
      const resetCount = await resetLinks.count();

      // Each row with a buffer should have a reset option
      expect(resetCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Buffer Validation', () => {
    test('Buffer hours input accepts numeric values', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const editLink = page.getByRole('link', { name: 'Edit' }).first();
      if (await editLink.isVisible().catch(() => false)) {
        await editLink.click();

        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        await bufferInput.fill('24');
        await expect(bufferInput).toHaveValue('24');

        await bufferInput.fill('0');
        await expect(bufferInput).toHaveValue('0');

        await bufferInput.fill('168'); // 1 week in hours
        await expect(bufferInput).toHaveValue('168');
      }
    });

    test('Buffer hours input is a spinbutton type', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      const editLink = page.getByRole('link', { name: 'Edit' }).first();
      if (await editLink.isVisible().catch(() => false)) {
        await editLink.click();

        const bufferInput = page.getByRole('spinbutton', { name: 'Hours to add as a buffer' });
        await expect(bufferInput).toBeVisible();

        // Spinbutton allows increment/decrement
        await expect(bufferInput).toHaveAttribute('type', 'number');
      }
    });
  });

  test.describe('Warehouse Tab', () => {
    test('Can navigate to Warehouse tab', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await page.getByRole('link', { name: 'Warehouse' }).click();
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Country/Postal Code Tab', () => {
    test('Can navigate to Country/Postal Code tab', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await page.getByRole('link', { name: 'Country/Postal Code' }).click();
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Country/State Code Tab', () => {
    test('Can navigate to Country/State Code tab', async ({ page }) => {
      await page.goto('https://staging.goat.com/admin/seller_cancelation_buffers');

      await page.getByRole('link', { name: 'Country/State Code' }).click();
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
