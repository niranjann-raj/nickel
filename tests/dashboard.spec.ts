import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('Dashboard loads main sections and stats', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Financial Overview/i })).toBeVisible();

    // Check stats (Player Profile, Savings Trend)
    await expect(page.getByText(/Player Profile/i)).toBeVisible();
    await expect(page.getByText(/Savings Trend/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Leaderboard/i })).toBeVisible();

    // Check navigation to other pages works
    await page.getByRole('link', { name: /Save/i }).first().click();
    await expect(page).toHaveURL(/.*\/dashboard\/save/);
  });
});
