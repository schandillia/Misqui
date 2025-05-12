"use client"
import { useRef, useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

export function UnitNotesScroller({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollArrow, setShowScrollArrow] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      const el = containerRef.current
      if (!el) return
      setShowScrollArrow(
        el.scrollHeight > el.clientHeight &&
        Math.ceil(el.scrollTop + el.clientHeight) < Math.floor(el.scrollHeight)
      )
    }
    checkScroll()
    const el = containerRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [html])

  const handleScrollDown = () => {
    const el = containerRef.current
    if (el) {
      el.scrollBy({ top: el.clientHeight, behavior: "smooth" })
    }
  }

  return (
    <>
      <div className="relative max-h-[60vh]" style={{ minHeight: 80 }}>
        <div
          ref={containerRef}
          className="overflow-y-auto px-1 py-2 custom-notes-scrollbar h-full"
        >
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {showScrollArrow && (
          <button
            type="button"
            onClick={handleScrollDown}
            className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10 bg-neutral-500/80 dark:bg-neutral-300/80 rounded-full p-2 shadow animate-bounce cursor-pointer"
            aria-label="Scroll down"
          >
            <ChevronDown className="size-6 text-neutral-50 dark:text-neutral-700" />
          </button>
        )}
      </div>
      <style jsx>{`
        .custom-notes-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-notes-scrollbar::-webkit-scrollbar-thumb {
          background: #bbb;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .custom-notes-scrollbar:hover::-webkit-scrollbar-thumb,
        .custom-notes-scrollbar:active::-webkit-scrollbar-thumb {
          background: #888;
        }
        :global(.dark) .custom-notes-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
        }
        :global(.dark) .custom-notes-scrollbar:hover::-webkit-scrollbar-thumb,
        :global(.dark) .custom-notes-scrollbar:active::-webkit-scrollbar-thumb {
          background: #666;
        }
        .custom-notes-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #bbb transparent;
        }
        :global(.dark) .custom-notes-scrollbar {
          scrollbar-color: #333 transparent;
        }
      `}</style>
    </>
  )
} 