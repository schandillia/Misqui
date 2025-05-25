"use client"

import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { LessonNotesScroller } from "@/app/(main)/learn/lesson-notes-scroller"
import Link from "next/link"
import { marked } from "marked"
import { Dispatch, SetStateAction } from "react"

type NotesModalProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  title: string
  notes: string | null
  loading: boolean
  error: string | null
  firstExerciseId?: number
  firstExerciseUrl: string
}

const renderer = new marked.Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const sizes = [
    "text-3xl font-bold mt-6 mb-2",
    "text-2xl font-semibold mt-5 mb-2",
    "text-xl font-semibold mt-4 mb-2",
    "text-lg font-semibold mt-3 mb-1",
    "text-base font-semibold mt-2 mb-1",
    "text-sm font-semibold mt-2 mb-1",
  ]
  const className = sizes[depth - 1] || "text-base font-semibold"
  return `<h${depth} class=\"${className}\">${text}</h${depth}>`
}

export const NotesModal = ({
  open,
  setOpen,
  title,
  notes,
  loading,
  error,
  firstExerciseId,
  firstExerciseUrl,
}: NotesModalProps) => {
  return (
    <Modal
      showModal={open}
      setShowModal={setOpen}
      title={title}
      className="w-full max-w-2xl"
    >
      {loading && (
        <div
          className="flex w-full items-center justify-center"
          style={{ minHeight: 64 }}
        >
          <Loader className="text-muted-foreground size-8 animate-spin" />
        </div>
      )}
      {error && <div className="text-danger-500">{error}</div>}
      {!loading && !error && notes && (
        <LessonNotesScroller html={marked(notes, { renderer }) as string} />
      )}
      <div className="mt-4 flex gap-2">
        <Button
          variant="dangerOutline"
          onClick={() => setOpen(false)}
          className="flex-1"
        >
          Close
        </Button>
        {firstExerciseId && (
          <Button
            asChild
            variant="primary"
            className="button-shine-effect flex-1"
          >
            <Link href={firstExerciseUrl}>Quiz</Link>
          </Button>
        )}
      </div>
    </Modal>
  )
}
