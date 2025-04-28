import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"
import { bodyFont, headingFont } from "@/lib/fonts"
import { Toaster } from "sonner"
import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AuthProvider } from "@/components/auth/auth-provider"
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
  // Since we're not using the user variable, we can remove it
  if (session) console.log("SESSION: ", session)
  if (session?.user?.id) {
    console.log("SESSION.USER.ID: ", session.user.id)
    try {
      await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
      // Not storing the result since we're not using it
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  } else {
    console.log("No user session or ID found.")
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
