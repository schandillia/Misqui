// app/server-actions/drill-completion.ts
"use server"
import { db, initializeDb } from "@/db/drizzle"
import { userDrillCompletion } from "@/db/schema"
import { logger } from "@/lib/logger"

type UpsertDrillCompletionResult = {
  currentDrillId: number | null
  questionsCompleted: number | null
}

// Universal server action to upsert user drill completion record
export const upsertUserDrillCompletion = async (
  userId: string,
  courseId: number,
  drillId: number,
  questionCount: number
): Promise<UpsertDrillCompletionResult> => {
  await initializeDb()
  try {
    // Upsert the record: update if exists, insert if not
    const result = await db.instance
      .insert(userDrillCompletion)
      .values({
        userId,
        courseId,
        currentDrillId: drillId,
        questionsCompleted: questionCount,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userDrillCompletion.userId, userDrillCompletion.courseId],
        set: {
          currentDrillId: drillId,
          questionsCompleted: questionCount,
          updatedAt: new Date(),
        },
      })
      .returning({
        currentDrillId: userDrillCompletion.currentDrillId,
        questionsCompleted: userDrillCompletion.questionsCompleted,
      })

    if (!result.length) {
      logger.warn("No record created or updated for user drill completion", {
        userId,
        courseId,
        drillId,
        questionCount,
      })
      throw new Error("Failed to upsert user drill completion")
    }

    logger.info("Upserted user drill completion record", {
      userId,
      courseId,
      drillId,
      questionCount,
    })
    return {
      currentDrillId: result[0].currentDrillId,
      questionsCompleted: result[0].questionsCompleted,
    }
  } catch (error) {
    logger.error("Error upserting user drill completion", {
      userId,
      courseId,
      drillId,
      questionCount,
      error,
    })
    throw new Error("Failed to upsert user drill completion")
  }
}
