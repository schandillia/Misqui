// src/app/actions/update-birthdate.ts
"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { birthdateSchema } from "@/lib/schemas/birthdate"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

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
    const validatedBirthdate = birthdateSchema.parse(birthdate)
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
