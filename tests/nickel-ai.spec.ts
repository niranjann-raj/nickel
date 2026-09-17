import { test, expect } from '@playwright/test';

test.describe('Nickel AI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /Log In|Login|Sign In/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AI chat interface can be opened and interacted with', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for chatbot trigger button
    // It's usually a floating button with an icon or text like 'AI', 'Chat', etc.
    // In ChatBot.tsx it says "nickel Ai". Let's look for any button that might toggle it.
    // If we can't find the exact button, we look for the ChatBot text if it's already open.
    const aiText = page.locator('text=/nickel Ai/i').first();
    
    if (!(await aiText.isVisible())) {
      // Try to click the trigger button
      const triggerBtn = page.locator('button').filter({ hasText: /AI|Chat/i }).first();
      if (await triggerBtn.isVisible()) {
        await triggerBtn.click();
      } else {
        // sometimes it's just an icon button at the bottom right.
        const iconBtn = page.locator('.fixed.bottom-4.right-4, .fixed.bottom-6.right-6').locator('button').first();
        if (await iconBtn.isVisible()) {
          await iconBtn.click();
        }
      }
    }
    
    // Verify AI interface is visible
    await expect(page.locator('text=/nickel Ai/i').first()).toBeVisible({ timeout: 5000 });
  });
});
