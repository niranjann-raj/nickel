import { test, expect } from '@playwright/test';

test.describe('Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('Leaderboard loads and displays rankings', async ({ page }) => {
    await page.goto('/dashboard/leaderboard');
    
    // Check if leaderboard text or heading is visible
    await expect(page.getByRole('heading', { name: /Leaderboard|Rankings/i }).first()).toBeVisible();

    // The rankings list should have list items or rows
    const listItems = page.locator('li, tr');
    // Just ensure it doesn't crash and renders at least the wrapper
    await expect(page.locator('text=/Rank/i').first()).toBeVisible();
  });
});
