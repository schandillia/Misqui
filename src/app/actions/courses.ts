"use server"

import { courses, units } from "@/db/schema"
import { z } from "zod"
import { db, initializeDb } from "@/db/drizzle"
import { auth } from "@/auth"
import { courseSchema } from "@/lib/schemas/course"
import { NeonDbError } from "@neondatabase/serverless"
import { eq, desc } from "drizzle-orm"
import { logger } from "@/lib/logger"

// Define Course type based on schema
type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
}

// Define a type for the response
type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
    details?: string
  }
}

// Fetch all courses with their units from the database
export async function getCoursesWithUnits(): Promise<ActionResponse<Course[]>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    // Fetch all course fields
    const allCourses = await db.instance
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        image: courses.image,
        badge: courses.badge,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .orderBy(desc(courses.id))

    // Fetch selected unit fields
    const allUnits = await db.instance
      .select({
        id: units.id,
        title: units.title,
        description: units.description,
        courseId: units.courseId,
        unitNumber: units.unitNumber,
        order: units.order,
      })
      .from(units)
      .orderBy(desc(units.order))

    // Map units to their respective courses
    const coursesWithUnits: Course[] = allCourses.map((course) => ({
      ...course,
      units: allUnits
        .filter((unit) => unit.courseId === course.id)
        .map((unit) => ({
          id: unit.id,
          title: unit.title,
          description: unit.description,
          courseId: unit.courseId,
          unitNumber: unit.unitNumber,
          order: unit.order,
        })),
    }))

    return { success: true, data: coursesWithUnits }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error("Error fetching courses with units", {
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: "Failed to fetch courses and units",
        details: errorStack,
      },
    }
  }
}

// Fetch all courses from the database
export async function getCourses(): Promise<ActionResponse<Course[]>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    const allCourses = await db.instance
      .select()
      .from(courses)
      .orderBy(desc(courses.id))
    return { success: true, data: allCourses }
  } catch (error) {
    logger.error("Error fetching courses", { error })
    return {
      success: false,
      error: { code: 500, message: "Failed to fetch courses" },
    }
  }
}

// Create a new course
export async function createCourse(
  formData: FormData
): Promise<ActionResponse<Course>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    const data = courseSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      image: formData.get("image"),
      badge: formData.get("badge"),
    })

    const newCourse = await db.instance
      .insert(courses)
      .values({
        title: data.title,
        description: data.description,
        image: data.image,
        badge: data.badge,
      })
      .returning()

    return { success: true, data: newCourse[0] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: { code: 400, message: JSON.stringify(error.errors) },
      }
    }
    if (error instanceof NeonDbError && error.code === "23505") {
      return {
        success: false,
        error: {
          code: 409,
          message: "A course with this ID already exists",
        },
      }
    }
    logger.error("Error creating course", { error })
    return {
      success: false,
      error: { code: 500, message: "Failed to create course" },
    }
  }
}

// Update a course
export async function updateCourse(
  courseId: number,
  formData: FormData
): Promise<ActionResponse<Course>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    const data = courseSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      image: formData.get("image"),
      badge: formData.get("badge"),
    })

    const updatedCourse = await db.instance
      .update(courses)
      .set({
        title: data.title,
        description: data.description,
        image: data.image,
        badge: data.badge,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning()

    if (updatedCourse.length === 0) {
      return {
        success: false,
        error: { code: 404, message: "Course not found" },
      }
    }

    return { success: true, data: updatedCourse[0] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: { code: 400, message: JSON.stringify(error.errors) },
      }
    }
    logger.error("Error updating course", { error })
    return {
      success: false,
      error: { code: 500, message: "Failed to update course" },
    }
  }
}

// Delete a course
export async function deleteCourse(
  courseId: number
): Promise<ActionResponse<null>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    await db.instance.delete(courses).where(eq(courses.id, courseId))
    return { success: true, data: null }
  } catch (error) {
    logger.error("Error deleting course", { error })
    return {
      success: false,
      error: { code: 500, message: "Failed to delete course" },
    }
  }
}
