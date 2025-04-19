import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

// Create a SQL connection
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create adapter
const adapter = new PrismaNeon({ connectionString })

// Create Prisma client
export const db = new PrismaClient({
  adapter,
})
