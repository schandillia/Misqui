"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { PiMoonStars, PiSun } from "react-icons/pi"
import { LuComputer } from "react-icons/lu"
import { useColorTheme } from "@/components/ColorThemeProvider" // Added
import type { ColorThemeName } from "@/lib/theme-types" // Added
import { themes as colorPalettes } from "@/lib/theme-colors" // Added and aliased

interface ThemeToggleProps {
  type?: "compact" | "default"
}

const THEMES = [
  { name: "light", icon: PiSun, label: "Switch to light theme" },
  { name: "dark", icon: PiMoonStars, label: "Switch to dark theme" },
  { name: "system", icon: LuComputer, label: "Switch to system theme" },
] as const

export default function ThemeToggle({ type = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useColorTheme() // Added
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const availableColorPaletteNames = Object.keys(
    colorPalettes
  ) as ColorThemeName[] // Added

  const currentTheme = theme ?? "system"
  const activeIndex = THEMES.findIndex((t) => t.name === currentTheme)

  const handleThemeChange = (newTheme: string) => { // Modified
    setTheme(newTheme)
  }

  const cycleTheme = () => { // Modified
    const nextIndex = (activeIndex + 1) % THEMES.length
    handleThemeChange(THEMES[nextIndex].name)
  }

  if (!mounted) {
    if (type === "compact") {
      return (
        <Button
          variant="default"
          size="icon"
          className="rounded-full"
          aria-label="Toggle theme"
          disabled
        >
          <span className="sr-only">Toggle theme</span>
        </Button>
      )
    }
    // Placeholder for default type when not mounted
    return (
      <div className="flex items-center gap-x-2">
        <div className="border-brand-200 dark:border-brand-700 inline-flex items-center gap-x-1.5 rounded-full border p-1.5 opacity-50">
          {THEMES.map(({ icon: Icon, name }) => (
            <Button
              key={name}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full p-1.5"
              aria-label="Toggle theme mode"
              disabled
            >
              <Icon className="text-brand-400 size-5" strokeWidth={1.5} />
            </Button>
          ))}
        </div>
        <select
          disabled
          className="border-brand-200 bg-brand-50 dark:border-neutral-700 dark:bg-neutral-800 text-brand-800 dark:text-brand-200 rounded-full p-1.5 h-[46px] text-sm opacity-50 cursor-not-allowed"
          aria-label="Select color theme"
        >
          <option>{DEFAULT_COLOR_THEME || "Default"}</option> 
        </select>
      </div>
    )
  }

  if (type === "compact") {
    const Icon = THEMES[activeIndex < 0 ? 0 : activeIndex].icon // Guard against -1 index if theme is somehow not in THEMES
    return (
      <Button
        variant="default"
        size="icon"
        className="dark:bg-brand-200/10 hover:bg-brand-200 dark:hover:bg-brand-950/90 cursor-pointer rounded-full"
        onClick={cycleTheme}
        aria-label="Toggle theme"
      >
        <Icon
          className="text-brand-600 dark:text-brand-300 size-4"
          strokeWidth={1.5}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Default type when mounted
  return (
    <div className="flex items-center gap-x-2">
      {/* Light/Dark/System Toggle */}
      <div
        className="border-brand-200 bg-brand-50 relative inline-flex w-max shrink-0 items-center gap-x-1.5 rounded-full border p-1.5 dark:border-neutral-700 dark:bg-neutral-800"
        role="group"
        aria-label="Theme mode toggle"
      >
        <div
          className="bg-brand-200 dark:bg-brand-900/80 absolute top-1.5 left-1.5 h-8 w-8 rounded-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${(activeIndex < 0 ? 0 : activeIndex) * 38}px)` }} // Guard activeIndex
        />
        {THEMES.map(({ name, icon: Icon, label }) => (
          <Button
            key={name}
            variant="ghost"
            size="icon"
            onClick={() => handleThemeChange(name)}
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full p-1.5 transition-colors ${
              currentTheme === name
                ? "text-brand-800 dark:text-brand-200"
                : "text-brand-500 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-950/60"
            }`}
            aria-label={label}
          >
            <Icon className="size-5" strokeWidth={1.5} />
          </Button>
        ))}
      </div>

      {/* Color Palette Selector Dropdown */}
      <select
        value={colorTheme}
        onChange={(e) => setColorTheme(e.target.value as ColorThemeName)}
        className="border-brand-200 bg-brand-50 dark:border-neutral-700 dark:bg-neutral-800 text-brand-800 dark:text-brand-200 rounded-full p-1.5 h-[46px] text-sm focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
        aria-label="Select color theme"
      >
        {availableColorPaletteNames.map((paletteName) => (
          <option key={paletteName} value={paletteName}>
            {paletteName}
          </option>
        ))}
      </select>
    </div>
  )
}

// Added a default color theme name for the unmounted state, can be adjusted
const DEFAULT_COLOR_THEME: ColorThemeName = "Default";
