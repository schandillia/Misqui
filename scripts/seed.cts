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

    // Clear existing data in correct order to respect foreign key constraints
    await Promise.all([
      db.delete(schema.questions), // Depends on drills
      db.delete(schema.drills), // Depends on units
      db.delete(schema.units), // Depends on subjects
      db.delete(schema.stats), // Depends on subjects
      db.delete(schema.subjects), // Base table
    ])
    logger.debug("Cleared existing data from relevant tables")

    // Insert subjects
    await db.insert(schema.subjects).values([
      {
        id: 1,
        title: "Chess",
        description: "Learn the basics of chess.",
        image: "/images/icons/chess-icon.svg",
      },
      {
        id: 2,
        title: "Sudoku",
        description: "Learn the basics of sudoku.",
        image: "/images/icons/sudoku-icon.svg",
      },
      {
        id: 3,
        title: "Math",
        description: "Learn the basics of math.",
        image: "/images/icons/math-icon.svg",
      },
    ])
    logger.debug("Inserted subjects")

    // Insert units
    await db.insert(schema.units).values([
      {
        id: 1,
        unit_number: 1,
        subjectId: 1, // Chess
        title: "Unit 1",
        description: "Learn the basics of Chess",
        order: 1,
        notes: `# Chess Fundamentals: Unit 1 - The Basics

## Introduction to Chess
Welcome to the exciting world of chess! This unit introduces you to the foundational elements of the game, including the board setup, piece movements, and basic terminology. Chess is a strategic game of skill and tactics, played on a 64-square board between two players.

### Key Concepts
- **The Chessboard**: A chessboard is an 8x8 grid, totaling 64 squares, alternating between light and dark colors.
- **Ranks and Files**: Ranks are horizontal rows (1 to 8), and files are vertical columns (a to h).
- **Diagonals**: Lines connecting squares diagonally, like a1 to h8, are crucial for pieces like the bishop.
- **Starting Position**: Each player begins with 16 pieces: 8 pawns, 2 rooks, 2 knights, 2 bishops, 1 queen, and 1 king.

## Piece Basics
### The Pieces and Their Roles
- **Pawn**: Moves forward one square, but on its first move, it can advance two squares. Captures diagonally.
- **Rook**: Moves any number of squares horizontally or vertically.
- **Knight**: Moves in an L-shape: two squares in one direction, then one square perpendicular.
- **Bishop**: Moves any number of squares diagonally.
- **Queen**: The most powerful piece, moving any number of squares in any direction (horizontal, vertical, or diagonal).
- **King**: Moves one square in any direction; must be protected to avoid checkmate.

### Why Learn This?
Understanding the board and pieces is essential to:
- Plan your moves strategically.
- Control key areas of the board, like the center (e4, e5, d4, d5).
- Set the stage for effective openings and defenses.
- Build confidence in your gameplay.

Master these basics to prepare for more advanced strategies in later units!`,
      },
      {
        id: 2,
        unit_number: 2,
        subjectId: 1, // Chess
        title: "Unit 2",
        description: "Explore intermediate chess concepts",
        order: 2,
        notes: `# Chess Fundamentals: Unit 2 - Intermediate Concepts

## Advancing Your Chess Skills
Welcome to Unit 2! This unit builds on the basics, introducing intermediate concepts to elevate your game. You'll explore key strategies, common tactics, and the importance of planning in chess.

### Key Concepts
- **Center Control**: Reinforce your control of central squares (e4, e5, d4, d5) to dominate the board.
- **Piece Development**: Get your knights and bishops active early to prepare for attacks or defenses.
- **King Safety**: Learn to castle—moving your king to safety and connecting your rooks.
- **Pawn Structure**: Understand pawn formations (e.g., chains, isolated pawns) and their impact on strategy.

## Basic Tactics
### Common Moves to Know
- **Fork**: One piece attacks two or more enemy pieces at once, often with a knight.
- **Pin**: A piece is trapped, unable to move without exposing a more valuable piece.
- **Skewer**: A valuable piece is attacked and must move, exposing a less valuable piece behind.
- **Discovered Attack**: Moving one piece reveals an attack from another piece.

### Why Learn This?
Mastering these concepts helps you:
- Gain a positional advantage over your opponent.
- Spot tactical opportunities to win material.
- Protect your king while setting up strong attacks.
- Plan several moves ahead with confidence.

Prepare for more complex strategies and deeper gameplay in this unit!`,
      },
      {
        id: 3,
        unit_number: 3,
        subjectId: 1, // Chess
        title: "Unit 3",
        description: "Master advanced chess strategies",
        order: 3,
        notes: `# Chess Fundamentals: Unit 3 - Advanced Strategies

## Elevating to Mastery
Welcome to Unit 3! This unit dives into advanced chess strategies, preparing you for competitive play. You'll learn complex tactics, endgame techniques, and long-term planning to outsmart your opponents.

### Key Concepts
- **Positional Play**: Control key squares and lines to limit your opponent's options.
- **Endgame Basics**: Master king and pawn endgames, learning to promote pawns and deliver checkmate.
- **Calculation**: Practice calculating multiple moves ahead to anticipate threats and opportunities.
- **Prophylaxis**: Prevent your opponent's plans while advancing your own strategy.

## Advanced Tactics
### Techniques to Master
- **Zwischenzug**: An intermediate move that disrupts your opponent's plan, often a check or capture.
- **Deflection**: Force an enemy piece away from a key square or defensive role.
- **Sacrifice**: Give up material (e.g., a pawn or piece) for a greater positional or tactical gain.
- **Checkmate Patterns**: Recognize patterns like the smothered mate or back-rank mate.

### Why Learn This?
These advanced strategies enable you:
- Outmaneuver opponents in complex positions.
- Turn losing games into draws or wins in the endgame.
- Calculate deeply to gain a decisive advantage.
- Prepare for competitive, high-level chess play.

Step up to master-level chess with these powerful strategies!`,
      },
    ])
    logger.debug("Inserted units")

    // Insert drills
    await db.insert(schema.drills).values([
      {
        id: 1,
        unitId: 1,
        order: 1,
        drill_number: 1,
        title: "Grid",
        isTimed: true,
      },
      {
        id: 2,
        unitId: 1,
        order: 2,
        drill_number: 2,
        title: "Pieces",
      },
      {
        id: 3,
        unitId: 1,
        order: 3,
        drill_number: 3,
        title: "Opening",
      },
      {
        id: 4,
        unitId: 1,
        order: 4,
        drill_number: 4,
        title: "Pawn",
      },
      {
        id: 5,
        unitId: 1,
        order: 5,
        drill_number: 5,
        title: "Rook",
      },
      {
        id: 6,
        unitId: 2,
        order: 1,
        drill_number: 1,
        title: "Tactics",
        isTimed: false,
      },
    ])
    logger.debug("Inserted drills")

    // Insert questions
    await db.insert(schema.questions).values([
      // Drill 1: Grid
      {
        id: 1,
        drillId: 1,
        text: "How many squares are there on a chess board?",
        option1: "64",
        option2: "54",
        option3: "72",
        option4: "36",
        correctOption: 1,
        explanation: "A chessboard is 8x8, totaling 64 squares.",
      },
      {
        id: 2,
        drillId: 1,
        text: "The pawn",
        option1:
          "Moves one or two squares forward on its first move, one square thereafter",
        option2: "Moves diagonally only",
        option3: "Moves in an L-shape",
        option4: "Moves any number of squares horizontally or vertically",
        correctOption: 1,
        explanation:
          "Pawns move forward one or two squares on their first move, then one square forward.",
      },
      {
        id: 3,
        drillId: 1,
        text: "Which of these is the bishop?",
        option1: "Moves diagonally any number of squares",
        option2: "Moves horizontally or vertically any number of squares",
        option3: "Moves in an L-shape",
        option4: "Moves any number of squares in any direction",
        correctOption: 1,
        explanation: "The bishop moves diagonally any number of squares.",
      },
      {
        id: 4,
        drillId: 1,
        text: "What is a rank on a chessboard?",
        option1: "A horizontal row on the chessboard",
        option2: "A vertical column on the chessboard",
        option3: "A diagonal line on the chessboard",
        option4: "The center of the chessboard",
        correctOption: 1,
        explanation:
          "A rank is a horizontal row, numbered 1 to 8 on a chessboard.",
      },
      {
        id: 5,
        drillId: 1,
        text: "What is a file on a chessboard?",
        option1: "A vertical column on the chessboard",
        option2: "A horizontal row on the chessboard",
        option3: "A diagonal line on the chessboard",
        option4: "The center of the chessboard",
        correctOption: 1,
        explanation:
          "A file is a vertical column, labeled a to h on a chessboard.",
      },
      {
        id: 6,
        drillId: 1,
        text: "What is a diagonal on a chessboard?",
        option1: "A line connecting squares diagonally",
        option2: "A horizontal row on the chessboard",
        option3: "A vertical column on the chessboard",
        option4: "The center of the chessboard",
        correctOption: 1,
        explanation:
          "A diagonal is a line connecting squares diagonally, e.g., a1 to h8.",
      },
      // Drill 2: Pieces
      {
        id: 7,
        drillId: 2,
        text: "What is the starting position of the king in a standard chess game?",
        option1: "e1 for White, e8 for Black",
        option2: "d1 for White, d8 for Black",
        option3: "f1 for White, f8 for Black",
        option4: "c1 for White, c8 for Black",
        correctOption: 1,
        explanation:
          "In a standard chess game, the king starts on e1 for White and e8 for Black.",
      },
      {
        id: 8,
        drillId: 2,
        text: "How many points is a queen worth in chess?",
        option1: "9",
        option2: "5",
        option3: "3",
        option4: "1",
        correctOption: 1,
        explanation: "The queen is conventionally valued at 9 points in chess.",
      },
      {
        id: 9,
        drillId: 2,
        text: "The knight",
        option1: "Moves in an L-shape",
        option2: "Moves diagonally any number of squares",
        option3: "Moves one square in any direction",
        option4: "Moves one or two squares forward on its first move",
        correctOption: 1,
        explanation:
          "The knight moves in an L-shape: two squares in one direction, then one square perpendicular.",
      },
      // Drill 3: Opening
      {
        id: 10,
        drillId: 3,
        text: "What is the most common first move in chess?",
        option1: "e4 (King's Pawn)",
        option2: "d4 (Queen's Pawn)",
        option3: "Nf3 (King's Knight)",
        option4: "c4 (English Opening)",
        correctOption: 1,
        explanation:
          "The most common first move in chess is e4, advancing the king's pawn two squares.",
      },
      {
        id: 11,
        drillId: 3,
        text: "What is the purpose of controlling the center in the opening?",
        option1: "It gives pieces more mobility and control over the board",
        option2: "It protects the king better",
        option3: "It allows for faster checkmate",
        option4: "It prevents pawn captures",
        correctOption: 1,
        explanation:
          "Controlling the center (e4, d4, e5, d5) enhances piece mobility and board control.",
      },
      // Drill 6: Tactics (Unit 2)
      {
        id: 12,
        drillId: 6,
        text: "What is a fork in chess?",
        option1: "One piece attacks two or more enemy pieces at once",
        option2: "A piece is trapped, unable to move without risk",
        option3: "A valuable piece is attacked, exposing another behind",
        option4: "Moving one piece reveals an attack from another",
        correctOption: 1,
        explanation:
          "A fork is when one piece attacks two or more enemy pieces simultaneously, often with a knight.",
      },
      {
        id: 13,
        drillId: 6,
        text: "What is the goal of a pin in chess?",
        option1:
          "To trap a piece, preventing movement without exposing a more valuable piece",
        option2: "To attack two pieces at once",
        option3: "To move the king to safety",
        option4: "To control the center of the board",
        correctOption: 1,
        explanation:
          "A pin traps a piece, making it risky to move as it exposes a more valuable piece behind.",
      },
    ])
    logger.debug("Inserted all questions")

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
