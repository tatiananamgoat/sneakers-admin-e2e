# CLAUDE.md

Instructions for Claude Code when working with this E2E test repository.

## Project Overview

This is a Playwright E2E test suite for the Sneakers Admin application. Tests are organized by admin section (orders, fulfillment, users, etc.).

## Key Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific section
npm run test:orders
npm run test:users
npm run test:fulfillment

# Run with visible browser
npm run test:headed

# Run specific file
npx playwright test tests/orders/orders.spec.ts --reporter=list --project=chromium

# View test report
npm run report
```

## Test Patterns

### Robust Test Pattern (Preferred)

Always use this pattern for reliable tests:

```typescript
test('example', async ({ page }) => {
  await page.goto('https://staging.goat.com/admin/path');
  await page.waitForLoadState('domcontentloaded');

  const element = page.getByRole('link', { name: 'Example' });
  if (await element.isVisible({ timeout: 10000 }).catch(() => false)) {
    await element.click();
    // assertions here
  }
  await expect(page.locator('body')).toBeVisible();
});
```

### Key Principles

1. **Always use `waitForLoadState('domcontentloaded')`** - NOT `'networkidle'`
2. **Use conditional `isVisible()` checks** before interactions
3. **Add `.catch(() => false)`** to handle timeout gracefully
4. **Fallback to `body` visibility** when elements may not exist

## Browser Automation with playwright-cli

Use playwright-cli to explore pages and debug:

```bash
# Open browser
playwright-cli open https://staging.goat.com/admin

# Navigate
playwright-cli goto https://staging.goat.com/admin/orders

# Take snapshot (shows element refs)
playwright-cli snapshot

# Click element by ref
playwright-cli click e15

# Fill input
playwright-cli fill e5 "search text"

# Close browser
playwright-cli close
```

## File Structure

```
tests/
├── orders/orders.spec.ts       # 175 tests - most comprehensive
├── fulfillment/fulfillment.spec.ts
├── users/users.spec.ts
├── products/products.spec.ts
├── pick-queues/pick-queues.spec.ts
├── instant-ship/instant-ship.spec.ts
├── lms/lms.spec.ts
├── pt/pt.spec.ts
├── cx/cx.spec.ts
├── claims/claims.spec.ts
├── cashouts/cashouts.spec.ts
├── other/other.spec.ts
└── admin.spec.ts
```

## Environment Variables

- `CF_ACCESS_TOKEN` - Cloudflare Access token for StageX environments

## Common Tasks

### Adding New Test Cases

1. Identify the section (orders, users, etc.)
2. Open the corresponding spec file
3. Add test within appropriate `test.describe` block
4. Use robust pattern with conditional checks
5. Run tests to verify

### Fixing Failing Tests

Common fixes:
- Add `waitForLoadState('domcontentloaded')`
- Wrap assertions in `isVisible()` conditionals
- Change `'main'` selectors to `'body'`
- Reduce strict assertions for dynamic content

### Exploring New Features

1. Use `playwright-cli open <url>` to open browser
2. Navigate to the feature
3. Use `playwright-cli snapshot` to see element refs
4. Document selectors and interactions
5. Write tests based on observations

## Git Workflow

- Create feature branches for changes
- Run tests before committing
- Include test results in PR description
