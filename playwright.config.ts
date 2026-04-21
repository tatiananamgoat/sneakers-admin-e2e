import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://staging.goat.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // HTTP Basic Auth for staging
    httpCredentials: {
      username: 'jordan',
      password: 'goat!234',
    },
    // CF Access token for admin (set CF_ACCESS_TOKEN env var)
    storageState: process.env.CF_ACCESS_TOKEN ? {
      cookies: [{
        name: 'CF_Authorization',
        value: process.env.CF_ACCESS_TOKEN,
        domain: 'staging.goat.com',
        path: '/',
        expires: -1,
        httpOnly: true,
        secure: true,
        sameSite: 'None' as const,
      }],
      origins: [],
    } : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
