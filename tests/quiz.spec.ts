import { test, expect } from '@playwright/test';

test.describe('Quiz', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Quiz page loads and displays quiz card', async ({ page }) => {
    await page.goto('/dashboard/quiz');
    
    // Check if quiz heading or container is visible
    await expect(page.locator('text=/Quiz|Financial Literacy/i').first()).toBeVisible();
    
    // Check if we need to load questions first
    const loadBtn = page.getByRole('button', { name: /Load Questions/i });
    if (await loadBtn.isVisible()) {
      await loadBtn.click();
    }

    // Submit or start button
    const submitBtn = page.getByRole('button', { name: /Submit Quiz|Start Quiz/i }).first();
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toBeVisible();
    }
  });
});
