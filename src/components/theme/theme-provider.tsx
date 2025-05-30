"use client"

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes"
import { ThemeProvider as CustomThemeProvider } from "@/components/theme/theme-context"
import { ReactNode, useEffect, useRef, useCallback } from "react"
import { brandColorEnum, themeEnum } from "@/db/schema/types"

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
  const { theme, setTheme } = useNextTheme()
  const isInitialRender = useRef(true)

  if (process.env.NODE_ENV === "development") {
    console.info("ThemeProvider initialized with defaultTheme:", defaultTheme)
  }

  const handleThemeInitialization = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "useEffect: isInitialRender=",
        isInitialRender.current,
        "current theme=",
        theme,
        "isAuthenticated=",
        document.documentElement.dataset.authenticated
      )
    }

    if (isInitialRender.current) {
      isInitialRender.current = false
      if (document.documentElement.dataset.authenticated === "true") {
        // For logged-in users, clear localStorage and use defaultTheme
        localStorage.removeItem("theme")
        if (process.env.NODE_ENV === "development") {
          console.info("Setting theme to defaultTheme:", defaultTheme)
        }
        setTheme(defaultTheme)
        // Force apply theme class to <html>
        document.documentElement.classList.remove("light", "system")
        document.documentElement.classList.add(defaultTheme)
      } else {
        // For non-logged-in users, check localStorage for theme
        const storedTheme = localStorage.getItem("theme") || "system"
        const isValidTheme = themeEnum.enumValues.includes(
          storedTheme as (typeof themeEnum.enumValues)[number]
        )

        if (isValidTheme) {
          if (process.env.NODE_ENV === "development") {
            console.info("Setting theme to storedTheme:", storedTheme)
          }
          setTheme(storedTheme)
        } else {
          if (process.env.NODE_ENV === "development") {
            console.info("Falling back to system theme")
          }
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
  }, [theme, defaultTheme, setTheme])

  useEffect(() => {
    return handleThemeInitialization()
  }, [handleThemeInitialization])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
    >
      <CustomThemeProvider isPro={isPro} defaultBrandColor={defaultBrandColor}>
        {children}
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
