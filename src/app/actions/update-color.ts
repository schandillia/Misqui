"use server"

import { auth } from "@/auth"
import { updateUserColor } from "@/db/queries"
import { brandColorEnum } from "@/db/schema"

interface ColorRequest {
  brandColor: (typeof brandColorEnum.enumValues)[number]
}

export async function updateColor({ brandColor }: ColorRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!brandColorEnum.enumValues.includes(brandColor)) {
    throw new Error("Invalid brand color")
  }

  try {
    await updateUserColor(session.user.id, brandColor)
    return { success: true }
  } catch (_error) {
    throw new Error("Failed to update brand color")
  }
}
