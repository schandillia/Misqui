import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"
import { bodyFont, headingFont } from "@/lib/fonts"
import { Toaster } from "sonner"
import { auth } from "@/auth"
import { db, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AuthProvider } from "@/components/auth/auth-provider"
import "./globals.css"
import { cn } from "@/lib/utils"

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
  let user = null
  if (session) console.log("SESSION: ", session)
  if (session?.user?.id) {
    console.log("SESSION.USER.ID: ", session.user.id)
    try {
      const result = await db
        .select()
        .from(users as any)
        .where(eq(users.id, session.user.id) as any)
        .limit(1)
      user = result[0] || null
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
        </AuthProvider>
      </body>
    </html>
  )
}
