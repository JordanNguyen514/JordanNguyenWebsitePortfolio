/**
 * ============================================================
 *  PLAYWRIGHT TESTS  —  playwright/portfolio.spec.ts
 * ============================================================
 *
 *  CONCEPT — Why Playwright alongside Cypress?
 *  --------------------------------------------
 *  Cypress excels at E2E UI flows on a single browser.
 *  Playwright adds:
 *    • TRUE multi-browser testing (Chromium, Firefox, WebKit/Safari)
 *    • Network interception & API mocking at the test level
 *    • Parallel test execution out of the box
 *    • Built-in auto-wait (no .should() chains needed)
 *    • Visual regression snapshots
 *    • Mobile viewport emulation
 *
 *  Run with:
 *    npx playwright test                          (all browsers)
 *    npx playwright test --browser=firefox        (one browser)
 *    npx playwright test --ui                     (interactive UI mode)
 *    npx playwright show-report                   (view HTML report)
 *
 * ============================================================
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://d2kmkdebgfkxyh.cloudfront.net';

// ── Shared helpers ─────────────────────────────────────────────────────────────
async function goHome(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 1 — Cross-Browser Smoke Tests
//  Runs on Chromium, Firefox, and WebKit (Safari) automatically
//  via playwright.config.ts projects array.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Cross-Browser Smoke Tests', () => {

  test('homepage loads and displays hero content', async ({ page }) => {
    await goHome(page);
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('#hero-title')).toContainText('Jordan Nguyen');
    await expect(page.locator('.career-port-title')).toContainText('Career Portfolio');
  });

  test('navigation bar is present with all dropdown menus', async ({ page }) => {
    await goHome(page);
    await expect(page.locator('.topnav')).toBeVisible();
    // Open Browse dropdown
    await page.click('button:has-text("Browse")');
    await expect(page.locator('.dropdown-menu').first()).toBeVisible();
    await expect(page.locator('[data-event-action="Click_Jobs"]')).toBeVisible();
    await expect(page.locator('[data-event-action="Click_Certifications"]')).toBeVisible();
  });

  test('Jobs page loads and shows work timeline', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/html/jobs.html`);
    await expect(page.locator('h1')).toContainText('My Work Experiences');
    await expect(page.locator('#nationalbank-card')).toBeVisible();
    // Verify SDET role is present (most relevant for recruiters)
    await expect(page.locator('#nationalbank-card')).toContainText('SDET');
  });

  test('SDET Showcase page renders all four sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/html/sdet.html`);
    await expect(page.locator('.sdet-hero h1')).toContainText('SDET Showcase');
    await expect(page.locator('text=Skills Matrix')).toBeVisible();
    await expect(page.locator('text=Test Automation Showcase')).toBeVisible();
    await expect(page.locator('text=CI/CD Pipeline')).toBeVisible();
    await expect(page.locator('text=QA Metrics Dashboard')).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 2 — Network Interception & API Mocking
//  This is where Playwright shines — intercept real HTTP calls and
//  return controlled responses for deterministic tests.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('API Interception Tests', () => {

  test('visitor counter displays mocked count from API', async ({ page }) => {
    // Intercept the AWS API Gateway call and return a fixed value
    await page.route('**/mwtufj8xia.execute-api.ca-central-1.amazonaws.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ visits: 4242 }),
      });
    });

    await goHome(page);
    // Visitor counter should display our mocked value
    await expect(page.locator('#visitorCounter')).toContainText('4242');
  });

  test('contact form submits and shows success on API 200', async ({ page }) => {
    // Mock the Lambda contact API to return success
    await page.route('**/execute-api.ca-central-1.amazonaws.com/prod', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Message sent successfully!' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/assets/html/contacting.html`);
    await page.fill('#firstName', 'Playwright');
    await page.fill('#lastName', 'Test');
    await page.check('input[value="P"]');
    await page.fill('#email', 'test@playwright.dev');
    await page.fill('#number', '5141234567');
    await page.fill('#Message', 'Automated Playwright test submission');
    await page.click('.SubBtn');

    await expect(page.locator('#formResponse')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#formResponse')).toContainText('Message sent successfully!');
  });

  test('handles API failure gracefully (visitor counter shows N/A)', async ({ page }) => {
    // Simulate a network failure on the visitor count endpoint
    await page.route('**/mwtufj8xia.execute-api.ca-central-1.amazonaws.com/**', async route => {
      await route.abort('failed');
    });

    await goHome(page);
    // Should fall back gracefully (not crash the page)
    await expect(page.locator('#visitorCounter')).toContainText('N/A');
    // Hero should still render — API failure shouldn't break the page
    await expect(page.locator('#hero-title')).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 3 — Mobile Viewport Tests
//  Ensures the portfolio works on mobile — important for recruiter review
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Mobile Responsive Tests', () => {

  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro

  test('homepage is usable on mobile', async ({ page }) => {
    await goHome(page);
    await expect(page.locator('#hero-title')).toBeVisible();
    // Nav should still be accessible
    await expect(page.locator('.topnav')).toBeVisible();
    // Skills section should be readable
    await expect(page.locator('.skills-title')).toBeVisible();
  });

  test('jobs page timeline renders on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/html/jobs.html`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.timeline-container')).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 4 — Visual Regression (screenshot-based)
//  Playwright's built-in screenshot comparison. Run once to create baselines,
//  then every subsequent run diffs against them.
//  Note: Applitools (Feature 2) provides a cloud-based visual testing alternative.
// ══════════════════════════════════════════════════════════════════════════════
test.describe('Visual Regression — Screenshot Snapshots', () => {

  test('homepage hero section matches baseline', async ({ page }) => {
    await goHome(page);
    await page.waitForLoadState('networkidle');
    // Snapshot just the hero — more stable than full-page
    await expect(page.locator('.hero-section')).toHaveScreenshot('hero-section.png', {
      threshold: 0.05, // 5% pixel diff tolerance
    });
  });

  test('SDET skills matrix matches baseline', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/html/sdet.html`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.skills-matrix-grid')).toHaveScreenshot('skills-matrix.png', {
      threshold: 0.05,
    });
  });

});
