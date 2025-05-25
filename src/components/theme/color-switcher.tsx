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

interface ColorSwitcherProps {
  inSidebar?: boolean
}

export default function ColorSwitcher({
  inSidebar = false,
}: ColorSwitcherProps) {
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
          className={`${inSidebar ? "size-7" : "size-8"} rounded-full border border-border
            transition-all hover:scale-110 cursor-pointer relative overflow-hidden shadow-lg
            hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-md
            before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b
            before:from-white/60 before:to-transparent before:rounded-full
            after:content-[''] after:absolute after:inset-[2px] after:bg-gradient-radial
            after:from-white/40 after:to-transparent after:rounded-full ring-2
            ring-brand-300/50 hover:ring-3 hover:ring-brand-400/70 dark:ring-brand-500/50
            dark:hover:ring-brand-600/70 ${brandColor}`}
          style={{ backgroundColor: "oklch(from var(--brand-base) l c h)" }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-48 sm:w-fit rounded-3xl border border-border bg-neutral-100/80
          backdrop-blur-xs dark:bg-neutral-800/90 p-3 sm:p-4 shadow-sm
          ${inSidebar ? "ml-6" : ""}`}
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
                className={`size-6 rounded-full transition-all flex-shrink-0
                ${brandColor === color.className ? "ring-3 ring-border ring-offset-2" : ""}`}
                style={{
                  backgroundColor: "oklch(from var(--brand-base) l c h)",
                }}
              />
              <span className="text-sm text-foreground hidden sm:inline group-hover:text-brand-600">
                {color.label}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
