import { test, expect } from '@playwright/test';

test.describe('AutoPay', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('AutoPay configuration is accessible in Goal creation and Goal details', async ({ page }) => {
    await page.goto('/dashboard/goals');
    await expect(page.getByRole('heading', { name: /Goal Based Saving/i })).toBeVisible();

    // Verify AutoPay step exists during goal creation
    await page.getByRole('button', { name: /Create Goal/i }).first().click();
    await page.getByRole('heading', { name: /Custom Goal/i }).click();

    // Fill goal target
    await page.getByPlaceholder(/e.g. MacBook Pro/i).fill('AutoPay Test Goal');
    await page.getByPlaceholder(/80000/i).fill('10000');
    await page.getByRole('button', { name: /Select target date/i }).click();
    await page.locator('div[role="gridcell"] button:not([disabled])').last().click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify Auto Savings Plan options (AutoPay configuration)
    await expect(page.getByRole('heading', { name: /Auto Savings Plan/i })).toBeVisible();
    await expect(page.getByText(/Saving Frequency/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'DAILY', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'WEEKLY', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'MONTHLY', exact: true })).toBeVisible();
    await expect(page.getByText(/Funding Source/i)).toBeVisible();
    await expect(page.getByText('Main Account Balance', { exact: true })).toBeVisible();

    // Complete creation with AutoPay
    await page.getByRole('button', { name: /Start Saving Goal/i }).click();

    // Check that AutoPay badge is present on the goal card
    const goalCard = page.locator('.group', { hasText: 'AutoPay Test Goal' }).first();
    await expect(goalCard).toBeVisible({ timeout: 10000 });
    await expect(goalCard.getByText('AutoPay:').first()).toBeVisible();

    // Click into Goal Details
    await goalCard.getByRole('button', { name: /View/i }).first().click();
    await page.waitForURL('**/dashboard/goals/**', { timeout: 10000 });

    // Verify Auto Saving Info card on details page
    await expect(page.getByText(/Auto Saving Info/i)).toBeVisible();
    await expect(page.getByText('Frequency', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Run AutoPay/i })).toBeVisible();
  });
});
