import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

test.describe.configure({ mode: 'serial' });

test.describe('Money Tracker', () => {
  test.beforeAll(() => {
    const backendDir = path.resolve(process.cwd(), 'backend');
    execSync('python seed_tracker_test_user.py', { cwd: backendDir, stdio: 'inherit' });
  });

  test.afterAll(() => {
    const backendDir = path.resolve(process.cwd(), 'backend');
    try {
      execSync('python delete_tracker_test_user.py', { cwd: backendDir, stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to clean up tracker test user:', e);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: /Continue with Email/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  });

  test('Navigates to Expense Tracker and loads dashboard elements', async ({ page }) => {
    // Navigate using the sidebar link
    await page.getByRole('link', { name: /Expense Tracker/i }).first().click();
    await expect(page).toHaveURL(/.*\/dashboard\/tracker/);

    // Check header
    await expect(page.getByRole('heading', { name: 'Expense Tracker' })).toBeVisible();

    // Check main actions
    await expect(page.getByRole('button', { name: /Add Transaction/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload Bill/i })).toBeVisible();

    // Check overview cards
    await expect(page.getByText(/Total Income/i).first()).toBeVisible();
    await expect(page.getByText(/Total Expenses/i).first()).toBeVisible();
    await expect(page.getByText(/Net Cash Flow/i).first()).toBeVisible();

    // Check time filter pills
    await expect(page.getByRole('button', { name: 'This Month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All Time' })).toBeVisible();

    // Check charts & AI insights card
    await expect(page.getByText(/Cash Flow & Spending Trend/i)).toBeVisible();
    await expect(page.getByText(/Category Breakdown/i)).toBeVisible();
    await expect(page.getByText(/Nickel AI Spending Insights/i)).toBeVisible();
  });

  test('Filter by All Time displays recorded transactions and bill details', async ({ page }) => {
    await page.goto('/dashboard/tracker');

    // Switch to All Time filter
    await page.getByRole('button', { name: 'All Time' }).click();

    // Verify transaction history section
    await expect(page.getByRole('heading', { name: /Transaction History/i })).toBeVisible();

    // Verify Sunrise Foods Pvt Ltd bill is visible in the table under All Time
    await expect(page.getByText('Sunrise Foods Pvt Ltd').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#transaction-history-section').getByText(/3,130/)).toBeVisible();
  });

  test('Add Transaction modal opens and displays required fields', async ({ page }) => {
    await page.goto('/dashboard/tracker');

    // Click "Add Transaction"
    await page.getByRole('button', { name: /Add Transaction/i }).click();

    // Verify modal elements
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal.getByRole('heading', { name: /Record Transaction/i })).toBeVisible();
    await expect(modal.getByPlaceholder('0.00')).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Expense', exact: true })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Income', exact: true })).toBeVisible();

    // Close modal
    await modal.getByRole('button', { name: /Cancel/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('Upload Bill modal opens and displays file dropzone', async ({ page }) => {
    await page.goto('/dashboard/tracker');

    // Click "Upload Bill"
    await page.getByRole('button', { name: /Upload Bill/i }).click();

    // Verify upload modal
    const uploadModal = page.locator('div.fixed.inset-0');
    await expect(uploadModal.getByRole('heading', { name: /Upload Bill \/ Receipt/i })).toBeVisible();
    await expect(uploadModal.getByText(/Choose a file or drag & drop here/i)).toBeVisible();

    // Close modal
    await uploadModal.getByRole('button', { name: /Cancel/i }).click();
    await expect(uploadModal).not.toBeVisible();
  });
});
