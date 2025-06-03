import { Loader } from "lucide-react"
import { marked } from "marked"

type NotesContentProps = {
  loading: boolean
  error: string | null
  notes: string | null
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

export const NotesContent = ({ loading, error, notes }: NotesContentProps) => {
  return (
    <div className="flex-grow overflow-y-auto notes-scroll-container">
      {loading && (
        <div
          className="flex w-full items-center justify-center"
          style={{ minHeight: 64 }}
        >
          <Loader className="text-muted-foreground size-8 animate-spin" />
        </div>
      )}
      {error && (
        <div className="text-danger-500 px-4 py-2 text-center">{error}</div>
      )}
      {!loading && !error && notes && (
        <div
          dangerouslySetInnerHTML={{
            __html: marked(notes, { renderer }) as string,
          }}
        />
      )}
      <style jsx>{`
        :global(.notes-scroll-container) {
          scrollbar-width: thin;
          scrollbar-color: #bbb transparent;
        }
        :global(.notes-scroll-container::-webkit-scrollbar) {
          width: 5px;
          background: transparent;
        }
        :global(.notes-scroll-container::-webkit-scrollbar-track) {
          background: transparent;
        }
        :global(.notes-scroll-container::-webkit-scrollbar-thumb) {
          background: #bbb;
          border-radius: 4px;
          transition: background 0.2s;
        }
        :global(.notes-scrollbar:hover)::-webkit-scrollbar-thumb,
        :global(.notes-scrollbar:active)::-webkit-scrollbar-thumb {
          background: #888;
        }
        :global(.dark .notes-scrollbar)::-webkit-scrollbar-thumb {
          background: #333;
        }
        :global(.dark .notes-scrollbar:hover)::-webkit-scrollbar-thumb,
        :global(.dark .notes-scrollbar:active)::-webkit-scrollbar-thumb {
          background: #666;
        }
      `}</style>
    </div>
  )
}
