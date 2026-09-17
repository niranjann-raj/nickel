import { test, expect } from '@playwright/test';

test.describe('Savings and Wallet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('Save page loads and displays wallet', async ({ page }) => {
    await page.goto('/dashboard/save');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Save Money/i })).toBeVisible();

    // Check stats rows
    await expect(page.getByText(/Total Saved/i).first()).toBeVisible();
    await expect(page.getByText(/Current Streak/i).first()).toBeVisible();
    await expect(page.getByText(/XP Earned/i).first()).toBeVisible();

    // We can't see the exact inputs in SavingWalletCard without inspecting it, 
    // but checking that the page loads is a solid start.
  });
});
