import { test, expect } from '@playwright/test';

test.describe('Bank and Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('Bank and transaction history display correctly', async ({ page }) => {
    await page.goto('/dashboard/save');
    
    // Verify transaction history loads
    const historySection = page.locator('text=/Transaction History|Recent Transactions/i').first();
    await expect(historySection).toBeVisible();

    // Verify wallet/bank interaction section
    const walletSection = page.locator('text=/Wallet|Bank|Balance/i').first();
    await expect(walletSection).toBeVisible();
  });
});
