"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { nameSchema } from "@/lib/schemas/name"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function updateUserName(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Extract and validate name
  const name = formData.get("name")?.toString()
  try {
    const validatedName = nameSchema.parse(name)
    await db
      .update(users)
      .set({ name: validatedName, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    revalidatePath("/settings")
    logger.info(`User ${session.user.id} updated name to ${validatedName}`)
    return {
      success: true,
      message: "Name updated successfully",
      name: validatedName,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`User ${session.user.id} attempted invalid name: ${name}`)
      throw new Error(error.errors[0].message)
    }
    logger.error(`Failed to update user name for ${session.user.id}: ${error}`)
    throw new Error("Failed to update name")
  }
}
