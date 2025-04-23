"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getCourseById, getUserProgress } from "@/db/queries"
import { userProgress } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
