"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserName } from "@/app/actions/update-user-name"
import { toast } from "sonner"
import { useState, useTransition } from "react"

interface NameInputProps {
  defaultName: string
}

export function NameInput({ defaultName }: NameInputProps) {
  const [name, setName] = useState(defaultName)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (name !== defaultName) {
      const formData = new FormData()
      formData.append("name", name)
      startTransition(async () => {
        try {
          const result = await updateUserName(formData)
          toast.success(result.message)
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to update name"
          )
        }
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="w-full rounded-3xl"
        disabled={isPending}
      />
    </div>
  )
}
