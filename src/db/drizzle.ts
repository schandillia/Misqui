// Handles database connection and Drizzle ORM initialization.

import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "@/db/schema"

// Define the database connection string from environment variables
const connectionString = process.env.AUTH_DRIZZLE_URL

// Ensure the connection string is set
if (!connectionString) {
  const errorMsg = "AUTH_DRIZZLE_URL environment variable is not set."
  console.error(errorMsg)
  throw new Error(errorMsg)
}

/**
 * Retry function to attempt database connection with exponential backoff.
 * @param fn - The function to retry
 * @param retries - Number of retries
 * @param delay - Initial delay in milliseconds
 */
async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) {
        throw new Error("Database connection failed after retries.")
      }
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `Database connection attempt ${attempt} failed, retrying in ${delay}ms...`
        )
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
  throw new Error("Unexpected error in retry logic")
}

// Initialize database with retry logic
let db: NeonHttpDatabase<typeof schema>

try {
  const sql = await retry(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("Attempting to connect to Neon database...")
    }
    return Promise.resolve(neon(connectionString))
  })

  db = drizzle(sql, { schema })
  if (process.env.NODE_ENV !== "production") {
    console.info("Successfully connected to Neon database")
  }
} catch (err) {
  const maskedConnectionString = connectionString.replace(/:([^@]+)@/, ":****@")
  console.error(
    `Database initialization failed: ${
      err instanceof Error ? err.message : String(err)
    }`,
    {
      connectionString: maskedConnectionString,
    }
  )
  throw new Error("Database unavailable")
}

export { db }
