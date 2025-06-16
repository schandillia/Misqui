"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import { ThemeProvider as CustomThemeProvider } from "@/components/theme/theme-context"
import { brandColorEnum, themeEnum } from "@/db/schema/types"

// Dynamically import NextThemesProvider to avoid SSR hydration issues
const NextThemesProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  }
)

export function ThemeProvider({
  children,
  isPro,
  defaultTheme,
  defaultBrandColor,
}: {
  children: ReactNode
  isPro: boolean
  defaultTheme: (typeof themeEnum.enumValues)[number]
  defaultBrandColor: (typeof brandColorEnum.enumValues)[number]
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      storageKey="theme"
    >
      <CustomThemeProvider isPro={isPro} defaultBrandColor={defaultBrandColor}>
        {children}
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
