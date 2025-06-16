"use server"

import { courses } from "@/db/schema"
import { z } from "zod"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { courseSchema } from "@/lib/schemas/course"
import { NeonDbError } from "@neondatabase/serverless"
import { eq, desc } from "drizzle-orm"

// Define Course type based on schema
type Course = {
  id: number
  title: string
  description: string
  image: string
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
  }
}

// Fetch all courses from the database
export async function getCourses(): Promise<ActionResponse<Course[]>> {
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

    const allCourses = await db
      .select()
      .from(courses)
      .orderBy(desc(courses.updatedAt))
    return { success: true, data: allCourses }
  } catch (error) {
    console.error("Error fetching courses:", error)
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
    })

    const newCourse = await db
      .insert(courses)
      .values({
        title: data.title,
        description: data.description,
        image: data.image,
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
    console.error("Error creating course:", error)
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
    })

    const updatedCourse = await db
      .update(courses)
      .set({
        title: data.title,
        description: data.description,
        image: data.image,
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
    console.error("Error updating course:", error)
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

    await db.delete(courses).where(eq(courses.id, courseId))
    return { success: true, data: null }
  } catch (error) {
    console.error("Error deleting course:", error)
    return {
      success: false,
      error: { code: 500, message: "Failed to delete course" },
    }
  }
}
