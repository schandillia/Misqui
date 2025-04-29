"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { challengeProgress, challenges, userProgress } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"

export const upsertChallengeProgress = async (challengeId: number) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const currentUserProgress = await getUserProgress()
  const userSubscription = await getUserSubscription()

  if (!currentUserProgress) {
    throw new Error("User progress not found")
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  })

  if (!challenge) {
    throw new Error("Challenge not found")
  }

  const lessonId = challenge.lessonId

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, session.user.id),
      eq(challengeProgress.challengeId, challengeId)
    ),
  })

  const isPractice = !!existingChallengeProgress

  if (
    currentUserProgress.gems === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  ) {
    return { error: "gems" }
  }

  if (isPractice) {
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id))

    await db
      .update(userProgress)
      .set({
        gems: Math.min(currentUserProgress.gems + 1, app.GEMS_LIMIT),
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, session.user.id))

    revalidatePath("/learn")
    revalidatePath("/lesson")
    revalidatePath("/quest")
    revalidatePath("/leaderboard")
    revalidatePath(`/lesson/${lessonId}`)

    return
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId: session.user.id,
    completed: true,
  })

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
    })
    .where(eq(userProgress.userId, session.user.id))

  revalidatePath("/learn")
  revalidatePath("/lesson")
  revalidatePath("/quest")
  revalidatePath("/leaderboard")
  revalidatePath(`/lesson/${lessonId}`)
}
