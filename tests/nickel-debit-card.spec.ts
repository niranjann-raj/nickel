import { test, expect } from '@playwright/test';

test.describe('Nickel Debit Card', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  });

  test('Debit card renders on dashboard home with masked balance and eye toggle', async ({ page }) => {
    await page.goto('/dashboard');

    // Debit card header and branding
    const debitCard = page.locator('div', { hasText: 'Account Balance' }).first();
    await expect(debitCard).toBeVisible();

    await expect(page.getByText('Debit Card').first()).toBeVisible();
    await expect(page.getByText('NICKEL', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Cardholder').first()).toBeVisible();

    // Verify balance is masked by default with dots
    const toggleBtn = page.getByRole('button', { name: /Show account balance|Hide account balance/i }).first();
    await expect(toggleBtn).toBeVisible();

    // Check masked balance presence
    await expect(page.getByText(/••••••••/).first()).toBeVisible();

    // Click toggle to reveal actual account balance
    await toggleBtn.click();

    // Once revealed, currency symbol and formatted number should be visible
    await expect(toggleBtn).toHaveAttribute('aria-label', /Hide account balance/i);
    await expect(page.locator('text=/₹\\s*-?[0-9,]+(\\.[0-9]{2})?/').first()).toBeVisible();

    // Click toggle again to re-mask balance
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-label', /Show account balance/i);
    await expect(page.getByText(/••••••••/).first()).toBeVisible();
  });
});
