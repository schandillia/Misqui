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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div className="border-brand-200 dark:border-brand-700 inline-flex items-center gap-x-1.5 rounded-full border p-1.5">
        {THEMES.map(({ icon: Icon }) => (
          <Button
            key={Icon.name}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full p-1.5"
            aria-label="Toggle theme"
          >
            <Icon className="text-brand-400 size-5" strokeWidth={1.5} />
          </Button>
        ))}
      </div>
    )
  }

  if (type === "compact") {
    const Icon = THEMES[activeIndex].icon
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

  return (
    <div
      className="border-brand-200 bg-brand-50 relative inline-flex w-max shrink-0 items-center gap-x-1.5 rounded-full border p-1.5 dark:border-neutral-700 dark:bg-neutral-800"
      role="group"
      aria-label="Theme toggle"
    >
      <div
        className="bg-brand-200 dark:bg-brand-900/80 absolute top-1.5 left-1.5 h-8 w-8 rounded-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${activeIndex * 38}px)` }}
      />
      {THEMES.map(({ name, icon: Icon, label }, index) => (
        <Button
          key={name}
          variant="ghost"
          size="icon"
          onClick={() => handleThemeChange(name, index)}
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
  )
}
