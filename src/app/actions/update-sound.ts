"use server"

import { auth } from "@/auth"
import { updateUserSoundSetting } from "@/db/queries"

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
  } catch (_error) {
    throw new Error("Failed to update sound setting")
  }
}
