import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { logger } from "@/lib/logger"
import type { ReactNode } from "react"
import meta from "@/lib/data/meta.json"

export const metadata: Metadata = {
  title: meta.ADMIN.TITLE,
  description: meta.ADMIN.DESCRIPTION,
}

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth()

  // Check if user is logged in and has admin role
  if (!session?.user || session.user.role !== "admin") {
    logger.warn("Unauthorized access attempt to admin section", {
      userId: session?.user?.id || "unauthenticated",
      timestamp: new Date().toISOString(),
      module: "admin-layout",
    })
    redirect("/unauthorized")
  }

  return <>{children}</>
}

export default Layout
