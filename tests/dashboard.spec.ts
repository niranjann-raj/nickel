import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Dashboard loads main sections, Nickel Debit Card, and stats', async ({ page }) => {
    await page.goto('/dashboard');

    // Check main heading
    await expect(page.getByRole('heading', { name: /Financial Overview/i })).toBeVisible();

    // Check player summary and debit card
    await expect(page.getByText(/Player Profile/i)).toBeVisible();
    await expect(page.getByText(/Debit Card/i).first()).toBeVisible();
    await expect(page.getByText(/NICKEL/i).first()).toBeVisible();

    // Check savings trend and leaderboard cards
    await expect(page.getByText(/Savings Trend/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Leaderboard/i })).toBeVisible();

    // Check navigation to Goal Based Saving
    await page.getByRole('link', { name: /Goal Based Saving/i }).first().click();
    await expect(page).toHaveURL(/.*\/dashboard\/goals/);

    // Navigate back to dashboard and check navigation to Expense Tracker
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Expense Tracker/i }).first().click();
    await expect(page).toHaveURL(/.*\/dashboard\/tracker/);
  });
});
