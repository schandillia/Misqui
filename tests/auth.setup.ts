// tests/auth.setup.ts
import { test as setup, expect } from "@playwright/test"
import path from "path"
import { fileURLToPath } from "url"

// --- Get the directory name in an ES Module context ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// --- End of ESM directory fix ---

// Define path for authentication state file
const authFile = path.join(__dirname, "..", "playwright", ".auth", "user.json")

// --- Environment Variable Check ---
if (!process.env.TEST_GOOGLE_EMAIL || !process.env.TEST_GOOGLE_PASSWORD) {
  throw new Error(
    "Missing Google credentials (TEST_GOOGLE_EMAIL, TEST_GOOGLE_PASSWORD) in environment variables for setup."
  )
}

// **** ENSURE THIS BLOCK IS PRESENT ****
// Declare constants from environment variables
const TEST_GOOGLE_EMAIL = process.env.TEST_GOOGLE_EMAIL as string
const TEST_GOOGLE_PASSWORD = process.env.TEST_GOOGLE_PASSWORD as string
// **** END OF BLOCK ****

// --- Timeouts ---
const LONG_TIMEOUT = 120000 // Overall setup timeout (2 minutes)
const NAVIGATION_TIMEOUT = 60000 // For navigating to Google (1 minute)
const ACTION_TIMEOUT = 30000 // For finding/interacting with elements (30 seconds)
const FINAL_DESTINATION_TIMEOUT = 60000 // For sequence after password submit to final page (1 minute)

// --- Setup Test Definition ---
setup("Authenticate with Google", async ({ page }) => {
  setup.setTimeout(LONG_TIMEOUT)

  console.log(`\n--- Starting Google Authentication Setup ---`)
  // Use the declared constants
  console.log(`Attempting to log in as: ${TEST_GOOGLE_EMAIL}`)
  console.log(`Saving auth state to: ${authFile}`)

  try {
    // --- Step 1: Navigate and Initiate Login ---
    await page.goto("/")
    await page
      .getByRole("button", { name: "Start", exact: true })
      .click({ timeout: ACTION_TIMEOUT })
    const modal = page.getByRole("dialog")
    await expect(modal).toBeVisible({ timeout: ACTION_TIMEOUT })

    console.log('Setup: Clicking "Continue with Google"...')
    await Promise.all([
      page.waitForNavigation({
        url: /accounts\.google\.com/,
        timeout: NAVIGATION_TIMEOUT,
        waitUntil: "domcontentloaded",
      }),
      modal.getByRole("button", { name: "Continue with Google" }).click(),
    ])
    console.log(
      `Setup: Navigated to Google URL: ${page.url().substring(0, 80)}...`
    )

    // --- Step 2: Fill Google Credentials ---
    const emailInput = page.locator('input[type="email"], #identifierId')
    await emailInput.waitFor({ state: "visible", timeout: ACTION_TIMEOUT })
    console.log("Setup: Filling email...")
    // Use the declared constant
    await emailInput.fill(TEST_GOOGLE_EMAIL)
    await page
      .locator('#identifierNext button, div[role="button"]:has-text("Next")')
      .click()
    console.log(
      "Setup: Clicked Next after email. Waiting for password screen..."
    )

    // --- PASSWORD INTERACTION BLOCK ---
    try {
      const passwordInput = page.locator('input[name="Passwd"]') // Use specific selector
      console.log(
        'Setup: Waiting for password input (input[name="Passwd"]) to be visible...'
      )
      await passwordInput.waitFor({
        state: "visible",
        timeout: ACTION_TIMEOUT + 10000,
      })
      console.log("Setup: Password input is visible.")

      console.log("Setup: Attempting to fill password...")
      // Use the declared constant
      await passwordInput.fill(TEST_GOOGLE_PASSWORD)
      console.log("Setup: Password filled successfully.")

      // --- Step 3: Submit Password and Wait for Final Destination (/courses) ---
      console.log(
        "Setup: Attempting to click Next after password and wait for /courses..."
      )
      const passwordNextButton = page.locator(
        '#passwordNext button, div[role="button"]:has-text("Next")'
      )

      // Combine click with waiting for the final /courses page
      await Promise.all([
        page.waitForURL("**/courses", {
          // Wait for /courses
          timeout: FINAL_DESTINATION_TIMEOUT,
          waitUntil: "load", // Wait for page load
        }),
        passwordNextButton.click(),
      ])
      console.log(
        "Setup: Clicked password Next and navigation to /courses completed."
      )
    } catch (passwordError) {
      // Handle errors during password interaction or subsequent navigation
      console.error(
        "Setup Error: Failed during password interaction or navigating to /courses."
      )
      const currentUrl =
        page && !page.isClosed() ? page.url() : "Unknown (page closed)"
      console.error(`Current URL: ${currentUrl}`)
      const screenshotPath = path.join(
        __dirname,
        "..",
        "test-results",
        `setup-password-nav-failure-${Date.now()}.png`
      )
      if (page && !page.isClosed()) {
        await page
          .screenshot({ path: screenshotPath, fullPage: true })
          .catch((e) => console.error("Failed to take screenshot", e))
        console.error(`Screenshot saved to: ${screenshotPath}`)
      } else {
        console.error("Cannot take screenshot, page context seems closed.")
      }
      console.error("Password/Nav Error:", passwordError) // Log the specific error
      throw new Error(
        "Failed during password submit or navigating to /courses."
      ) // Re-throw cleanly
    }
    // --- END PASSWORD INTERACTION BLOCK ---

    // --- Step 4: Optional - Intermediate Screens block REMOVED ---

    // --- Step 5: Final Verification (Simple String Check) ---
    console.log(
      `Setup: Final verification. Current URL should contain /courses.`
    )
    await page.waitForTimeout(500) // Small pause for stability after load
    const finalUrl = page.url()
    console.log(`Setup: Final URL is: ${finalUrl}`)
    if (!finalUrl.includes("/courses")) {
      // If it doesn't include /courses, throw an explicit error
      throw new Error(
        `Final URL verification failed. Expected URL containing '/courses', but got: ${finalUrl}`
      )
    }
    console.log(`Setup: Final URL verification passed.`)

    // --- Step 6: Save Authentication State ---
    console.log(`Setup: Saving authentication state...`)
    await page.context().storageState({ path: authFile })
    console.log(
      `--- Google Authentication Setup Successful: State saved to ${authFile} ---`
    )
  } catch (error) {
    // --- Global Error Handling ---
    console.error(`\n--- Google Authentication Setup FAILED ---`)
    console.error(error) // Log the original error
    try {
      // Check if page exists and is not closed before interacting
      if (page && !page.isClosed()) {
        const currentUrl = page.url()
        console.error(`Setup failed at URL: ${currentUrl}`)
        const screenshotPath = path.join(
          __dirname,
          "..",
          "test-results",
          `setup-global-failure-${Date.now()}.png`
        )
        await page.screenshot({ path: screenshotPath, fullPage: true })
        console.error(`Screenshot saved to: ${screenshotPath}`)
      } else {
        console.error("Setup failed: Page context was already closed.")
      }
    } catch (postError) {
      console.error(
        "Setup failed: Also failed to retrieve URL or take screenshot.",
        postError
      )
    }
    // Re-throw a standard error message
    throw new Error(`Authentication setup failed. Check logs and screenshots.`)
  }
}) // End of setup test definition
