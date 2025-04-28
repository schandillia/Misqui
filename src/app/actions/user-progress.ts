"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getCourseById, getUserProgress } from "@/db/queries"
import { challengeProgress, challenges, userProgress } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const POINTS_TO_REFILL = 10

export const upsertUserProgress = async (courseId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const course = await getCourseById(courseId)

  if (!course) {
    throw new Error("Course not found")
  }

  //   TODO: Enable this when we have units and lessons
  //   if(!course.units.length || !course.units[0].lessons.length) {
  //     throw new Error("Course has no lessons")
  //   }

  const existingUserProgress = await getUserProgress()

  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
    })

    revalidatePath("/learn")
    revalidatePath("/courses")
    return { success: true }
  }

  await db.insert(userProgress).values({
    userId: session.user.id,
    activeCourseId: courseId,
  })

  revalidatePath("/learn")
  revalidatePath("/courses")
  return { success: true }
}

export const reduceGems = async (challengeId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const currentUserProgress = await getUserProgress()

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  })

  if (!challenge) throw new Error("Challenge not found")

  const lessonId = challenge.lessonId

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, session.user.id),
      eq(challengeProgress.challengeId, challengeId)
    ),
  })

  const isPractice = !!existingChallengeProgress

  if (isPractice) return { error: "practice" }
  if (!currentUserProgress) throw new Error("User progress not found")
  if (currentUserProgress.gems == 0) return { error: "gems" }

  await db
    .update(userProgress)
    .set({
      gems: Math.max(currentUserProgress.gems - 1, 0),
    })
    .where(eq(userProgress.userId, session.user.id))

  revalidatePath("/store")
  revalidatePath("/learn")
  revalidatePath("/quests")
  revalidatePath("/leaderboard")
  revalidatePath(`/lesson/${lessonId}`)
}

export const refillGems = async () => {
  const currentUserProgress = await getUserProgress()

  if (!currentUserProgress) throw new Error("User progress not found")

  if (currentUserProgress.gems === 5) throw new Error("Gems are already full")

  if (currentUserProgress.points < POINTS_TO_REFILL)
    throw new Error("Not enough points")

  await db
    .update(userProgress)
    .set({
      gems: 5,
      points: currentUserProgress.points - POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, currentUserProgress.userId))

  revalidatePath("/store")
  revalidatePath("/learn")
  revalidatePath("/quests")
  revalidatePath("/leaderboard")
}
