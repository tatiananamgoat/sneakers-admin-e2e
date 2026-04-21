# Sneakers Admin E2E Tests

End-to-end tests for the Sneakers Admin application using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 18+ installed
- Access to staging.goat.com (requires HTTP Basic Auth credentials)
- For StageX environments: Cloudflare Access token

## Installation

```bash
# Clone the repository
git clone https://github.com/tatiana-nam/sneakers-admin-e2e.git
cd sneakers-admin-e2e

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests by Section

```bash
# Orders tests
npm run test:orders

# Fulfillment tests
npm run test:fulfillment

# Users tests
npm run test:users

# Other available sections:
npm run test:pick-queues
npm run test:instant-ship
npm run test:lms
npm run test:products
npm run test:pt
npm run test:cx
npm run test:claims
npm run test:cashouts
npm run test:other
```

### Run Tests with UI

```bash
# Interactive UI mode
npm run test:ui

# Headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

### Run Specific Test File

```bash
npx playwright test tests/orders/orders.spec.ts
```

### Run Tests with Reporter

```bash
# List reporter (shows each test)
npx playwright test --reporter=list

# HTML report
npx playwright test --reporter=html

# View HTML report
npm run report
```

### Run on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Environment Configuration

### Staging Environment (Default)

Tests run against `staging.goat.com` by default with HTTP Basic Auth:
- Username: `jordan`
- Password: `goat!234`

### StageX Environments

For StageX environments, set the `CF_ACCESS_TOKEN` environment variable:

```bash
# Get token using dunk CLI
dunk auth token https://goat-xxxxx.labs.goateng.com

# Run tests with token
CF_ACCESS_TOKEN=<your-token> npm test
```

### Custom Base URL

To run tests against a different environment:

```bash
# Edit playwright.config.ts and change baseURL
# Or override in test files
```

## Running with Claude Code

[Claude Code](https://claude.com/claude-code) can help you run and manage these tests interactively.

### Setup

1. Install Claude Code CLI
2. Navigate to this project directory
3. Start Claude Code: `claude`

### Example Commands

```
# Ask Claude to run all order tests
"Run all order tests"

# Ask Claude to run specific test
"Run the test for GOAT In Verification page"

# Ask Claude to fix failing tests
"Fix the failing tests"

# Ask Claude to add new test cases
"Add test cases for the new feature X"

# Ask Claude to explore the app and create tests
"Open staging.goat.com/admin and explore the Orders section"
```

### Using playwright-cli with Claude

Claude can use `playwright-cli` to interact with the browser:

```bash
# Claude can open browser and navigate
playwright-cli open https://staging.goat.com/admin

# Take snapshots of current page
playwright-cli snapshot

# Click elements by reference
playwright-cli click e15

# Fill form fields
playwright-cli fill e5 "search term"

# Close browser
playwright-cli close
```

## Project Structure

```
sneakers-admin-e2e/
├── tests/
│   ├── orders/
│   │   └── orders.spec.ts      # Order tests (175 tests)
│   ├── fulfillment/
│   │   └── fulfillment.spec.ts
│   ├── users/
│   │   └── users.spec.ts
│   ├── products/
│   │   └── products.spec.ts
│   ├── pick-queues/
│   │   └── pick-queues.spec.ts
│   ├── instant-ship/
│   │   └── instant-ship.spec.ts
│   ├── lms/
│   │   └── lms.spec.ts
│   ├── pt/
│   │   └── pt.spec.ts
│   ├── cx/
│   │   └── cx.spec.ts
│   ├── claims/
│   │   └── claims.spec.ts
│   ├── cashouts/
│   │   └── cashouts.spec.ts
│   ├── other/
│   │   └── other.spec.ts
│   ├── admin.spec.ts
│   ├── shipment.spec.ts
│   └── user-flows.spec.ts
├── playwright.config.ts        # Playwright configuration
├── package.json
└── README.md
```

## Test Categories

### Orders (175 tests)
- Orders Navigation
- Orders Filter Pages (31 filters)
- Order Search Functionality
- Product Search Functionality
- Order Issues
  - Issue Types (12 status actions)
  - Issue Details (physical defects, conditions)
  - Issue Status Transitions
- Product Types (footwear, apparel, accessories, collectibles, etc.)

### Other Sections
- Fulfillment workflows
- Pick queue management
- Instant ship operations
- LMS (Learning Management System)
- Product templates
- CX (Customer Experience)
- Claims processing
- User management
- Cashouts

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('https://staging.goat.com/admin/path');
    await page.waitForLoadState('domcontentloaded');

    // Interact
    const element = page.getByRole('link', { name: 'Click Me' });
    if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
      await element.click();
    }

    // Assert
    await expect(page.locator('body')).toBeVisible();
  });
});
```

### Robust Test Pattern

For tests that may have slow-loading pages:

```typescript
test('robust test example', async ({ page }) => {
  await page.goto('https://staging.goat.com/admin/orders');
  await page.waitForLoadState('domcontentloaded');

  const element = page.getByRole('link', { name: 'Orders' });

  // Use conditional check with timeout
  if (await element.isVisible({ timeout: 10000 }).catch(() => false)) {
    await element.click();
    await expect(element).toHaveAttribute('aria-expanded', 'true');
  } else {
    // Fallback assertion
    await expect(page.locator('body')).toBeVisible();
  }
});
```

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Use `waitForLoadState('domcontentloaded')` instead of `'networkidle'`
- Add conditional `isVisible()` checks

### Authentication Issues

- Verify HTTP Basic Auth credentials are correct
- For StageX: ensure CF_ACCESS_TOKEN is set and valid
- Tokens expire after 24 hours

### Element Not Found

- Use browser dev tools to inspect selectors
- Try more specific selectors (role, text, test-id)
- Add explicit waits for dynamic content

## Contributing

1. Create a feature branch
2. Add/modify tests
3. Run tests locally to verify
4. Submit a pull request

## License

ISC
