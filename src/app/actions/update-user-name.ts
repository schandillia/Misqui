"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateUserName(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name")?.toString()
  if (!name || name.length < 1 || name.length > 50) {
    throw new Error("Name must be between 1 and 50 characters")
  }

  try {
    await db
      .update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    revalidatePath("/settings")
    return { success: true, message: "Name updated successfully" }
  } catch (error) {
    console.error("Failed to update user name:", error)
    throw new Error("Failed to update name")
  }
}
