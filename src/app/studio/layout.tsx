import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { logger } from "@/lib/logger"
import type { ReactNode } from "react"
import meta from "@/lib/data/meta.json"
import { StudioSidebar } from "@/app/studio/components/studio-sidebar"

export const metadata: Metadata = {
  title: meta.STUDIO.TITLE,
  description: meta.STUDIO.DESCRIPTION,
}

export const dynamic = "force-dynamic"

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    logger.warn("Unauthorized access attempt to studio section", {
      userId: session?.user?.id || "unauthenticated",
      timestamp: new Date().toISOString(),
      module: "studio-layout",
    })
    redirect("/unauthorized")
  }

  return (
    <div className="h-screen lg:pl-[256px]">
      <StudioSidebar className="hidden lg:flex" />
      <main className="h-full">{children}</main>
    </div>
  )
}

export default Layout
