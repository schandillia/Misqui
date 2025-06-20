import { cache } from "react"
import { db, initializeDb } from "@/db/drizzle"
import { questions } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { logger } from "@/lib/logger"

// Fetch random questions for a drill based on drill type and completion status
export const getDrillQuestions = cache(
  async (
    drillId: number,
    isTimed: boolean,
    isCurrentDrill: boolean,
    questionsCompleted: number | null,
    questionsPerDrill: number
  ) => {
    await initializeDb()
    logger.info("Fetching questions for drill", {
      drillId,
      isTimed,
      isCurrentDrill,
      questionsCompleted,
      module: "question-queries",
    })
    try {
      // Determine number of questions to fetch
      const limit =
        isTimed || !isCurrentDrill
          ? questionsPerDrill
          : Math.max(0, questionsPerDrill - (questionsCompleted || 0))

      if (limit === 0) {
        logger.info("No questions to fetch for drill", {
          drillId,
          limit,
          module: "question-queries",
        })
        return []
      }

      // Fetch random questions for the drill
      const data = await db.instance
        .select({
          id: questions.id,
          text: questions.text,
          option1: questions.option1,
          option2: questions.option2,
          option3: questions.option3,
          option4: questions.option4,
          correctOption: questions.correctOption,
          explanation: questions.explanation,
        })
        .from(questions)
        .where(eq(questions.drillId, drillId))
        .orderBy(sql`RANDOM()`)
        .limit(limit)

      logger.info("Questions fetched for drill", {
        drillId,
        count: data.length,
        module: "question-queries",
      })
      return data
    } catch (error) {
      logger.error("Error fetching questions for drill", {
        drillId,
        error,
        module: "question-queries",
      })
      throw error
    }
  }
)
