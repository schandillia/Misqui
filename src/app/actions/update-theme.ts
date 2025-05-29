"use server"

import { auth } from "@/auth"
import { updateUserTheme } from "@/db/queries"
import { themeEnum } from "@/db/schema"

interface ThemeRequest {
  theme: (typeof themeEnum.enumValues)[number]
}

export async function updateThemeAction({ theme }: ThemeRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!themeEnum.enumValues.includes(theme)) {
    throw new Error("Invalid theme")
  }

  try {
    await updateUserTheme(session.user.id, theme)
    return { success: true }
  } catch (error) {
    throw new Error("Failed to update theme")
  }
}
