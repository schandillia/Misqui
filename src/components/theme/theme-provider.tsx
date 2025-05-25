"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProvider as CustomThemeProvider } from "@/components/theme/theme-context"
import { ReactNode } from "react"

export function ThemeProvider({
  children,
  isPro,
  initialBrandColor,
}: {
  children: ReactNode
  isPro: boolean
  initialBrandColor: string
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CustomThemeProvider isPro={isPro} initialBrandColor={initialBrandColor}>
        {children}
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
