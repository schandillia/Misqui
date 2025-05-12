// tests/auth.spec.ts
import { test, expect } from "@playwright/test"

// No need for credentials here unless testing the failed login path explicitly
// const TEST_GOOGLE_EMAIL = process.env.TEST_GOOGLE_EMAIL as string
// const TEST_GOOGLE_PASSWORD = process.env.TEST_GOOGLE_PASSWORD as string

test.describe("Authentication", () => {
  // This test now RELIES ON the saved authentication state from auth.setup.ts
  // It assumes the user is already logged in when the test starts.
  test("should be signed in and on the /learn page", async ({ page }) => {
    // Don't perform login steps here. Go directly to the authenticated page.
    console.log(
      "Test: Navigating directly to /learn assuming logged in state..."
    )
    await page.goto("/learn") // Use baseURL + /learn

    // Verify we are on the learn page (or wherever logged-in users should land)
    console.log(`Test: Current URL: ${page.url()}`)
    await expect(page).toHaveURL(/.*\/learn/)

    // Add assertions to check for elements confirming the logged-in state
    // Example: Look for a profile button, user name, logout button, etc.
    await expect(
      page.getByRole("button", { name: /Account|Profile|Logout/i })
    ).toBeVisible({ timeout: 10000 })
    console.log("Test: Verified logged-in state on /learn.")
  })

  // This test checks the failure path and DOES NOT use the saved state.
  // It needs to perform the initial steps itself.
  test("should handle failed Google sign-in", async ({ page }) => {
    console.log("Test: Starting failed Google sign-in test...")
    // Start from the home page
    await page.goto("/")

    // Click the auth button to open the modal
    await page.getByRole("button", { name: "Start", exact: true }).click()

    // Wait for modal to be visible
    const modal = page.getByRole("dialog")
    await expect(modal).toBeVisible({ timeout: 10000 })

    console.log('Test (Fail): Clicking "Continue with Google"...')
    // Click the Google sign-in button inside the modal
    await Promise.all([
      page.waitForNavigation({
        url: /accounts\.google\.com/,
        timeout: 30000,
        waitUntil: "domcontentloaded",
      }),
      modal.getByRole("button", { name: "Continue with Google" }).click(),
    ])

    // Check for configuration error (still good practice)
    if (page.url().includes("/api/auth/error?error=Configuration")) {
      throw new Error(
        "OAuth configuration error encountered during failed login test."
      )
    }
    console.log(
      `Test (Fail): Navigated to Google: ${page.url().substring(0, 80)}...`
    )

    // Fill in *invalid* credentials
    const emailInput = page.locator('input[type="email"], #identifierId')
    await emailInput.waitFor({ state: "visible", timeout: 30000 })
    console.log("Test (Fail): Filling invalid email...")
    await emailInput.fill("definitely.not.a.real.google.account@gmail.com") // Use an invalid email
    await page
      .locator('#identifierNext button, div[role="button"]:has-text("Next")')
      .click()

    // Verify error message is shown
    console.log("Test (Fail): Checking for Google error message...")
    const errorElement = page.locator(
      'div:has-text("Couldn’t find your Google Account"), div:has-text("Enter a valid email")' // Common error texts
    )
    await expect(errorElement).toBeVisible({ timeout: 20000 })
    console.log("Test (Fail): Verified error message for invalid email.")
  })

  // You might want other tests here:
  // - Testing the unauthenticated state (navigating to /learn redirects to /)
  // - Testing the logout flow
})

// Example of a test for another authenticated page (e.g., tests/profile.spec.ts)
// import { test, expect } from '@playwright/test';
// test.describe('User Profile', () => {
//   test('should display user email on profile page', async ({ page }) => {
//     await page.goto('/profile'); // Assumes /profile requires login
//     await expect(page.locator('#user-email-display')).toContainText(/@/); // Check for email format
//   });
// });
