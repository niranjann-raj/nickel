import { test, expect } from '@playwright/test';

test.describe('Nickel AI', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('AI chat interface can be opened and interacted with', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for chatbot trigger button (floating button in bottom corner)
    const triggerBtn = page.locator('img[alt="AI"]').first();
    if (await triggerBtn.isVisible()) {
      await triggerBtn.click();
    } else {
      const fallbackBtn = page.locator('.fixed.bottom-6.right-6, .fixed.bottom-4.right-4').locator('div, button').first();
      if (await fallbackBtn.isVisible()) {
        await fallbackBtn.click();
      }
    }

    // Verify AI interface opens
    await expect(page.getByPlaceholder(/Ask about your finances/i)).toBeVisible({ timeout: 6000 });
  });
});
