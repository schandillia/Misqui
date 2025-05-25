"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProvider as CustomThemeProvider } from "@/components/theme/theme-context"
import { ReactNode } from "react"

export function ThemeProvider({
  children,
  isPro,
}: {
  children: ReactNode
  isPro: boolean
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CustomThemeProvider isPro={isPro}>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}
