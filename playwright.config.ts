// playwright.config.ts

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url" // Needed for ESM __dirname

// --- START: Manual .env parsing ---
try {
  // Get directory name in ESM context for locating .env
  const __filename_env = fileURLToPath(import.meta.url)
  const __dirname_env = path.dirname(__filename_env)
  const envPath = path.resolve(__dirname_env, ".env") // Assumes .env is in the project root

  if (fs.existsSync(envPath)) {
    console.log(`Reading environment variables from: ${envPath}`)
    const envFileContent = fs.readFileSync(envPath, "utf8")

    envFileContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim()
      // Skip empty lines and comments
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const equalsIndex = trimmedLine.indexOf("=")
        if (equalsIndex > 0) {
          const key = trimmedLine.substring(0, equalsIndex).trim()
          let value = trimmedLine.substring(equalsIndex + 1).trim()

          // Basic handling for quotes (remove if present at start/end)
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1)
          }

          // Set environment variable ONLY if it's not already set
          if (process.env[key] === undefined) {
            process.env[key] = value
            // console.log(`  Loaded ${key} from .env`); // Uncomment carefully for debugging
          } else {
            // console.log(`  Skipped ${key} from .env (already set by system/command line)`);
          }
        }
      }
    })
  } else {
    console.log(
      `.env file not found at ${envPath}, relying on existing environment variables.`
    )
  }
} catch (error) {
  console.error("Error reading or parsing .env file:", error)
}
// --- END: Manual .env parsing ---

// --- Regular Playwright Config Imports and Definitions ---
import { defineConfig, devices } from "@playwright/test"

// --- Get directory name in ESM context for STORAGE_STATE ---
// (Recalculate here or reuse __dirname_env if scope allows, recalculating is safer)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define the path to the saved authentication state file using the corrected __dirname
export const STORAGE_STATE = path.join(
  __dirname,
  "playwright",
  ".auth",
  "user.json"
)

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests", // Directory containing test files
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0, // Maybe 1 retry on CI, 0 locally
  /* Opt out of parallel tests on CI if needed, but dependencies handle order. */
  workers: process.env.CI ? 1 : undefined, // Use 1 worker on CI, default locally (usually # cores / 2)
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html", // Generates an HTML report after tests run
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // Trace 'on' for easier debugging initially, change as needed
    trace: "on", // Options: 'on', 'off', 'retain-on-failure', 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: [
    // ---- SETUP PROJECT ----
    // This project runs first, performs authentication, and saves the state.
    {
      name: "setup",
      testMatch: /auth\.setup\.ts$/, // Only runs the auth.setup.ts file
    },

    // ---- TEST PROJECTS ----
    // These projects DEPEND on 'setup' completing successfully
    // and USE the saved storage state.
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use the saved authentication state.
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"], // This project runs *after* 'setup' completes
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"],
    },

    /* Example Mobile Viewports (uncomment if needed) */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //      ...devices['Pixel 5'],
    //      storageState: STORAGE_STATE,
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //      ...devices['iPhone 12'],
    //      storageState: STORAGE_STATE,
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev --no-turbo", // Command to start your dev server
    url: "http://localhost:3000", // URL to poll to ensure server is ready
    reuseExistingServer: !process.env.CI, // Reuse server locally, start fresh on CI
    timeout: 120000, // Max time to wait for server to start (2 minutes)
    // stdout: 'pipe', // Optional: pipe server output to test output
    // stderr: 'pipe',
  },
})
