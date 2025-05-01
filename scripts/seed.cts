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
      {
        id: 2,
        courseId: 1, // Chess
        title: "Unit 2",
        description: "Explore chess openings",
        order: 2,
      },
      {
        id: 3,
        courseId: 1, // Chess
        title: "Unit 3",
        description: "Master endgame techniques",
        order: 3,
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
      // New lessons for Unit 1
      {
        id: 6,
        unitId: 1,
        order: 6,
        title: "Knight",
      },
      {
        id: 7,
        unitId: 1,
        order: 7,
        title: "Bishop",
      },
      {
        id: 8,
        unitId: 1,
        order: 8,
        title: "Queen",
      },
      {
        id: 9,
        unitId: 1,
        order: 9,
        title: "King",
      },
      {
        id: 10,
        unitId: 1,
        order: 10,
        title: "Check",
      },
      {
        id: 11,
        unitId: 1,
        order: 11,
        title: "Checkmate",
      },
      {
        id: 12,
        unitId: 1,
        order: 12,
        title: "Stalemate",
      },
      {
        id: 13,
        unitId: 1,
        order: 13,
        title: "Castling",
      },
      {
        id: 14,
        unitId: 1,
        order: 14,
        title: "Basic Tactics",
      },
      // Lesson for Unit 2
      {
        id: 15,
        unitId: 2,
        order: 1,
        title: "Common Openings",
      },
      // Lesson for Unit 3
      {
        id: 16,
        unitId: 3,
        order: 1,
        title: "Endgame Basics",
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
      {
        id: 4,
        lessonId: 1,
        challengeType: "SELECT",
        order: 4,
        question: "Which piece moves in an L-shape?",
      },
      {
        id: 5,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 5,
        question: "The rook",
      },
      {
        id: 6,
        lessonId: 1,
        challengeType: "SELECT",
        order: 6,
        question: "How many pawns does each player start with?",
      },
      {
        id: 7,
        lessonId: 1,
        challengeType: "SELECT",
        order: 7,
        question: "Which piece starts next to the king?",
      },
      {
        id: 8,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 8,
        question: "The bishop",
      },
      {
        id: 9,
        lessonId: 1,
        challengeType: "SELECT",
        order: 9,
        question: "Which color moves first in chess?",
      },
      {
        id: 10,
        lessonId: 1,
        challengeType: "SELECT",
        order: 10,
        question: "How many pieces does each player start with?",
      },
      {
        id: 11,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 11,
        question: "The queen",
      },
      {
        id: 12,
        lessonId: 1,
        challengeType: "SELECT",
        order: 12,
        question: "Which of these pieces is the most powerful?",
      },
      {
        id: 13,
        lessonId: 1,
        challengeType: "SELECT",
        order: 13,
        question: "How many rooks does each player have?",
      },
      {
        id: 14,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 14,
        question: "The knight",
      },
      {
        id: 15,
        lessonId: 1,
        challengeType: "SELECT",
        order: 15,
        question: "Where does the queen start on the board?",
      },
      {
        id: 16,
        lessonId: 1,
        challengeType: "SELECT",
        order: 16,
        question: "What is castling?",
      },
      {
        id: 17,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 17,
        question: "The king",
      },
      {
        id: 18,
        lessonId: 1,
        challengeType: "SELECT",
        order: 18,
        question: "How does the bishop move?",
      },
      {
        id: 19,
        lessonId: 1,
        challengeType: "SELECT",
        order: 19,
        question: "Which piece can jump over others?",
      },
      {
        id: 20,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 20,
        question: "The chessboard",
      },
      {
        id: 21,
        lessonId: 1,
        challengeType: "SELECT",
        order: 21,
        question: "What is checkmate?",
      },
      {
        id: 22,
        lessonId: 1,
        challengeType: "SELECT",
        order: 22,
        question: "Which direction can a rook move?",
      },
      {
        id: 23,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 23,
        question: "The starting setup",
      },
      {
        id: 24,
        lessonId: 1,
        challengeType: "SELECT",
        order: 24,
        question: "Which piece cannot move backwards?",
      },
      {
        id: 25,
        lessonId: 1,
        challengeType: "SELECT",
        order: 25,
        question: "What happens when a pawn reaches the last rank?",
      },
      {
        id: 26,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 26,
        question: "The board layout",
      },
      {
        id: 27,
        lessonId: 1,
        challengeType: "SELECT",
        order: 27,
        question: "Which file does the king start on for white?",
      },
      {
        id: 28,
        lessonId: 1,
        challengeType: "SELECT",
        order: 28,
        question: "What color square is at the bottom-right of the board?",
      },
      {
        id: 29,
        lessonId: 1,
        challengeType: "ASSIST",
        order: 29,
        question: "The opening move",
      },
      {
        id: 30,
        lessonId: 1,
        challengeType: "SELECT",
        order: 30,
        question: "What is the term for a game ending in a draw?",
      },
    ])
    logger.debug("Inserted initial challenges")

    await db.insert(schema.challengeOptions).values([
      // Challenge 1: How many squares are there on a chess board?
      {
        challengeId: 1,
        correct: true,
        text: "64",
      },
      {
        challengeId: 1,
        correct: false,
        text: "54",
      },
      {
        challengeId: 1,
        correct: false,
        text: "72",
      },
      {
        challengeId: 1,
        correct: false,
        text: "36",
      },

      // Challenge 2: The pawn (ASSIST)
      {
        challengeId: 2,
        correct: true,
        text: "Moves one or two squares forward on its first move, one square thereafter",
      },
      {
        challengeId: 2,
        correct: false,
        text: "Moves diagonally only",
      },
      {
        challengeId: 2,
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 2,
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },

      // Challenge 3: Which-trade these is the bishop?
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

      // Challenge 4: Which piece moves in an L-shape?
      {
        challengeId: 4,
        correct: true,
        text: "Knight",
      },
      {
        challengeId: 4,
        correct: false,
        text: "Bishop",
      },
      {
        challengeId: 4,
        correct: false,
        text: "Rook",
      },
      {
        challengeId: 4,
        correct: false,
        text: "Pawn",
      },

      // Challenge 5: The rook (ASSIST)
      {
        challengeId: 5,
        correct: true,
        text: "Moves any number of squares horizontally or vertically",
      },
      {
        challengeId: 5,
        correct: false,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 5,
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 5,
        correct: false,
        text: "Moves any number of squares in any direction",
      },

      // Challenge 6: How many pawns does each player start with?
      {
        challengeId: 6,
        correct: true,
        text: "8",
      },
      {
        challengeId: 6,
        correct: false,
        text: "6",
      },
      {
        challengeId: 6,
        correct: false,
        text: "4",
      },
      {
        challengeId: 6,
        correct: false,
        text: "10",
      },

      // Challenge 7: Which piece starts next to the king?
      {
        challengeId: 7,
        correct: true,
        text: "Queen",
      },
      {
        challengeId: 7,
        correct: false,
        text: "Bishop",
      },
      {
        challengeId: 7,
        correct: false,
        text: "Knight",
      },
      {
        challengeId: 7,
        correct: false,
        text: "Rook",
      },

      // Challenge 8: The bishop (ASSIST)
      {
        challengeId: 8,
        correct: true,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 8,
        correct: false,
        text: "Moves horizontally or vertically any number of squares",
      },
      {
        challengeId: 8,
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 8,
        correct: false,
        text: "Moves any number of squares in any direction",
      },

      // Challenge 9: Which color moves first in chess?
      {
        challengeId: 9,
        correct: true,
        text: "White",
      },
      {
        challengeId: 9,
        correct: false,
        text: "Black",
      },
      {
        challengeId: 9,
        correct: false,
        text: "Either",
      },
      {
        challengeId: 9,
        correct: false,
        text: "Neither",
      },

      // Challenge 10: How many pieces does each player start with?
      {
        challengeId: 10,
        correct: true,
        text: "16",
      },
      {
        challengeId: 10,
        correct: false,
        text: "12",
      },
      {
        challengeId: 10,
        correct: false,
        text: "20",
      },
      {
        challengeId: 10,
        correct: false,
        text: "8",
      },

      // Challenge 11: The queen (ASSIST)
      {
        challengeId: 11,
        correct: true,
        text: "Moves any number of squares in any direction",
      },
      {
        challengeId: 11,
        correct: false,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 11,
        correct: false,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 11,
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },

      // Challenge 12: Which of these pieces is the most powerful?
      {
        challengeId: 12,
        correct: true,
        text: "Queen",
      },
      {
        challengeId: 12,
        correct: false,
        text: "King",
      },
      {
        challengeId: 12,
        correct: false,
        text: "Rook",
      },
      {
        challengeId: 12,
        correct: false,
        text: "Pawn",
      },

      // Challenge 13: How many rooks does each player have?
      {
        challengeId: 13,
        correct: true,
        text: "2",
      },
      {
        challengeId: 13,
        correct: false,
        text: "1",
      },
      {
        challengeId: 13,
        correct: false,
        text: "3",
      },
      {
        challengeId: 13,
        correct: false,
        text: "4",
      },

      // Challenge 14: The knight (ASSIST)
      {
        challengeId: 14,
        correct: true,
        text: "Moves in an L-shape",
      },
      {
        challengeId: 14,
        correct: false,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 14,
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },
      {
        challengeId: 14,
        correct: false,
        text: "Moves any number of squares in any direction",
      },

      // Challenge 15: Where does the queen start on the board?
      {
        challengeId: 15,
        correct: true,
        text: "d1 for White, d8 for Black",
      },
      {
        challengeId: 15,
        correct: false,
        text: "e1 for White, e8 for Black",
      },
      {
        challengeId: 15,
        correct: false,
        text: "c1 for White, c8 for Black",
      },
      {
        challengeId: 15,
        correct: false,
        text: "f1 for White, f8 for Black",
      },

      // Challenge 16: What is castling?
      {
        challengeId: 16,
        correct: true,
        text: "A special move involving the king and a rook",
      },
      {
        challengeId: 16,
        correct: false,
        text: "A move where the queen captures a pawn",
      },
      {
        challengeId: 16,
        correct: false,
        text: "A move where the knight jumps over another piece",
      },
      {
        challengeId: 16,
        correct: false,
        text: "A move where the pawn moves two squares",
      },

      // Challenge 17: The king (ASSIST)
      {
        challengeId: 17,
        correct: true,
        text: "Moves one square in any direction",
      },
      {
        challengeId: 17,
        correct: false,
        text: "Moves any number of squares in any direction",
      },
      {
        challengeId: 17,
        correct: false,
        text: "Moves diagonally any number of squares",
      },
      {
        challengeId: 17,
        correct: false,
        text: "Moves any number of squares horizontally or vertically",
      },

      // Challenge 18: How does the bishop move?
      {
        challengeId: 18,
        correct: true,
        text: "Diagonally any number of squares",
      },
      {
        challengeId: 18,
        correct: false,
        text: "Horizontally or vertically any number of squares",
      },
      {
        challengeId: 18,
        correct: false,
        text: "In an L-shape",
      },
      {
        challengeId: 18,
        correct: false,
        text: "Any number of squares in any direction",
      },

      // Challenge 19: Which piece can jump over others?
      {
        challengeId: 19,
        correct: true,
        text: "Knight",
      },
      {
        challengeId: 19,
        correct: false,
        text: "Bishop",
      },
      {
        challengeId: 19,
        correct: false,
        text: "Rook",
      },
      {
        challengeId: 19,
        correct: false,
        text: "Queen",
      },

      // Challenge 20: The chessboard (ASSIST)
      {
        challengeId: 20,
        correct: true,
        text: "An 8x8 grid with alternating light and dark squares",
      },
      {
        challengeId: 20,
        correct: false,
        text: "A 6x6 grid with all dark squares",
      },
      {
        challengeId: 20,
        correct: false,
        text: "A 10x10 grid with alternating colors",
      },
      {
        challengeId: 20,
        correct: false,
        text: "An 8x8 grid with all light squares",
      },

      // Challenge 21: What is checkmate?
      {
        challengeId: 21,
        correct: true,
        text: "When the king is in check and cannot escape",
      },
      {
        challengeId: 21,
        correct: false,
        text: "When the queen captures the king",
      },
      {
        challengeId: 21,
        correct: false,
        text: "When a pawn reaches the last rank",
      },
      {
        challengeId: 21,
        correct: false,
        text: "When both players agree to a draw",
      },

      // Challenge 22: Which direction can a rook move?
      {
        challengeId: 22,
        correct: true,
        text: "Horizontally or vertically",
      },
      {
        challengeId: 22,
        correct: false,
        text: "Diagonally",
      },
      {
        challengeId: 22,
        correct: false,
        text: "In an L-shape",
      },
      {
        challengeId: 22,
        correct: false,
        text: "In any direction",
      },

      // Challenge 23: The starting setup (ASSIST)
      {
        challengeId: 23,
        correct: true,
        text: "Pawns on the second rank, other pieces on the first rank",
      },
      {
        challengeId: 23,
        correct: false,
        text: "Pawns on the first rank, other pieces on the second rank",
      },
      {
        challengeId: 23,
        correct: false,
        text: "All pieces on the first rank",
      },
      {
        challengeId: 23,
        correct: false,
        text: "Pawns on the third rank, other pieces on the first rank",
      },

      // Challenge 24: Which piece cannot move backwards?
      {
        challengeId: 24,
        correct: true,
        text: "Pawn",
      },
      {
        challengeId: 24,
        correct: false,
        text: "Knight",
      },
      {
        challengeId: 24,
        correct: false,
        text: "Bishop",
      },
      {
        challengeId: 24,
        correct: false,
        text: "Rook",
      },

      // Challenge 25: What happens when a pawn reaches the last rank?
      {
        challengeId: 25,
        correct: true,
        text: "It can be promoted to a queen, rook, bishop, or knight",
      },
      {
        challengeId: 25,
        correct: false,
        text: "It becomes a king",
      },
      {
        challengeId: 25,
        correct: false,
        text: "It is removed from the board",
      },
      {
        challengeId: 25,
        correct: false,
        text: "It moves back to the second rank",
      },

      // Challenge 26: The board layout (ASSIST)
      {
        challengeId: 26,
        correct: true,
        text: "8 ranks and 8 files with alternating colors",
      },
      {
        challengeId: 26,
        correct: false,
        text: "6 ranks and 6 files with all light squares",
      },
      {
        challengeId: 26,
        correct: false,
        text: "10 ranks and 10 files with alternating colors",
      },
      {
        challengeId: 26,
        correct: false,
        text: "8 ranks and 8 files with all dark squares",
      },

      // Challenge 27: Which file does the king start on for white?
      {
        challengeId: 27,
        correct: true,
        text: "e-file",
      },
      {
        challengeId: 27,
        correct: false,
        text: "d-file",
      },
      {
        challengeId: 27,
        correct: false,
        text: "f-file",
      },
      {
        challengeId: 27,
        correct: false,
        text: "c-file",
      },

      // Challenge 28: What color square is at the bottom-right of the board?
      {
        challengeId: 28,
        correct: true,
        text: "Light",
      },
      {
        challengeId: 28,
        correct: false,
        text: "Dark",
      },
      {
        challengeId: 28,
        correct: false,
        text: "Red",
      },
      {
        challengeId: 28,
        correct: false,
        text: "Blue",
      },

      // Challenge 29: The opening move (ASSIST)
      {
        challengeId: 29,
        correct: true,
        text: "White moves first, often advancing a pawn or knight",
      },
      {
        challengeId: 29,
        correct: false,
        text: "Black moves first, often advancing a rook",
      },
      {
        challengeId: 29,
        correct: false,
        text: "Either player moves a king first",
      },
      {
        challengeId: 29,
        correct: false,
        text: "Both players move simultaneously",
      },

      // Challenge 30: What is the term for a game ending in a draw?
      {
        challengeId: 30,
        correct: true,
        text: "Stalemate",
      },
      {
        challengeId: 30,
        correct: false,
        text: "Checkmate",
      },
      {
        challengeId: 30,
        correct: false,
        text: "Castling",
      },
      {
        challengeId: 30,
        correct: false,
        text: "Promotion",
      },
    ])
    logger.debug("Inserted challenge options for all challenges")

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
