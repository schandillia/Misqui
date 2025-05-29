"use client"

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes"
import { ThemeProvider as CustomThemeProvider } from "@/components/theme/theme-context"
import { ReactNode, useEffect, useRef } from "react"
import { themeEnum } from "@/db/schema/types"

export function ThemeProvider({
  children,
  isPro,
  defaultTheme,
}: {
  children: ReactNode
  isPro: boolean
  defaultTheme: (typeof themeEnum.enumValues)[number]
}) {
  const { theme, setTheme } = useNextTheme()
  const isInitialRender = useRef(true)

  console.log("ThemeProvider initialized with defaultTheme:", defaultTheme)

  useEffect(() => {
    console.log(
      "useEffect: isInitialRender=",
      isInitialRender.current,
      "current theme=",
      theme,
      "isAuthenticated=",
      document.documentElement.dataset.authenticated
    )
    if (isInitialRender.current) {
      isInitialRender.current = false
      if (document.documentElement.dataset.authenticated === "true") {
        // For logged-in users, clear localStorage and use defaultTheme
        localStorage.removeItem("theme")
        console.log("Setting theme to defaultTheme:", defaultTheme)
        setTheme(defaultTheme)
        // Force apply theme class to <html>
        document.documentElement.classList.remove("light", "system")
        document.documentElement.classList.add(defaultTheme)
      } else {
        // For non-logged-in users, check localStorage for theme
        const storedTheme = localStorage.getItem("theme") || "system"
        if (themeEnum.enumValues.includes(storedTheme as any)) {
          console.log("Setting theme to storedTheme:", storedTheme)
          setTheme(storedTheme)
        } else {
          console.log("Falling back to system theme")
          setTheme("system")
        }
      }
      return
    }

    // Add theme-switching class during theme change
    document.documentElement.classList.add("theme-switching")
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-switching")
    }, 300) // Match the transition duration in globals.css

    return () => clearTimeout(timeout)
  }, [theme, defaultTheme])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
    >
      <CustomThemeProvider isPro={isPro}>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}
