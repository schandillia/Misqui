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
import { getUserPreferences, getUserSubscription } from "@/db/queries"
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
  } else if (process.env.NODE_ENV === "development") {
    logger.debug("No user session found")
  }

  let theme: (typeof themeEnum.enumValues)[number] = "system"
  let brandColor: (typeof brandColorEnum.enumValues)[number] = "violet"
  let isPro = false

  if (session?.user?.id) {
    try {
      const [user, userSubscription] = await Promise.all([
        getUserPreferences(session.user.id),
        getUserSubscription(session.user.id),
      ])
      if (user) {
        theme = user.theme ?? "system"
        brandColor = user.brandColor ?? "violet"
      }
      isPro = !!userSubscription?.isActive
    } catch (error) {
      logger.error("Error fetching user data in RootLayout", {
        error,
        userId: session.user.id,
        module: "layout",
      })
    }
  }

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
