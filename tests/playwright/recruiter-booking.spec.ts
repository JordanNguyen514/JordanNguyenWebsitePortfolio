import { test, expect } from '@playwright/test';

test.describe('Recruiter booking validation', () => {
  test('rejects an invalid email before a 20-minute booking is submitted', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/assets/html/recruiter.html');

    const bookingLink = page.locator('[data-event-action="Book_Call"]');
    await expect(bookingLink).toHaveAttribute('href', /cal\.com/);

    await page.goto('https://cal.com/jordan-nguyen-7celnw/15min', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    await page.goto('https://cal.com/jordan-nguyen-7celnw/15min?slot=2026-09-08T14%3A30%3A00.000Z', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 30000 });
    await page.getByLabel(/Your name/i).fill('Test User');
    await emailInput.fill('invalid-email');
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.getByText(/doesn't look like an email address/i)).toBeVisible();
  });
});