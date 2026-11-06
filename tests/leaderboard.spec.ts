import { test, expect } from '@playwright/test';

test.describe('Leaderboard', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Leaderboard loads and displays rankings and user XP', async ({ page }) => {
    await page.goto('/dashboard/leaderboard');
    
    // Check if leaderboard text or heading is visible
    await expect(page.getByRole('heading', { name: /Leaderboard|Rankings/i }).first()).toBeVisible();

    // Check rank indicators or podium elements
    await expect(page.locator('text=/Rank|XP/i').first()).toBeVisible();
  });
});
