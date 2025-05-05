// reset.cts
import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"
import { logger } from "@/lib/logger"

// Load .env manually
const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8")
  for (const line of envFile.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const [, key, rawValue] = match
      const value = rawValue?.replace(/^['"]|['"]$/g, "") ?? ""
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

const sql = neon(process.env.AUTH_DRIZZLE_URL!)

const main = async () => {
  try {
    logger.info("Dropping all tables and clearing migration history")

    // Clear migration files
    const drizzleDir = path.resolve(__dirname, "../drizzle")
    if (fs.existsSync(drizzleDir)) {
      fs.rmSync(drizzleDir, { recursive: true, force: true })
      logger.info("Cleared drizzle directory")
    }

    await sql`
      DO $$
      DECLARE
        tabname RECORD;
      BEGIN
        -- Drop all tables
        FOR tabname IN
          (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || tabname.tablename || '" CASCADE';
        END LOOP;

        -- Clear Drizzle migration history
        DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
        DROP TABLE IF EXISTS "__drizzle_migrations_lock" CASCADE;
        DROP TABLE IF EXISTS "drizzle_migrations" CASCADE;
        DROP TABLE IF EXISTS "drizzle_migrations_lock" CASCADE;
      END
      $$;
    `

    logger.info("All tables and migration history cleared successfully")
  } catch (error) {
    logger.error("Failed to drop tables: %O", {
      error,
      timestamp: new Date().toISOString(),
      operation: "drop tables",
    })
    throw new Error(
      `Failed to drop tables: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

main()
