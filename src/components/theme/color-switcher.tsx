"use client"

import { useTheme, brandColors } from "@/components/theme/theme-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

export default function ColorSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { brandColor, changeBrandColor } = useTheme()

  // Find the current color's label
  const currentColorLabel =
    brandColors.find((color) => color.className === brandColor)?.label ||
    "Unknown"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Placeholder during hydration to prevent layout shift
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-4 w-16 bg-muted rounded" />
        <div className="h-6 w-6 rounded-full bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-foreground font-medium">{currentColorLabel}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full ring-1 ring-brand-300/50 ring-offset-1 hover:ring-2
              hover:ring-brand-400 dark:ring-brand-500/50 dark:hover:ring-brand-600 shadow-md
              hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200
              ease-out cursor-pointer focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
            style={{ backgroundColor: "oklch(from var(--brand-base) l c h)" }}
            aria-label={`Change theme color, current color: ${currentColorLabel}`}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 sm:w-fit rounded-3xl border border-border bg-neutral-100/80
            backdrop-blur-xs dark:bg-neutral-800/90 p-3 sm:p-4 shadow-sm"
        >
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {brandColors.map((color) => (
              <DropdownMenuItem
                key={color.className}
                onClick={() => changeBrandColor(color.className)}
                className={`group flex items-center justify-center sm:justify-start gap-2 p-1 sm:p-2
                rounded-3xl hover:bg-brand-100/50 ${color.className}`}
              >
                <div
                  className={`size-6 rounded-full transition-all flex-shrink-0 ${ brandColor ===
                  color.className && "ring-3 ring-border ring-offset-2" }`}
                  style={{
                    backgroundColor: "oklch(from var(--brand-base) l c h)",
                  }}
                />
                <span className="text-foreground hidden sm:inline group-hover:text-brand-600">
                  {color.label}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
