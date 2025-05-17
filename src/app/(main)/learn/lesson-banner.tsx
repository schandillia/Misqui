import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NotebookText, Loader } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { marked } from "marked"
import { LessonNotesScroller } from "@/app/(main)/learn/lesson-notes-scroller"
import Link from "next/link"

type Props = {
  title: string
  description: string
  lessonId: number
  firstExerciseId?: number
  activeExerciseId?: number
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
    <div className="bg-brand-500 dark:bg-brand-800 flex w-full items-center justify-between rounded-3xl p-5">
      <div className="space-y-2.5 text-white dark:text-neutral-300">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Button size="lg" variant="secondary" onClick={handleOpen}>
        <NotebookText className="lg:mr-2" />
        <span className="hidden lg:inline">Study</span>
      </Button>
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
        {error && <div className="text-red-500">{error}</div>}
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
    </div>
  )
}
