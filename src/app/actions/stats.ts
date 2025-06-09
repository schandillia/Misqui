"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { stats } from "@/db/schema"
import { getSubjectById } from "@/db/queries"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

export const upsertStat = async (subjectId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const subject = await getSubjectById(subjectId)

  if (!subject) {
    throw new Error("Subject not found")
  }

  if (!subject.units.length || !subject.units[0].drills.length) {
    throw new Error("Subject has no drills")
  }

  const existingUserStats = await db.query.stats.findFirst({
    where: (stats, { eq }) => eq(stats.userId, session.user.id),
  })

  if (existingUserStats) {
    await db
      .update(stats)
      .set({
        activeSubjectId: subjectId,
        updatedAt: new Date(),
      })
      .where(eq(stats.userId, session.user.id))

    revalidatePath("/learn")
    revalidatePath("/courses")
    return { success: true }
  }

  await db.insert(stats).values({
    userId: session.user.id,
    activeSubjectId: subjectId,
  })

  revalidatePath("/learn")
  revalidatePath("/courses")
  return { success: true }
}
