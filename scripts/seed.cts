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
        id: 4,
        lessonId: 1,
        challengeType: "SELECT",
        order: 4,
        question:
          "What is the starting position of the king in a standard chess game?",
      },
      {
        id: 5,
        lessonId: 1,
        challengeType: "SELECT",
        order: 5,
        question: "How many points is a queen worth in chess?",
      },
      {
        id: 6,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 6,
        question: "The knight",
      },
      {
        id: 7,
        lessonId: 1,
        challengeType: "SELECT",
        order: 7,
        question:
          "Which move allows a pawn to capture an opponent's pawn that has just advanced two squares?",
      },
      {
        id: 8,
        lessonId: 1,
        challengeType: "SELECT",
        order: 8,
        question: "Who was the world chess champion from 1972 to 1975?",
      },
      {
        id: 9,
        lessonId: 1,
        challengeType: "SELECT",
        order: 9,
        question:
          "What is the term for a situation where a player cannot make any legal moves and the game ends in a draw?",
      },
      {
        id: 10,
        lessonId: 1,
        challengeType: "SELECT",
        order: 10,
        question: "How many rooks does each player start with in a chess game?",
      },
    ])
    // Insert challenge options
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
      {
        challengeId: 2,
        image: "/pawn.svg",
        audio: "/pawn.mp3",
        correct: true,
        text: "Moves one or two squares forward on its first move, one square thereafter",
      },
      {
        challengeId: 2,
        image: "/pawn.svg",
        audio: "/pawn.mp3",
        correct: false,
        text: "Moves diagonally only",
      },
      {
        challengeId: 2,
        image: "/pawn.svg",
        audio: "/pawn.mp3",
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 2,
        image: "/pawn.svg",
        audio: "/pawn.mp3",
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },
      {
        challengeId: 3,
        image: "/bishop.svg",
        audio: "/bishop.mp3",
        correct: true,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 3,
        image: "/rook.svg",
        audio: "/rook.mp3",
        correct: false,
        text: "Moves horizontally or vertically any number of squares",
      },
      {
        challengeId: 3,
        image: "/knight.svg",
        audio: "/knight.mp3",
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 3,
        image: "/queen.svg",
        audio: "/queen.mp3",
        correct: false,
        text: "Moves any number of squares in any direction",
      },
      {
        challengeId: 4,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: true,
        text: "e1 for White, e8 for Black",
      },
      {
        challengeId: 4,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "d1 for White, d8 for Black",
      },
      {
        challengeId: 4,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "f1 for White, f8 for Black",
      },
      {
        challengeId: 4,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "c1 for White, c8 for Black",
      },
      {
        challengeId: 5,
        image: "/queen.svg",
        audio: "/queen.mp3",
        correct: true,
        text: "9",
      },
      {
        challengeId: 5,
        image: "/queen.svg",
        audio: "/queen.mp3",
        correct: false,
        text: "5",
      },
      {
        challengeId: 5,
        image: "/queen.svg",
        audio: "/queen.mp3",
        correct: false,
        text: "3",
      },
      {
        challengeId: 5,
        image: "/queen.svg",
        audio: "/queen.mp3",
        correct: false,
        text: "7",
      },
      {
        challengeId: 6,
        image: "/knight.svg",
        audio: "/knight.mp3",
        correct: true,
        text: "Moves in an L-shape, two squares in one direction and one perpendicular",
      },
      {
        challengeId: 6,
        image: "/knight.svg",
        audio: "/knight.mp3",
        correct: false,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 6,
        image: "/knight.svg",
        audio: "/knight.mp3",
        correct: false,
        text: "Moves one square in any direction",
      },
      {
        challengeId: 6,
        image: "/knight.svg",
        audio: "/knight.mp3",
        correct: false,
        text: "Moves any number of squares vertically",
      },
      {
        challengeId: 7,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: true,
        text: "En passant",
      },
      {
        challengeId: 7,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "Castling",
      },
      {
        challengeId: 7,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "Promotion",
      },
      {
        challengeId: 7,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "Checkmate",
      },
      {
        challengeId: 8,
        image: "/history.svg",
        audio: "/history.mp3",
        correct: true,
        text: "Bobby Fischer",
      },
      {
        challengeId: 8,
        image: "/history.svg",
        audio: "/history.mp3",
        correct: false,
        text: "Garry Kasparov",
      },
      {
        challengeId: 8,
        image: "/history.svg",
        audio: "/history.mp3",
        correct: false,
        text: "Magnus Carlsen",
      },
      {
        challengeId: 8,
        image: "/history.svg",
        audio: "/history.mp3",
        correct: false,
        text: "Anatoly Karpov",
      },
      {
        challengeId: 9,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: true,
        text: "Stalemate",
      },
      {
        challengeId: 9,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "Checkmate",
      },
      {
        challengeId: 9,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "Draw by repetition",
      },
      {
        challengeId: 9,
        image: "/board.svg",
        audio: "/board.mp3",
        correct: false,
        text: "Resignation",
      },
      {
        challengeId: 10,
        image: "/rook.svg",
        audio: "/rook.mp3",
        correct: true,
        text: "2",
      },
      {
        challengeId: 10,
        image: "/rook.svg",
        audio: "/rook.mp3",
        correct: false,
        text: "1",
      },
      {
        challengeId: 10,
        image: "/rook.svg",
        audio: "/rook.mp3",
        correct: false,
        text: "3",
      },
      {
        challengeId: 10,
        image: "/rook.svg",
        audio: "/rook.mp3",
        correct: false,
        text: "4",
      },
    ])

    console.log("Seeding finished.")
  } catch (error) {
    console.error(error)
    throw new Error("Seeding failed")
  }
}

main()
