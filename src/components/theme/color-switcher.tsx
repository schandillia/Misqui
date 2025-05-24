"use client"

import { useTheme, brandColors } from "@/components/theme/theme-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

export function ColorSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { brandColor, changeBrandColor } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Placeholder during hydration to prevent layout shift
  if (!mounted) {
    return <div className="h-6 w-6 rounded-full bg-muted" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`size-8 rounded-full border border-border transition-all hover:scale-110
            cursor-pointer hover:shadow-sm ${brandColor}`}
          style={{ backgroundColor: `oklch(from var(--brand-base) l c h)` }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-fit rounded-3xl border border-border bg-brand-600/60 dark:bg-brand-600/30 p-6
          shadow-sm"
      >
        <div className="grid grid-cols-4 gap-6">
          {brandColors.map((color) => (
            <DropdownMenuItem
              key={color.className}
              onClick={() => changeBrandColor(color.className)}
              className={`flex items-center justify-center p-0 ${color.className} ${
              brandColor === color.className
                  ? "ring-3 ring-border ring-offset-2"
                  : ""
              }`}
            >
              <div
                className="size-8 rounded-full transition-all hover:scale-110 hover:shadow-sm"
                style={{
                  backgroundColor: `oklch(from var(--brand-base) l c h)`,
                }}
              />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
