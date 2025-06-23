// src/actions/update-sound.ts
"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

interface SoundRequest {
  soundEnabled: boolean
}

export async function updateSound({ soundEnabled }: SoundRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for sound update", {
      module: "actions",
    })
    throw new Error("Unauthorized")
  }

  if (typeof soundEnabled !== "boolean") {
    logger.error("Invalid soundEnabled value", {
      soundEnabled,
      module: "actions",
    })
    throw new Error("Invalid sound setting")
  }

  try {
    await initializeDb()
    const result = await db.instance
      .update(users)
      .set({ soundEnabled, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    if (!result.rowCount) {
      logger.warn("No user found with ID for sound setting update", {
        userId: session.user.id,
        module: "actions",
      })
      throw new Error("User not found")
    }

    logger.info(
      `Updated soundEnabled for user: ${session.user.id} to ${soundEnabled}`,
      { module: "actions" }
    )

    // Revalidate relevant routes
    revalidatePath("/settings")
    revalidatePath("/drill")
  } catch (error) {
    logger.error("Failed to update sound setting", {
      error,
      userId: session.user.id,
      module: "actions",
    })
    throw new Error("Failed to update sound setting")
  }
}
