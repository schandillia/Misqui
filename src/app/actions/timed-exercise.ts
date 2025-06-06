"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getUserProgress } from "@/db/queries" // Assuming this fetches all necessary fields including points
import { markExerciseCompleteAndUpdateStreak } from "../../db/queries/user-progress"
import { exercises, userProgress, userTimedExerciseCompletions, lessons, challengeProgress } from "@/db/schema";
import { getOrCreateUserExerciseChallengeSubset } from "@/db/queries"; 
import { eq, and, gt, asc } from "drizzle-orm" // Added and, gt, asc for querying
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const awardTimedExerciseReward = async (
  exerciseId: number,
  scorePercentage: number
) => {
  const session = await auth()
  logger.info("Attempting to award timed exercise reward", {
    userId: session?.user?.id,
    exerciseId,
    scorePercentage,
  })

  if (!session?.user?.id) {
    logger.error("Unauthorized timed exercise reward attempt", {
      exerciseId,
      scorePercentage,
    })
    throw new Error("Unauthorized")
  }

  const currentUserProgress = await getUserProgress()

  if (!currentUserProgress) {
    logger.error("User progress not found for timed exercise reward", {
      userId: session.user.id,
      exerciseId,
    })
    throw new Error("User progress not found")
  }

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  })

  if (!exercise) {
    logger.error("Exercise not found for timed exercise reward", {
      exerciseId,
      userId: session.user.id,
    })
    throw new Error("Exercise not found")
  }

  if (exercise.isTimed) {
    if (scorePercentage === 100) {
      logger.info("Awarding points for 100% timed exercise", {
        userId: session.user.id,
        exerciseId,
        pointsToAdd: app.REWARD_POINTS_FOR_TIMED,
      })
      await db
        .update(userProgress)
        .set({
          points: currentUserProgress.points + app.REWARD_POINTS_FOR_TIMED,
        })
        .where(eq(userProgress.userId, session.user.id))

      revalidatePath("/learn")
      revalidatePath("/leaderboard")
      revalidatePath("/missions") // Added missions as it might be affected by points
      revalidatePath(`/exercise/${exerciseId}`) // Specific exercise path
      revalidatePath(`/lesson/${exercise.lessonId}`); // Revalidate specific lesson page

      logger.info(`TIMED_REWARD: Entered 100% completion block for exercise ${exerciseId}`, { userId: session.user.id });

      // Mark challenges as complete for the 100% timed exercise
      try {
        console.log(`[CONSOLE_LOG_DEBUG] Entered TRY block to mark challenges for exercise ${exerciseId}, user ${session.user.id}`);
        logger.info(`TIMED_REWARD: Attempting to get challenge subset for exercise ${exerciseId}, user ${session.user.id}`);
        const userChallengeSubsetIds = await getOrCreateUserExerciseChallengeSubset(session.user.id, exerciseId, false); // isPractice = false for main progression
        logger.info(`TIMED_REWARD: Got challenge subset for exercise ${exerciseId}: ${JSON.stringify(userChallengeSubsetIds)}`, { userId: session.user.id });

        if (userChallengeSubsetIds && userChallengeSubsetIds.length > 0) {
          logger.info(`TIMED_REWARD: Subset has ${userChallengeSubsetIds.length} challenges. Proceeding to mark complete.`, { userId: session.user.id, exerciseId });
          for (const challengeIdInSubset of userChallengeSubsetIds) {
            await db.insert(challengeProgress)
              .values({
                userId: session.user.id,
                challengeId: challengeIdInSubset,
                completed: true,
                updatedAt: new Date(), // Ensure updatedAt is also updated
              })
              .onConflictDoUpdate({
                target: [challengeProgress.userId, challengeProgress.challengeId],
                set: { completed: true, updatedAt: new Date() },
              });
          }
          logger.info(`Marked ${userChallengeSubsetIds.length} challenges complete in challengeProgress for timed exercise ${exerciseId} for user ${session.user.id}`);
        } else {
          logger.warn(`No challenge subset found or subset empty for timed exercise ${exerciseId} for user ${session.user.id} when trying to mark challenges complete. Subset: ${JSON.stringify(userChallengeSubsetIds)}`);
        }
      } catch (error) {
        console.error(`[CONSOLE_LOG_DEBUG] CAUGHT error while marking challenges for exercise ${exerciseId}, user ${session.user.id}:`, error);
        logger.error("Error marking challenges complete for timed exercise", { userId: session.user.id, exerciseId, error });
      }

      // Explicitly mark as complete for streak and unlock
      await markExerciseCompleteAndUpdateStreak(session.user.id, exerciseId, true)

      // Record the 100% completion in the new table
      try {
        await db
          .insert(userTimedExerciseCompletions)
          .values({
            userId: session.user.id,
            exerciseId: exerciseId,
            completedAt: new Date(), // Ensure completedAt is set
          })
          .onConflictDoNothing(); // If a record already exists, do nothing
        logger.info("Recorded 100% timed exercise completion", {
          userId: session.user.id,
          exerciseId,
        });
      } catch (error) {
        logger.error("Failed to record 100% timed exercise completion", {
          userId: session.user.id,
          exerciseId,
          error,
        });
        // Decide if this error should be propagated or just logged
      }

      logger.info("Timed exercise reward points updated, completion marked for streak/unlock, and 100% completion recorded", {
        userId: session.user.id,
        exerciseId,
      })
      // --- Start: Advance active exercise to next in lesson ---
      try {
        // Ensure exercise details are available (lessonId, order)
        // The 'exercise' object was fetched earlier in this function.
        if (exercise.lessonId !== null && exercise.order !== null) {
          const nextExerciseInLesson = await db.query.exercises.findFirst({
            where: and(
              eq(exercises.lessonId, exercise.lessonId),
              gt(exercises.order, exercise.order)
            ),
            orderBy: [asc(exercises.order)],
            columns: { id: true } // We only need the ID of the next exercise
          });

          if (nextExerciseInLesson) {
            await db.update(userProgress)
              .set({ activeExerciseId: nextExerciseInLesson.id }) // Assuming userProgress has activeExerciseId
              .where(eq(userProgress.userId, session.user.id));
            logger.info("Advanced activeExerciseId to next exercise in lesson", { 
              userId: session.user.id, 
              previousExerciseId: exerciseId,
              newActiveExerciseId: nextExerciseInLesson.id 
            });
            // Revalidate paths that show user progress or lesson structure
            revalidatePath("/learn"); 
          } else {
            logger.info("Completed exercise was the last in the lesson. No next exercise in this lesson to advance to.", { 
              userId: session.user.id, 
              exerciseId, 
              lessonId: exercise.lessonId 
            });
            // Current exercise is the last in its lesson. Try to advance to the next lesson.
            const currentLessonDetails = await db.query.lessons.findFirst({
              where: eq(lessons.id, exercise.lessonId!),
              columns: { id: true, courseId: true, order: true },
            });

            if (currentLessonDetails) {
              const nextLesson = await db.query.lessons.findFirst({
                where: and(
                  eq(lessons.courseId, currentLessonDetails.courseId),
                  gt(lessons.order, currentLessonDetails.order)
                ),
                orderBy: [asc(lessons.order)],
                columns: { id: true },
              });

              if (nextLesson) {
                const firstExerciseInNextLesson = await db.query.exercises.findFirst({
                  where: eq(exercises.lessonId, nextLesson.id),
                  orderBy: [asc(exercises.order)],
                  columns: { id: true },
                });

                if (firstExerciseInNextLesson) {
                  await db.update(userProgress)
                    .set({ activeExerciseId: firstExerciseInNextLesson.id })
                    .where(eq(userProgress.userId, session.user.id));
                  logger.info("Advanced activeExerciseId to first exercise of next lesson", {
                    userId: session.user.id,
                    previousExerciseId: exerciseId,
                    newActiveExerciseId: firstExerciseInNextLesson.id,
                    nextLessonId: nextLesson.id,
                  });
                  revalidatePath("/learn");
                } else {
                  // Next lesson exists but has no exercises, set activeExerciseId to null
                  await db.update(userProgress)
                    .set({ activeExerciseId: null })
                    .where(eq(userProgress.userId, session.user.id));
                  logger.warn("Next lesson found but has no exercises. Set activeExerciseId to null.", {
                    userId: session.user.id,
                    exerciseId,
                    lessonId: exercise.lessonId,
                    nextLessonId: nextLesson.id,
                  });
                  revalidatePath("/learn");
                }
              } else {
                // This was the last lesson in the course, set activeExerciseId to null
                await db.update(userProgress)
                  .set({ activeExerciseId: null })
                  .where(eq(userProgress.userId, session.user.id));
                logger.info("Completed exercise was in the last lesson of the course. Set activeExerciseId to null.", {
                  userId: session.user.id,
                  exerciseId,
                  lessonId: exercise.lessonId,
                });
                revalidatePath("/learn");
              }
            } else {
              logger.error("Could not find details for the current lesson to advance to the next lesson.", {
                userId: session.user.id,
                exerciseId,
                lessonId: exercise.lessonId,
              });
            }
          }
        } else {
          logger.warn("Cannot advance active exercise: current exercise details (lessonId or order) are missing.", {
            userId: session.user.id,
            exerciseId,
          });
        }
      } catch (advancementError) {
        logger.error("Error trying to advance active exercise", { 
          userId: session.user.id, 
          exerciseId, 
          error: advancementError 
        });
        // This error should not block the main reward, so just log it.
      }
      // --- End: Advance active exercise to next in lesson ---

      return { success: true, pointsAwarded: app.REWARD_POINTS_FOR_TIMED }
    } else {
      logger.info("No reward for timed exercise, score not 100%", {
        userId: session.user.id,
        exerciseId,
        scorePercentage,
      })
      // No points or gems are modified if score is less than 100%
      return { success: true, pointsAwarded: 0 }
    }
  } else {
    logger.warn("Attempted to award reward for non-timed exercise", {
      userId: session.user.id,
      exerciseId,
    })
    return { error: "not_timed_exercise", pointsAwarded: 0 }
  }
}
