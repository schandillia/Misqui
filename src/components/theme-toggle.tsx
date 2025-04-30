"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { PiMoonStars, PiSun } from "react-icons/pi"
import { LuComputer } from "react-icons/lu"

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
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = theme ?? "system"
  const activeIndex = THEMES.findIndex((t) => t.name === currentTheme)

  const handleThemeChange = (newTheme: string, index: number) => {
    setTheme(newTheme)
    // Note: localStorage may not be needed if next-themes handles persistence
    localStorage.setItem("theme", newTheme)
  }

  const cycleTheme = () => {
    const nextIndex = (activeIndex + 1) % THEMES.length
    handleThemeChange(THEMES[nextIndex].name, nextIndex)
  }

  if (!mounted) {
    if (type === "compact") {
      return (
        <Button
          variant="default"
          size="icon"
          className="rounded-full"
          aria-label="Toggle theme"
        >
          <span className="sr-only">Toggle theme</span>
        </Button>
      )
    }
    return (
      <div className="inline-flex items-center gap-x-1.5 rounded-full border border-brand-200 dark:border-brand-700 p-1.5">
        {THEMES.map(({ icon: Icon }) => (
          <button key={Icon.name} className="p-1.5 rounded-full">
            <Icon className="size-5 text-brand-400" strokeWidth={1.5} />
          </button>
        ))}
      </div>
    )
  }

  if (type === "compact") {
    const Icon = THEMES[activeIndex].icon
    return (
      <Button
        className="rounded-full hover:bg-brand-200 dark:hover:bg-brand-700 cursor-pointer"
        variant="default"
        size="icon"
        onClick={cycleTheme}
        aria-label="Toggle theme"
      >
        <Icon
          className="size-4 text-brand-600 dark:text-brand-400"
          strokeWidth={1.5}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <div
      className="relative inline-flex items-center gap-x-1.5 rounded-full border border-brand-200 dark:border-brand-700 p-1.5 bg-brand-50 dark:bg-brand-800 shrink-0 w-max"
      role="group"
      aria-label="Theme toggle"
    >
      <div
        className="absolute top-1.5 left-1.5 h-8 w-8 rounded-full bg-brand-200 dark:bg-brand-500 transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${activeIndex * 38}px)` }}
      />
      {THEMES.map(({ name, icon: Icon, label }, index) => (
        <button
          key={name}
          onClick={() => handleThemeChange(name, index)}
          className={`relative p-1.5 rounded-full transition-colors z-10 flex items-center justify-center h-8 w-8 ${
            currentTheme === name
              ? "text-brand-800 dark:text-brand-200"
              : "text-brand-500 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-700"
          }`}
          aria-label={label}
        >
          <Icon className="size-5" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}
