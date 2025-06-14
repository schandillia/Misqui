// File: app/server-actions/drill-completion.ts
"use server"
import { db } from "@/db/drizzle"
import { userDrillCompletion } from "@/db/schema"
import { logger } from "@/lib/logger"

type UpsertDrillCompletionResult = {
  currentDrillId: number | null
  questionsCompleted: number | null
}

// Universal server action to upsert user drill completion record
export const upsertUserDrillCompletion = async (
  userId: string,
  subjectId: number,
  drillId: number,
  questionCount: number
): Promise<UpsertDrillCompletionResult> => {
  try {
    // Upsert the record: update if exists, insert if not
    const result = await db
      .insert(userDrillCompletion)
      .values({
        userId,
        subjectId,
        currentDrillId: drillId,
        questionsCompleted: questionCount,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userDrillCompletion.userId, userDrillCompletion.subjectId],
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
        subjectId,
        drillId,
        questionCount,
      })
      throw new Error("Failed to upsert user drill completion")
    }

    logger.info("Upserted user drill completion record", {
      userId,
      subjectId,
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
      subjectId,
      drillId,
      questionCount,
      error,
    })
    throw new Error("Failed to upsert user drill completion")
  }
}
