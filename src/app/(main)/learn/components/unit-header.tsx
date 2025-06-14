"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NotesModal } from "@/app/(main)/learn/components/notes-modal"
import { BookOpenText } from "lucide-react"
import { getUnitNotes } from "@/app/actions/get-unit-notes"

type Props = {
  title: string
  description: string
  unitId: number
  firstDrillId?: number
  activeDrillId?: number
  isActive?: boolean
}

export const UnitHeader = ({
  title,
  description,
  unitId,
  firstDrillId,
  activeDrillId,
  isActive = true,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = async () => {
    if (!isActive) return // Prevent modal from opening for inactive units
    setOpen(true)
    if (notes === null) {
      setLoading(true)
      setError(null)
      try {
        const response = await getUnitNotes(unitId)
        setNotes(response.notes)
        if (response.error) {
          setError(response.error)
        }
      } catch (err) {
        console.error(err)
        setError("Could not load notes.")
      } finally {
        setLoading(false)
      }
    }
  }

  // Only generate firstDrillUrl for active units
  let firstDrillUrl = ""
  if (isActive && firstDrillId) {
    if (firstDrillId === activeDrillId) {
      firstDrillUrl = "/Drill"
    } else {
      firstDrillUrl = `/Drill/${firstDrillId}?isPractice=true`
    }
  }

  return (
    <div
      className={`flex w-full items-center justify-between rounded-3xl p-5
        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.2)]
        dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.25),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]
        ${isActive ? "bg-brand-500 dark:bg-brand-800" : "bg-neutral-300 dark:bg-neutral-600 opacity-50"}`}
    >
      <div
        className={`space-y-2.5
          ${isActive ? "text-white dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"}`}
      >
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">
          {isActive
            ? description
            : "Locked - Complete previous units to unlock"}
        </p>
      </div>
      <Button
        size="lg"
        variant={isActive ? "secondary" : "ghost"}
        onClick={handleOpen}
        disabled={!isActive}
        className={isActive ? "" : "cursor-not-allowed opacity-50"}
      >
        <BookOpenText className="size-6 lg:mr-2" />
        <span className="hidden lg:inline">
          {isActive ? "Study" : "Locked"}
        </span>
      </Button>
      {isActive && (
        <NotesModal
          open={open}
          setOpen={setOpen}
          title={title}
          notes={notes}
          loading={loading}
          error={error}
          firstDrillId={firstDrillId}
          firstDrillUrl={firstDrillUrl}
        />
      )}
    </div>
  )
}
