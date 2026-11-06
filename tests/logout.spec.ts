import { test, expect } from '@playwright/test';

test.describe('Logout', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('User can log out successfully', async ({ page }) => {
    await page.goto('/dashboard');

    // Logout button is in the sidebar
    const logoutBtn = page.getByRole('button', { name: /Logout|Log Out|Sign Out/i }).first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify user is redirected to login page
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/login/);

    // Attempting to visit dashboard should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
