import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NotebookText, Loader } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { marked } from "marked"
import { UnitNotesScroller } from "@/app/(main)/learn/unit-notes-scroller"

type Props = {
  title: string
  description: string
  unitId: number
}

const renderer = new marked.Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const sizes = [
    "text-3xl font-bold mt-6 mb-2",
    "text-2xl font-semibold mt-5 mb-2",
    "text-xl font-semibold mt-4 mb-2",
    "text-lg font-semibold mt-3 mb-1",
    "text-base font-semibold mt-2 mb-1",
    "text-sm font-semibold mt-2 mb-1"
  ]
  const className = sizes[depth - 1] || "text-base font-semibold"
  return `<h${depth} class=\"${className}\">${text}</h${depth}>`
}

export const UnitBanner = ({ title, description, unitId }: Props) => {
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
        const res = await fetch(`/api/units/notes/${unitId}`)
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

  const handleClose = () => {
    setOpen(false)
    setNotes(null)
    setError(null)
  }

  return (
    <div className="w-full rounded-2xl bg-brand-500 dark:bg-brand-800 p-5 flex items-center justify-between">
      <div className="space-y-2.5 text-white dark:text-neutral-300">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Button size="lg" variant="secondary" onClick={handleOpen}>
        <NotebookText className="lg:mr-2" />
        <span className="hidden lg:inline">Study</span>
      </Button>
      <Modal showModal={open} setShowModal={setOpen} title={title} className="max-w-2xl w-full">
        {loading && (
          <div className="flex justify-center items-center w-full" style={{ minHeight: 64 }}>
            <Loader className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && notes && (
          <UnitNotesScroller html={marked(notes, { renderer }) as string} />
        )}
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="dangerOutline" onClick={handleClose}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
