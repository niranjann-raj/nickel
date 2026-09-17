import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const testEmail = process.env.TEST_USER_EMAIL || '';
  const testPassword = process.env.TEST_USER_PASSWORD || '';

  test('Valid login succeeds', async ({ page }) => {
    await page.goto('/login');
    
    // Fallback if there is a signup required, but let's try login first.
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    
    const loginBtn = page.getByRole('button', { name: /Log In|Login|Sign In/i });
    await loginBtn.click();

    // Give it a moment to load
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Invalid credentials are handled correctly', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill('invalid@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();

    // Verify error message
    const errorMsg = page.locator('text=/Invalid|Incorrect|Error|not found/i').first();
    await expect(errorMsg).toBeVisible();
  });
});
