import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';

// Check for auth file or CF_ACCESS_TOKEN
const getStorageState = () => {
  // First check for auth.json file
  if (fs.existsSync('./auth.json')) {
    return './auth.json';
  }
  // Fall back to CF_ACCESS_TOKEN env var
  if (process.env.CF_ACCESS_TOKEN) {
    return {
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
    };
  }
  return undefined;
};

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
    // Use saved auth state or CF_ACCESS_TOKEN
    storageState: getStorageState(),
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
