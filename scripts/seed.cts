import fs from "fs"
import path from "path"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "../src/db/schema"

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
    console.log("Seeding database...")

    await db.delete(schema.courses)
    await db.delete(schema.userProgress)
    await db.delete(schema.units)
    await db.delete(schema.lessons)
    await db.delete(schema.challenges)
    await db.delete(schema.challengeProgress)
    await db.delete(schema.challengeOptions)

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Chess",
        description: "Learn the basics of chess.",
        image: "/chess-icon.svg",
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

    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1,
        title: "Unit 1",
        description: "Learn the basics of chess",
        order: 1,
      },
    ])

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
        title: "Pawn",
      },
      {
        id: 4,
        unitId: 1,
        order: 4,
        title: "Rook",
      },
      {
        id: 5,
        unitId: 1,
        order: 5,
        title: "Bishop",
      },
    ])

    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        challengeType: "SELECT",
        order: 1,
        question: "How many boxes are there on a chess board?",
      },
    ])
    await db.insert(schema.challengeOptions).values([
      {
        id: 1,
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: true,
        text: "64",
      },
      {
        id: 2,
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "54",
      },
      {
        id: 3,
        challengeId: 1,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "72",
      },
    ])

    console.log("Seeding finished.")
  } catch (error) {
    console.error(error)
    throw new Error("Seeding failed")
  }
}

main()
