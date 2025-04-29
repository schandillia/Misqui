import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"
import { bodyFont, headingFont } from "@/lib/fonts"
import { Toaster } from "sonner"
import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AuthProvider } from "@/components/auth/auth-provider"
import { logger } from "@/lib/logger"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ExitModal } from "@/components/exit-modal"
import { GemsModal } from "@/components/gems-modal"
import { PracticeModal } from "@/components/practice-modal"

export const metadata: Metadata = {
  title: meta.HOME.TITLE,
  description: meta.HOME.DESCRIPTION,
  icons: [{ rel: "icon", url: "/mascot.svg" }],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  // Logging the session data
  if (session) logger.info("SESSION: %O", session)

  if (session?.user?.id) {
    logger.info("SESSION.USER.ID: %s", session.user.id)
    try {
      await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
      // Not storing the result since we're not using it
    } catch (error) {
      // Log errors using Winston
      logger.error("Error fetching user: %O", error)
    }
  } else {
    // Log when no user session is found
    logger.warn("No user session or ID found.")
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(bodyFont.variable, headingFont.variable)}
    >
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
          <ExitModal />
          <GemsModal />
          <PracticeModal />
        </AuthProvider>
      </body>
    </html>
  )
}
