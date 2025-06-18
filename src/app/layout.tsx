import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"
import { bodyFont, headingFont } from "@/lib/fonts"
import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { brandColorEnum, themeEnum, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AuthProvider } from "@/components/auth/auth-provider"
import { logger } from "@/lib/logger"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ExitModal } from "@/components/modals/exit-modal"
import { PracticeModal } from "@/components/modals/practice-modal"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { getUserSubscription } from "@/db/queries"
import { Toaster } from "react-hot-toast"
import { InsufficientGemsModal } from "@/components/modals/insufficient-gems-modal"

export const metadata: Metadata = {
  title: meta.HOME.TITLE,
  description: meta.HOME.DESCRIPTION,
  icons: [{ rel: "icon", url: "/images/mascots/mascot.svg" }],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await initializeDb()

  const session = await auth()
  // Log session only in development for debugging
  if (session?.user?.id && process.env.NODE_ENV === "development") {
    logger.debug("User session found", { userId: session.user.id })
  }

  let theme: (typeof themeEnum.enumValues)[number] = "system"
  let brandColor: (typeof brandColorEnum.enumValues)[number] = "violet"

  if (session?.user?.id) {
    try {
      const [user] = await db.instance
        .select({ theme: users.theme, brandColor: users.brandColor })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
      if (user) {
        theme = user.theme
        brandColor = user.brandColor
      }
    } catch (error) {
      logger.error("Error fetching user", { error, module: "layout" })
    }
  } else if (process.env.NODE_ENV === "development") {
    logger.debug("No user session found")
  }

  const userSubscription = await getUserSubscription()
  const isPro = !!userSubscription?.isActive

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(bodyFont.variable, headingFont.variable)}
      data-authenticated={session?.user?.id ? "true" : "false"}
    >
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider
            isPro={isPro}
            defaultTheme={theme}
            defaultBrandColor={brandColor}
          >
            {children}
            <Toaster position="top-center" />
            <ExitModal />
            <PracticeModal />
            <InsufficientGemsModal />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
