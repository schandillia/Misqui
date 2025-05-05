import { cache } from "react"
import { db } from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { courses } from "@/db/schema"
import { logger } from "@/lib/logger"

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany()
  return data
})

export const getCourseById = cache(async (courseId: number) => {
  logger.info("Fetching course by ID", { courseId })
  try {
    const data = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)],
          with: {
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order)],
            },
          },
        },
      },
    })
    if (!data) {
      logger.warn("Course not found", { courseId })
      return null
    }
    logger.info("Course fetched", { courseId, data })
    return data
  } catch (error) {
    logger.error("Error fetching course by ID", { courseId, error })
    throw error
  }
})

export async function getAllCourses() {
  logger.info("Fetching all courses")
  try {
    const allCourses = await db.query.courses.findMany({})
    logger.info("All courses fetched", { count: allCourses.length })
    return allCourses
  } catch (error) {
    logger.error("Error fetching all courses", { error })
    throw error
  }
}
