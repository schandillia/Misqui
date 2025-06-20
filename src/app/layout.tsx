import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"
import { bodyFont, headingFont } from "@/lib/fonts"
import { auth } from "@/auth"
import { initializeDb } from "@/db/drizzle"
import { brandColorEnum, themeEnum } from "@/db/schema"
import { AuthProvider } from "@/components/auth/auth-provider"
import { logger } from "@/lib/logger"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ExitModal } from "@/components/modals/exit-modal"
import { PracticeModal } from "@/components/modals/practice-modal"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "react-hot-toast"
import { InsufficientGemsModal } from "@/components/modals/insufficient-gems-modal"
import { getUserData } from "@/db/queries/user-queries"

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
  if (session?.user?.id && process.env.NODE_ENV === "development") {
    logger.debug("User session found", { userId: session.user.id })
  }

  const userData = session?.user?.id ? await getUserData() : null

  const theme: (typeof themeEnum.enumValues)[number] = (userData?.theme ||
    "system") as (typeof themeEnum.enumValues)[number]
  const brandColor: (typeof brandColorEnum.enumValues)[number] =
    (userData?.brandColor ||
      "violet") as (typeof brandColorEnum.enumValues)[number]
  const isPro = !!userData?.subscription?.isActive

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
