/**
 * Playwright Configuration  —  playwright.config.ts
 *
 * Runs tests on 3 browser engines (Chromium, Firefox, WebKit)
 * in parallel. Reports to HTML and GitHub Actions.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Fail if test.only left in on CI
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['github'],   // Annotates failed tests directly in GitHub Actions UI
    ['list'],
  ],

  use: {
    baseURL: 'https://d2kmkdebgfkxyh.cloudfront.net',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  // Snapshot settings for visual regression
  snapshotDir: './playwright/snapshots',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    // Mobile
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
