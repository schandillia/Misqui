"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NotesModal } from "@/app/(main)/learn/notes-modal"
import { BookOpenText } from "lucide-react"

type Props = {
  title: string
  description: string
  lessonId: number
  firstExerciseId?: number
  activeExerciseId?: number
}

export const LessonBanner = ({
  title,
  description,
  lessonId,
  firstExerciseId,
  activeExerciseId,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = async () => {
    setOpen(true)
    if (notes === null) {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/lessons/notes/${lessonId}`)
        if (!res.ok) throw new Error("Failed to fetch notes")
        const data = await res.json()
        setNotes(data.notes)
      } catch (err) {
        console.error(err)
        setError("Could not load notes.")
      } finally {
        setLoading(false)
      }
    }
  }

  let firstExerciseUrl = ""
  if (firstExerciseId) {
    if (firstExerciseId === activeExerciseId) {
      firstExerciseUrl = "/exercise"
    } else {
      firstExerciseUrl = `/exercise/${firstExerciseId}?isPractice=true`
    }
  }

  return (
    <div
      className="bg-brand-500 dark:bg-brand-800 flex w-full items-center justify-between
        rounded-3xl p-5
        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.2)]
        dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.25),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]"
    >
      <div className="space-y-2.5 text-white dark:text-neutral-300">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Button size="lg" variant="secondary" onClick={handleOpen}>
        <BookOpenText className="size-6 lg:mr-2" />
        <span className="hidden lg:inline">Study</span>
      </Button>
      <NotesModal
        open={open}
        setOpen={setOpen}
        title={title}
        notes={notes}
        loading={loading}
        error={error}
        firstExerciseId={firstExerciseId}
        firstExerciseUrl={firstExerciseUrl}
      />
    </div>
  )
}
