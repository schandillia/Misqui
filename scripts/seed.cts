// seed.cts
import fs from "fs"
import path from "path"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "../src/db/schema"
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

const db = drizzle(sql, { schema })

const main = async () => {
  try {
    logger.info("Starting database seeding")

    await db.delete(schema.courses)
    await db.delete(schema.userProgress)
    await db.delete(schema.units)
    await db.delete(schema.lessons)
    await db.delete(schema.challenges)
    await db.delete(schema.challengeOptions)
    await db.delete(schema.challengeProgress)
    await db.delete(schema.userSubscription)
    logger.debug("Cleared existing data from all tables")

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Chess",
        description: "Learn the basics of chess.",
        image: "/board.svg",
      },
      {
        id: 2,
        title: "Sudoku",
        description: "Learn the basics of sudoku.",
        image: "/sudoku-icon.svg",
      },
      {
        id: 3,
        title: "Math",
        description: "Learn the basics of math.",
        image: "/math-icon.svg",
      },
    ])
    logger.debug("Inserted courses")

    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1, // Chess
        title: "Unit 1",
        description: "Learn the basics of Chess",
        order: 1,
      },
    ])
    logger.debug("Inserted units")

    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1,
        order: 1,
        title: "Grid",
      },
      {
        id: 2,
        unitId: 1,
        order: 2,
        title: "Pieces",
      },
      {
        id: 3,
        unitId: 1,
        order: 3,
        title: "Opening",
      },
      {
        id: 4,
        unitId: 1,
        order: 4,
        title: "Pawn",
      },
      {
        id: 5,
        unitId: 1,
        order: 5,
        title: "Rook",
      },
    ])
    logger.debug("Inserted lessons")

    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        challengeType: "SELECT",
        order: 1,
        question: "How many squares are there on a chess board?",
      },
      {
        id: 2,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 2,
        question: "The pawn",
      },
      {
        id: 3,
        lessonId: 1,
        challengeType: "SELECT",
        order: 3,
        question: "Which of these is the bishop?",
      },
    ])
    logger.debug("Inserted initial challenges")

    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: true,
        text: "64",
      },
      {
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "54",
      },
      {
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "72",
      },
      {
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "36",
      },
    ])
    logger.debug("Inserted challenge options for challenge 1")

    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 2,
        audio: "/board.mp3",
        correct: true,
        text: "Moves one or two squares forward on its first move, one square thereafter",
      },
      {
        challengeId: 2,
        audio: "/board.mp3",
        correct: false,
        text: "Moves diagonally only",
      },
      {
        challengeId: 2,
        audio: "/board.mp3",
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 2,
        audio: "/board.mp3",
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },
    ])
    logger.debug("Inserted challenge options for challenge 2")

    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 3,
        correct: true,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 3,
        correct: false,
        text: "Moves horizontally or vertically any number of squares",
      },
      {
        challengeId: 3,
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 3,
        correct: false,
        text: "Moves any number of squares in any direction",
      },
    ])
    logger.debug("Inserted challenge options for challenge 3")

    await db.insert(schema.challenges).values([
      {
        id: 4,
        lessonId: 2,
        challengeType: "SELECT",
        order: 4,
        question:
          "What is the starting position of the king in a standard chess game?",
      },
      {
        id: 5,
        lessonId: 2,
        challengeType: "SELECT",
        order: 5,
        question: "How many points is a queen worth in chess?",
      },
      {
        id: 6,
        lessonId: 2,
        challengeType: "ASSIST",
        order: 6,
        question: "The knight",
      },
    ])
    logger.debug("Inserted additional challenges")

    logger.info("Database seeding completed successfully")
  } catch (error) {
    logger.error("Failed to seed database: %O", {
      error,
      timestamp: new Date().toISOString(),
      operation: "database seeding",
    })
    throw new Error(
      `Failed to seed database: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

main()
