"use client"

import { Input } from "@/components/ui/input"
import { updateUserName } from "@/app/actions/update-user-name"
import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { z } from "zod"

// Client-side Zod schema (mirrors server-side for immediate feedback)
const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character long")
  .max(50, "Name must be at most 50 characters long")
  .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces")
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: "Name must contain at least one letter",
  })
  .transform((val) => val.replace(/\s+/g, " "))

interface NameInputProps {
  defaultName: string
}

export function NameInput({ defaultName }: NameInputProps) {
  const [name, setName] = useState(defaultName)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    // Validate input explicitly before submission
    const result = nameSchema.safeParse(name)
    if (!result.success) {
      setError(result.error.errors[0].message)
      setName(defaultName) // Revert to defaultName on client validation failure
      return
    }
    if (name !== defaultName) {
      // Trim and normalize spaces before sending to server
      const normalizedName = nameSchema.parse(name)
      setName(normalizedName) // Update input to trimmed and normalized value
      const formData = new FormData()
      formData.append("name", normalizedName)
      startTransition(async () => {
        try {
          const result = await updateUserName(formData)
          setError(null) // Clear error on success
          toast.success(result.message)
        } catch (error) {
          setName(defaultName) // Revert to defaultName on server failure
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update name"
          setError(errorMessage) // Show server errors
          toast.error(errorMessage)
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
    <div>
      <Input
        id="name"
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          // Validate on change for immediate feedback
          const result = nameSchema.safeParse(e.target.value)
          setError(result.success ? null : result.error.errors[0].message)
        }}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-3xl h-10 ${error ? "border-red-500" : ""}`}
        disabled={isPending}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
