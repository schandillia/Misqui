// Handles database connection and Drizzle ORM initialization.

import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "@/db/schema"
import { logger } from "@/lib/logger"

// Define the database connection string from environment variables
const connectionString = process.env.AUTH_DRIZZLE_URL

// Ensure the connection string is set
if (!connectionString) {
  const errorMsg = "AUTH_DRIZZLE_URL environment variable is not set."
  logger.error(errorMsg)
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
    } catch (
      err // eslint-disable-line @typescript-eslint/no-unused-vars
    ) {
      if (attempt === retries) {
        throw new Error("Database connection failed after retries.")
      }
      if (process.env.NODE_ENV !== "production") {
        logger.warn(
          `Database connection attempt ${attempt} failed, retrying in ${delay}ms...`
        )
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
  throw new Error("Unexpected error in retry logic")
}

// Initialize database connection lazily
let dbInstance: NeonHttpDatabase<typeof schema> | null = null
let initializationPromise: Promise<NeonHttpDatabase<typeof schema>> | null =
  null

async function initializeDb(): Promise<NeonHttpDatabase<typeof schema>> {
  if (dbInstance) {
    return dbInstance
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    try {
      const sql = await retry(() => {
        if (process.env.NODE_ENV !== "production") {
          logger.debug("Attempting to connect to Neon database...")
        }
        return Promise.resolve(neon(connectionString!)) // Non-null assertion
      })

      dbInstance = drizzle(sql, { schema })
      if (process.env.NODE_ENV !== "production") {
        logger.info("Successfully connected to Neon database")
      }
      return dbInstance
    } catch (err) {
      const maskedConnectionString = connectionString!.replace(
        /:([^@]+)@/,
        ":****@"
      )
      logger.error(
        `Database initialization failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        {
          connectionString: maskedConnectionString,
        }
      )
      throw new Error("Database unavailable")
    } finally {
      initializationPromise = null // Reset promise after completion
    }
  })()

  return initializationPromise
}

// Export db as a getter to handle lazy initialization
export const db = {
  get instance() {
    if (!dbInstance) {
      throw new Error(
        "Database not initialized. Ensure initializeDb is awaited before accessing db."
      )
    }
    return dbInstance
  },
}

// Export initializeDb for explicit initialization if needed
export { initializeDb }
