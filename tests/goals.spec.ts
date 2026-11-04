import { test, expect } from '@playwright/test';

test.describe('Goals', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Goal creation with completion reward preview and filtering workflow', async ({ page }) => {
    await page.goto('/dashboard/goals');

    // Check page load
    await expect(page.getByRole('heading', { name: /Goal Based Saving/i })).toBeVisible();

    // Open Create Goal Modal
    await page.getByRole('button', { name: /Create Goal/i }).first().click();

    // Step 1: Choose Type
    await expect(page.getByRole('heading', { name: /Create Goal/i }).first()).toBeVisible();

    // Select Custom Goal
    await page.getByRole('heading', { name: /Custom Goal/i }).click();

    // Step 2: Goal Details
    await expect(page.getByText(/Target Amount/i).first()).toBeVisible();
    await page.getByPlaceholder(/e.g. MacBook Pro/i).fill('Playwright Goal');
    await page.getByPlaceholder(/80000/i).fill('15000');

    // Verify dynamic completion bonus preview badge appears (10k to 25k -> +500 Gold Coins)
    await expect(page.getByText(/Completion Bonus/i)).toBeVisible();
    await expect(page.getByText(/500 Gold Coins/i)).toBeVisible();

    // Select target date using modern calendar picker
    await page.getByRole('button', { name: /Select target date/i }).click();
    await page.locator('div[role="gridcell"] button:not([disabled])').last().click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Auto Savings Plan
    await expect(page.getByRole('heading', { name: /Auto Savings Plan/i })).toBeVisible();
    await page.getByRole('button', { name: /Start Saving Goal/i }).click();

    // Verify created goal card appears in the list
    await expect(page.getByText('Playwright Goal').first()).toBeVisible({ timeout: 10000 });

    // Filter by status dropdown
    const filterSelect = page.locator('select').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('Completed');
      await filterSelect.selectOption('Active');
      await filterSelect.selectOption('All');
    }
  });
});
