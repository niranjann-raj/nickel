import { test, expect } from '@playwright/test';

test.describe('Split Expense Module', () => {
  const testEmail = process.env.TEST_USER_EMAIL || 'tracker_test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
  });

  test('Navigates to Split Expense overview and verifies dashboard controls', async ({ page }) => {
    await page.getByRole('link', { name: /Split Expense/i }).first().click();
    await expect(page).toHaveURL(/.*\/dashboard\/split/);

    // Verify header and primary action buttons
    await expect(page.getByRole('heading', { name: 'Split Expense' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Room/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Join Room/i })).toBeVisible();

    // Verify aggregate statistics cards
    await expect(page.getByText(/Your Rooms/i).first()).toBeVisible();
    await expect(page.getByText(/You Are Owed/i).first()).toBeVisible();
    await expect(page.getByText(/You Owe/i).first()).toBeVisible();

    // Verify filter status pills
    await expect(page.getByRole('button', { name: /All Rooms/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Active', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settled', exact: true })).toBeVisible();
  });

  test('Join Room modal opens and accepts 6-character room code input', async ({ page }) => {
    await page.goto('/dashboard/split');

    await page.getByRole('button', { name: /Join Room/i }).click();

    // Verify Join modal
    const joinModal = page.locator('div.fixed.inset-0');
    await expect(joinModal.getByRole('heading', { name: /Join Split Room/i })).toBeVisible();
    await expect(joinModal.getByPlaceholder(/e\.g\. A3F91C/i)).toBeVisible();

    // Close modal by clicking X button
    await joinModal.locator('button').first().click();
    await expect(joinModal).not.toBeVisible();
  });

  test('Create Room modal opens, validates input, and creates room', async ({ page }) => {
    await page.goto('/dashboard/split');

    await page.getByRole('button', { name: /Create Room/i }).click();

    // Verify modal elements
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal.getByRole('heading', { name: /Create Split Room/i })).toBeVisible();

    // Fill room creation details
    const roomName = `Trip ${Date.now().toString().slice(-4)}`;
    await modal.getByPlaceholder(/e\.g\. Manali Trip/i).fill(roomName);
    await modal.getByPlaceholder(/Add trip details/i).fill('Test trip expenses');

    // Submit room creation inside modal
    await modal.getByRole('button', { name: /Create Room/i }).click();

    // Success screen inside modal shows Go to Room button
    await expect(modal.getByRole('button', { name: /Go to Room/i })).toBeVisible({ timeout: 10000 });

    // Click Go to Room
    await modal.getByRole('button', { name: /Go to Room/i }).click();
    await page.waitForURL('**/dashboard/split/**', { timeout: 15000 });

    // Wait for room page to finish loading
    await expect(page.getByText('Loading Room...')).not.toBeVisible({ timeout: 15000 });

    // Verify room details page loaded
    await expect(page.getByText(roomName).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Add Expense/i })).toBeVisible();

    // Verify room tabs
    await expect(page.getByRole('button', { name: /Expenses/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Balances & Settle/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Analytics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Members/i })).toBeVisible();
  });

  test('User can join a split room and record an expense that displays in the room', async ({ page }) => {
    await page.goto('/dashboard/split');

    // 1. Create a fresh room to get a 6-character room code
    await page.getByRole('button', { name: /Create Room/i }).click();
    const createModal = page.locator('div.fixed.inset-0');
    await expect(createModal.getByRole('heading', { name: /Create Split Room/i })).toBeVisible();

    const uniqueRoomName = `Goa Trip ${Date.now().toString().slice(-4)}`;
    await createModal.getByPlaceholder(/e\.g\. Manali Trip/i).fill(uniqueRoomName);
    await createModal.getByRole('button', { name: /Create Room/i }).click();

    // 2. Extract 6-character room code from success screen
    await expect(createModal.getByRole('button', { name: /Go to Room/i })).toBeVisible({ timeout: 10000 });
    const codeElement = createModal.locator('div.text-4xl.font-mono');
    const roomCode = (await codeElement.innerText()).trim();
    expect(roomCode).toHaveLength(6);

    // 3. Close create modal and return to split overview
    await createModal.locator('button').first().click();
    await page.goto('/dashboard/split');

    // 4. Open Join Room modal and enter the 6-character room code
    await page.getByRole('button', { name: /Join Room/i }).click();
    const joinModal = page.locator('div.fixed.inset-0');
    await expect(joinModal.getByRole('heading', { name: /Join Split Room/i })).toBeVisible();
    await joinModal.getByPlaceholder(/e\.g\. A3F91C/i).fill(roomCode);
    await joinModal.getByRole('button', { name: /Join Room/i }).click();

    // 5. Verify navigated into room details page
    await page.waitForURL('**/dashboard/split/**', { timeout: 15000 });
    await expect(page.getByText(uniqueRoomName).first()).toBeVisible({ timeout: 10000 });

    // 6. Click Add Expense and fill title and amount
    await page.getByRole('button', { name: /Add Expense/i }).first().click();
    const expenseModal = page.locator('div.fixed.inset-0');
    await expect(expenseModal.getByRole('heading', { name: /Add Shared Expense/i })).toBeVisible();

    const expenseTitle = 'Italian Cafe Dinner';
    await expenseModal.getByPlaceholder(/Resort Booking, Dinner at Cafe/i).fill(expenseTitle);
    await expenseModal.getByPlaceholder('0.00').first().fill('1450');

    // 7. Submit expense
    await expenseModal.getByRole('button', { name: /Save Expense/i }).click();

    // 8. Assert expense title and formatted amount appear in the room
    await expect(page.getByText(expenseTitle).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/1,450/).first()).toBeVisible({ timeout: 10000 });
  });
});
