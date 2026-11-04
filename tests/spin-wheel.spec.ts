import { test, expect } from '@playwright/test';

test.describe('Spin the Wheel', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Daily Spin page loads and spin wheel is visible', async ({ page }) => {
    await page.goto('/dashboard/spin');
    
    // Check if spin wheel container or text is visible
    await expect(page.locator('text=/Spin/i').first()).toBeVisible();

    // Verify spin control is visible
    const spinBtn = page.getByRole('button', { name: /Spin/i }).first();
    await expect(spinBtn).toBeVisible();
  });
});
