import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NotebookText, Loader } from "lucide-react"
import { Modal } from "@/components/ui/modal"

type Props = {
  title: string
  description: string
  unitId: number
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
    <div className="w-full rounded-2xl bg-brand-500 dark:bg-brand-800 p-5 text-white dark:text-neutral-300 flex items-center justify-between">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Button size="lg" variant="secondary" onClick={handleOpen}>
        <NotebookText className="mr-2" />
        <span className="hidden lg:inline">Study</span>
      </Button>
      <Modal showModal={open} setShowModal={setOpen} title={title} className="max-w-2xl w-full">
        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-line px-1 py-2" style={{ minHeight: 80 }}>
          {loading && (
            <div className="flex justify-center items-center w-full" style={{ minHeight: 64 }}>
              <Loader className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && notes}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="dangerOutline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleClose} disabled={loading}>Finished</Button>
        </div>
      </Modal>
    </div>
  )
}
