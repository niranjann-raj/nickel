import { test, expect } from '@playwright/test';

test.describe('Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('Quiz page loads and displays questions', async ({ page }) => {
    await page.goto('/dashboard/quiz');
    
    // Check if quiz heading is visible
    await expect(page.locator('text=/Quiz|Financial Literacy/i').first()).toBeVisible();
    
    // Check if we need to load questions first
    const loadBtn = page.getByRole('button', { name: /Load Questions/i });
    if (await loadBtn.isVisible()) {
      await loadBtn.click();
    }

    // Now the quiz should be loaded and the submit button visible
    const submitBtn = page.getByRole('button', { name: /Submit Quiz/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
  });
});
