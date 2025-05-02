// Handles database connection and Drizzle ORM initialization.

import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "@/db/schema"

// Define the database connection string from environment variables
const connectionString = process.env.AUTH_DRIZZLE_URL

// Ensure the connection string is set
if (!connectionString) {
  throw new Error(
    "AUTH_DRIZZLE_URL environment variable is not set. Please configure it in your .env file."
  )
}

// Create the Neon serverless database client
const sql = neon(connectionString)

/**
 * Initialize Drizzle with the Neon HTTP driver and the combined schema.
 * The 'schema' object contains all table definitions imported from schema.ts.
 * The type NeonHttpDatabase<typeof schema> provides type safety based on your schema.
 */
export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema })
