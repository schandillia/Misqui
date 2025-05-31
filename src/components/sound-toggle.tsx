"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { updateSound } from "@/app/actions/update-sound"

interface SoundToggleProps {
  initialSoundEnabled: boolean
}

export function SoundToggle({ initialSoundEnabled }: SoundToggleProps) {
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newValue = !soundEnabled
    startTransition(async () => {
      try {
        await updateSound({ soundEnabled: newValue })
        setSoundEnabled(newValue)
      } catch (error) {
        // Silently handle error to avoid user disruption
        console.error("Failed to update sound preference:", error)
      }
    })
  }

  return (
    <Switch
      checked={soundEnabled}
      onCheckedChange={handleToggle}
      disabled={isPending}
      className="cursor-pointer"
    />
  )
}
