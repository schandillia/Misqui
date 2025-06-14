// src/app/actions/update-birthdate.ts
"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define Zod schema for birthdate validation
const updateBirthdateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD")
  .refine(
    (val) => {
      const [year, month, day] = val.split("-").map(Number)
      const date = new Date(year, month - 1, day) // Month is 0-based in JS
      return (
        !isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) // Verify exact date match
    },
    { message: "Invalid date" }
  )
  .refine(
    (val) => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalize to start of day
      return date <= today // Ensure date is not in the future
    },
    { message: "Birthdate cannot be in the future" }
  )
  .refine(
    (val) => {
      const date = new Date(val)
      const minDate = new Date("1900-01-01")
      return date >= minDate // Ensure date is not before 1900
    },
    { message: "Birthdate cannot be before 1900" }
  )
  .transform((val) => {
    const [year, month, day] = val.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)) // Set as UTC, 00:00:00
    return date
  })

export async function updateBirthdate(formData: FormData) {
  try {
    const session = await auth()
    logger.info(
      `Session check: userId=${session?.user?.id}, sessionExists=${!!session}, sessionData=${JSON.stringify(session)}`
    )
    if (!session?.user?.id) {
      logger.error("Unauthorized: No valid session or user ID found")
      throw new Error("Unauthorized")
    }

    // Extract and validate birthdate
    const birthdate = formData.get("birthdate")?.toString()
    const validatedBirthdate = updateBirthdateSchema.parse(birthdate)
    await db
      .update(users)
      .set({ birthdate: validatedBirthdate, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    revalidatePath("/settings")
    logger.info(
      `User ${session.user.id} updated birthdate to ${validatedBirthdate.toISOString()}`
    )
    return {
      success: true,
      message: "Birthdate updated successfully",
      birthdate: validatedBirthdate.toISOString(),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(
        `User attempted invalid birthdate: ${formData.get("birthdate")}`
      )
      throw new Error(error.errors[0].message)
    }
    logger.error(`Failed to update birthdate: ${error}`)
    throw new Error("Failed to update birthdate")
  }
}
