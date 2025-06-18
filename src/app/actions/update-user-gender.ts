"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users } from "@/db/schema"
import { genderEnum } from "@/db/schema/types"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function isValidGender(
  value: string | undefined
): value is (typeof genderEnum.enumValues)[number] {
  return (
    typeof value === "string" &&
    (genderEnum.enumValues as readonly string[]).includes(value)
  )
}

export async function updateUserGender(formData: FormData) {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const genderInput = formData.get("gender")?.toString()
  const gender: (typeof genderEnum.enumValues)[number] | null = isValidGender(
    genderInput
  )
    ? genderInput
    : null

  try {
    await db.instance
      .update(users)
      .set({ gender, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    revalidatePath("/settings")
    return { success: true, message: "Gender updated successfully" }
  } catch (error) {
    console.error("Failed to update user gender:", error)
    throw new Error("Failed to update gender")
  }
}
