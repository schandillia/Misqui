import { test, expect } from '@playwright/test';

// Ensure environment variables are set
if (!process.env.TEST_GOOGLE_EMAIL || !process.env.TEST_GOOGLE_PASSWORD) {
  console.warn('Skipping auth tests: TEST_GOOGLE_EMAIL and TEST_GOOGLE_PASSWORD not set');
}

const TEST_GOOGLE_EMAIL = process.env.TEST_GOOGLE_EMAIL as string;
const TEST_GOOGLE_PASSWORD = process.env.TEST_GOOGLE_PASSWORD as string;

test.describe('Authentication', () => {
  test.skip('should sign in with Google', async ({ page }) => {
    // Start from the home page
    await page.goto('/');

    // Click the auth button to open the modal
    await page.getByRole('button', { name: 'Start', exact: true }).click();

    // Wait for modal to be visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Click the Google sign-in button inside the modal
    await modal.getByRole('button', { name: 'Continue with Google' }).click();

    // Wait for Google sign-in page to load
    await page.waitForURL('**/accounts.google.com/**');

    // Fill in Google credentials
    await page.getByLabel('Email or phone').fill(TEST_GOOGLE_EMAIL);
    await page.getByRole('button', { name: 'Next' }).click();

    // Wait for password field and fill it
    await page.waitForSelector('input[type="password"]');
    await page.getByLabel('Password').fill(TEST_GOOGLE_PASSWORD);
    await page.getByRole('button', { name: 'Next' }).click();

    // Wait for redirect back to the app
    await page.waitForURL('**/learn**');

    // Verify we're on the learn page
    expect(page.url()).toContain('/learn');
  });

  test.skip('should handle failed Google sign-in', async ({ page }) => {
    // Start from the home page
    await page.goto('/');

    // Click the auth button to open the modal
    await page.getByRole('button', { name: 'Start', exact: true }).click();

    // Wait for modal to be visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Click the Google sign-in button inside the modal
    await modal.getByRole('button', { name: 'Continue with Google' }).click();

    // Wait for Google sign-in page to load
    await page.waitForURL('**/accounts.google.com/**');

    // Fill in invalid credentials
    await page.getByLabel('Email or phone').fill('invalid@email.com');
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify error message is shown (using a more general selector)
    await expect(page.getByText(/Couldn't find your Google Account|Couldn't sign you in/)).toBeVisible();
  });
}); 