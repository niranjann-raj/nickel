import { test, expect } from '@playwright/test';

test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('User can log out successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Logout button is typically in the navbar or a dropdown
    // We will look for a button or link with text "Logout" or "Sign Out"
    const logoutBtn = page.locator('text=/Logout|Sign Out/i').first();
    await logoutBtn.click();

    // Verify user is redirected to home or login page
    await expect(page).toHaveURL(/.*(\/login|\/)/);
    
    // Attempting to visit dashboard should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
