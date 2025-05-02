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

    // Clear existing data
    await Promise.all([
      db.delete(schema.courses),
      db.delete(schema.userProgress),
      db.delete(schema.units),
      db.delete(schema.lessons),
      db.delete(schema.challenges),
      db.delete(schema.challengeOptions),
      db.delete(schema.challengeProgress),
      db.delete(schema.userSubscription),
    ])
    logger.debug("Cleared existing data from all tables")

    // Insert courses
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

    // Insert units
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

    // Insert lessons
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

    // Insert all challenges
    await db.insert(schema.challenges).values([
      // Lesson 1: Grid
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
      {
        id: 7,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 4,
        question: "What is a rank on a chessboard?",
      },
      {
        id: 8,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 5,
        question: "What is a file on a chessboard?",
      },
      {
        id: 9,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 6,
        question: "What is a diagonal on a chessboard?",
      },
      // Lesson 2: Pieces
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
    logger.debug("Inserted all challenges")

    // Insert all challenge options
    await db.insert(schema.challengeOptions).values([
      // Lesson 1: Challenge 1
      { challengeId: 1, correct: true, text: "64" },
      { challengeId: 1, correct: false, text: "54" },
      { challengeId: 1, correct: false, text: "72" },
      { challengeId: 1, correct: false, text: "36" },
      // Lesson 1: Challenge 2
      {
        challengeId: 2,
        correct: true,
        text: "Moves one or two squares forward on its first move, one square thereafter",
      },
      { challengeId: 2, correct: false, text: "Moves diagonally only" },
      { challengeId: 2, correct: false, text: "Moves in an L-shape" },
      {
        challengeId: 2,
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },
      // Lesson 1: Challenge 3
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
      { challengeId: 3, correct: false, text: "Moves in an L-shape" },
      {
        challengeId: 3,
        correct: false,
        text: "Moves any number of squares in any direction",
      },
      // Lesson 1: Challenge 7 (Rank)
      {
        challengeId: 7,
        correct: true,
        text: "A horizontal row on the chessboard",
      },
      {
        challengeId: 7,
        correct: false,
        text: "A vertical column on the chessboard",
      },
      {
        challengeId: 7,
        correct: false,
        text: "A diagonal line on the chessboard",
      },
      { challengeId: 7, correct: false, text: "The center of the chessboard" },
      // Lesson 1: Challenge 8 (File)
      {
        challengeId: 8,
        correct: true,
        text: "A vertical column on the chessboard",
      },
      {
        challengeId: 8,
        correct: false,
        text: "A horizontal row on the chessboard",
      },
      {
        challengeId: 8,
        correct: false,
        text: "A diagonal line on the chessboard",
      },
      { challengeId: 8, correct: false, text: "The center of the chessboard" },
      // Lesson 1: Challenge 9 (Diagonal)
      {
        challengeId: 9,
        correct: true,
        text: "A line connecting squares diagonally",
      },
      {
        challengeId: 9,
        correct: false,
        text: "A horizontal row on the chessboard",
      },
      {
        challengeId: 9,
        correct: false,
        text: "A vertical column on the chessboard",
      },
      { challengeId: 9, correct: false, text: "The center of the chessboard" },
      // Lesson 2: Challenge 4
      { challengeId: 4, correct: true, text: "e1 for White, e8 for Black" },
      { challengeId: 4, correct: false, text: "d1 for White, d8 for Black" },
      { challengeId: 4, correct: false, text: "f1 for White, f8 for Black" },
      { challengeId: 4, correct: false, text: "c1 for White, c8 for Black" },
      // Lesson 2: Challenge 5
      { challengeId: 5, correct: true, text: "9" },
      { challengeId: 5, correct: false, text: "5" },
      { challengeId: 5, correct: false, text: "3" },
      { challengeId: 5, correct: false, text: "1" },
      // Lesson 2: Challenge 6
      { challengeId: 6, correct: true, text: "Moves in an L-shape" },
      {
        challengeId: 6,
        correct: false,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 6,
        correct: false,
        text: "Moves one square in any direction",
      },
      {
        challengeId: 6,
        correct: false,
        text: "Moves one or two squares forward on its first move",
      },
    ])
    logger.debug("Inserted all challenge options")

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
