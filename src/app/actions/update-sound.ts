"use server"

import { auth } from "@/auth"
import { updateUserSoundSetting } from "@/db/queries/sound-settings"
import { logger } from "@/lib/logger"

interface SoundRequest {
  soundEnabled: boolean
}

export async function updateSound({ soundEnabled }: SoundRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (typeof soundEnabled !== "boolean") {
    throw new Error("Invalid sound setting")
  }

  try {
    await updateUserSoundSetting(session.user.id, soundEnabled)
    return { success: true }
  } catch (error) {
    logger.error("Failed to update sound setting", {
      error,
      userId: session.user.id,
    })
    throw new Error("Failed to update sound setting")
  }
}
