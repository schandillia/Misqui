"use server"

import { signIn } from "@/auth"
import { signOut } from "@/auth"
import { publicRoutes } from "@/routes"

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", {
    redirectTo: callbackUrl || "/",
  })
}

export async function logOut(currentPath: string) {
  const isPublicRoute = publicRoutes.has(currentPath) // Changed from includes() to has()
  await signOut({
    redirectTo: isPublicRoute ? currentPath : "/",
  })
}
