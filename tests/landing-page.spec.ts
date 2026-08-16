import { test, expect } from '@playwright/test';

test('landing page loads and displays key elements', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // 1. Navigate to landing page
  await page.goto('http://localhost:5173/');

  // 2. Verify page loads
  // The app title is usually 'nickle \u2013 Turn Saving Money Into a Game' or similar
  await expect(page).toHaveTitle(/nickle/i);

  // 3. Verify Nickel logo/name is visible
  // The navbar has 'nickel'
  await expect(page.locator('text=nickel').first()).toBeVisible();

  // 4. Verify main hero heading
  await expect(page.getByRole('heading', { name: /Gamify Your Savings/i })).toBeVisible();

  // 5. Verify CTA buttons are visible
  // Look for a link or button that says Get Started, Login, etc.
  const ctaButton = page.locator('text=/Get Started|Login|Start Saving/i').first();
  await expect(ctaButton).toBeVisible();

  // 6. Check for console errors
  // We don't fail immediately on console warnings, only page errors and console.error
  if (errors.length > 0) {
    console.error('Console errors found:', errors);
  }
  expect(errors).toHaveLength(0);
});
