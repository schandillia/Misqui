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
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 rounded-full border border-border transition-all hover:scale-110
            cursor-pointer ${brandColor} relative overflow-hidden shadow-md hover:shadow-lg
            hover:-translate-y-0.5 active:scale-95 active:shadow-sm before:content-['']
            before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20
            before:to-transparent before:rounded-full ring-2 ring-brand-300/50 hover:ring-3
            hover:ring-brand-400/70 dark:ring-brand-500/50 dark:hover:ring-brand-600/70`}
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
