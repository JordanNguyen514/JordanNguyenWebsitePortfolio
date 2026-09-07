import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8080';
const outputRoot = fileURLToPath(new URL('../assets/videos/frames/', import.meta.url));
const viewport = { width: 960, height: 540 };

const recordings = [
  {
    id: 'homepage-smoke',
    path: '/',
    actions: async (page, capture) => {
      await page.locator('#hero-title').waitFor();
      await page.waitForTimeout(700);
      await capture();
      await page.locator('[data-testid="nav-browse-btn"]').click();
      await page.waitForTimeout(700);
      await capture();
      await page.locator('[data-testid="nav-sdet"]').click();
      await page.waitForTimeout(900);
      await capture();
      await page.locator('[data-testid="sdet-live-pipeline-link"]').click();
      await page.locator('#ci-dashboard-grid').waitFor();
      await page.waitForTimeout(900);
      await capture();
    },
  },
  {
    id: 'quality-dashboard',
    path: '/assets/html/live-pipeline-status.html',
    actions: async (page, capture) => {
      await page.locator('.metrics-grid').waitFor();
      await page.waitForTimeout(900);
      await capture();
      await page.locator('.sdet-section:nth-of-type(2)').scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await capture();
      await page.locator('#ci-dashboard-grid').waitFor();
      await page.waitForTimeout(1800);
      await capture();
    },
  },
  {
    id: 'recruiter-navigation',
    path: '/assets/html/recruiter.html',
    actions: async (page, capture) => {
      await page.locator('.recruiter-name').waitFor();
      await page.waitForTimeout(700);
      await capture();
      await page.locator('[data-testid="nav-home"]').click();
      await page.locator('#hero-title').waitFor();
      await page.waitForTimeout(700);
      await capture();
      await page.goto(`${baseURL}/assets/html/recruiter.html`);
      await page.locator('.recruiter-name').waitFor();
      await page.goto('https://cal.com/jordan-nguyen-7celnw/15min', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      await capture();
      await page.goto('https://cal.com/jordan-nguyen-7celnw/15min?slot=2026-09-08T14%3A30%3A00.000Z', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(900);
      await capture();
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.count()) {
        await page.getByLabel(/Your name/i).fill('Test User');
        await emailInput.fill('invalid-email');
        await page.getByRole('button', { name: 'Confirm', exact: true }).click();
        await page.waitForTimeout(900);
        await capture();
      }
    },
  },
];

for (const recording of recordings) {
  const outputDirectory = path.join(outputRoot, recording.id);
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(outputDirectory, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(60000);
  let frameNumber = 0;
  const capture = async () => {
    frameNumber += 1;
    await page.screenshot({
      path: path.join(outputDirectory, `frame-${String(frameNumber).padStart(2, '0')}.png`),
    });
  };

  await page.goto(`${baseURL}${recording.path}`);
  await capture();
  await recording.actions(page, capture);
  await browser.close();
}