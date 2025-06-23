"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { userDrillCompletion, stats } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"

export const deleteUserDrillCompletion = async (courseId: number) => {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt in deleteUserDrillCompletion")
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  try {
    logger.info("deleteUserDrillCompletion called:", {
      userId,
      courseId,
    })

    // Delete user_drill_completion record for specific course
    const deleteResult = await db.instance
      .delete(userDrillCompletion)
      .where(
        and(
          eq(userDrillCompletion.userId, userId),
          eq(userDrillCompletion.courseId, courseId)
        )
      )
      .returning({ deletedUserId: userDrillCompletion.userId })

    logger.info(`Deleted user_drill_completion record:`, {
      userId,
      courseId,
      rowCount: deleteResult.length,
      deletedUserId: deleteResult[0]?.deletedUserId,
      module: "courses",
    })

    // Update stats table to set activeCourseId to null
    const updateStatsResult = await db.instance
      .update(stats)
      .set({
        activeCourseId: null,
        updatedAt: new Date(),
      })
      .where(eq(stats.userId, userId))
      .returning({ updatedUserId: stats.userId })

    logger.info(
      `Updated stats to set active_course_id to null for user: ${userId}`,
      {
        userId: updateStatsResult[0]?.updatedUserId,
        rowCount: updateStatsResult.length,
        module: "courses",
      }
    )

    revalidatePath("/learn")
    revalidatePath("/courses")

    logger.info(`Completed reset for user: ${userId}, course: ${courseId}`, {
      module: "courses",
    })

    return { success: true }
  } catch (error: unknown) {
    logger.error(
      `Failed to reset user_drill_completion for user: ${userId}, course: ${courseId}`,
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        module: "courses",
      }
    )
    throw new Error(
      `Failed to reset course progress: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
