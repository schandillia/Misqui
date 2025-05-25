"use client"

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes"
import { ThemeProvider as CustomThemeProvider } from "@/components/theme/theme-context"
import { ReactNode, useEffect, useRef } from "react"

export function ThemeProvider({
  children,
  isPro,
}: {
  children: ReactNode
  isPro: boolean
}) {
  const { theme } = useNextTheme()
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    // Add theme-switching class during theme change
    document.documentElement.classList.add("theme-switching")
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-switching")
    }, 300) // Match the transition duration in globals.css

    return () => clearTimeout(timeout)
  }, [theme]) // Trigger when theme changes

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <CustomThemeProvider isPro={isPro}>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}
