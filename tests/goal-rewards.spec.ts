import { test, expect } from '@playwright/test';

test.describe('Goal Rewards and Trend Analysis', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Create Goal Modal dynamically calculates gold coins completion reward tiers', async ({ page }) => {
    await page.goto('/dashboard/goals');

    // Open Create Goal modal
    await page.getByRole('button', { name: /Create Goal/i }).first().click();
    await page.getByRole('heading', { name: /Custom Goal/i }).click();

    const targetInput = page.getByPlaceholder(/80000/i);

    // Test Tier 1: below 1000 -> 25 coins
    await targetInput.fill('750');
    await expect(page.getByText(/\+25 Gold Coins/i)).toBeVisible();

    // Test Tier 2: 1000 to 2500 -> 50 coins
    await targetInput.fill('2000');
    await expect(page.getByText(/\+50 Gold Coins/i)).toBeVisible();

    // Test Tier 3: 2500 to 5000 -> 100 coins
    await targetInput.fill('4500');
    await expect(page.getByText(/\+100 Gold Coins/i)).toBeVisible();

    // Test Tier 4: 5000 to 10k -> 200 coins
    await targetInput.fill('8000');
    await expect(page.getByText(/\+200 Gold Coins/i)).toBeVisible();

    // Test Tier 5: 10k to 25k -> 500 coins
    await targetInput.fill('15000');
    await expect(page.getByText(/\+500 Gold Coins/i)).toBeVisible();

    // Test Tier 6: 25k to 50k -> 1000 coins
    await targetInput.fill('40000');
    await expect(page.getByText(/\+1,000 Gold Coins/i)).toBeVisible();

    // Test Tier 7: 50k to 1L -> 2000 coins
    await targetInput.fill('75000');
    await expect(page.getByText(/\+2,000 Gold Coins/i)).toBeVisible();

    // Test Tier 8: 1L to 2.5L -> 5000 coins
    await targetInput.fill('200000');
    await expect(page.getByText(/\+5,000 Gold Coins/i)).toBeVisible();

    // Test Tier 9: 2.5L to 5L -> 10000 coins
    await targetInput.fill('350000');
    await expect(page.getByText(/\+10,000 Gold Coins/i)).toBeVisible();

    // Test Tier 10: 5L+ -> 20000 coins
    await targetInput.fill('600000');
    await expect(page.getByText(/\+20,000 Gold Coins/i)).toBeVisible();
  });

  test('Goal Details displays Saving Trend chart with Cumulative and Daily Saved toggle', async ({ page }) => {
    await page.goto('/dashboard/goals');

    // Find any goal card to inspect details
    const viewBtn = page.getByRole('button', { name: /View/i }).first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForURL('**/dashboard/goals/**', { timeout: 10000 });

      // Verify Saving Trend section
      await expect(page.getByRole('heading', { name: /Saving Trend/i })).toBeVisible();

      // Verify toggle buttons
      const cumulativeBtn = page.getByRole('button', { name: 'Cumulative', exact: true });
      const dailyBtn = page.getByRole('button', { name: 'Daily Saved', exact: true });

      await expect(cumulativeBtn).toBeVisible();
      await expect(dailyBtn).toBeVisible();

      // Toggle to Daily Saved
      await dailyBtn.click();
      // Ensure no crash and chart stays visible
      await expect(page.locator('.recharts-responsive-container')).toBeVisible();

      // Toggle back to Cumulative
      await cumulativeBtn.click();
      await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    }
  });
});
