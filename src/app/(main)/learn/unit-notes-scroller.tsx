"use client"
import { useRef, useEffect, useState } from "react"

export function UnitNotesScroller({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollArrow, setShowScrollArrow] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      const el = containerRef.current
      if (!el) return
      setShowScrollArrow(
        el.scrollHeight > el.clientHeight &&
        el.scrollTop + el.clientHeight < el.scrollHeight - 10
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
      <div
        ref={containerRef}
        className="relative max-h-[60vh] overflow-y-auto px-1 py-2 custom-notes-scrollbar"
        style={{ minHeight: 80 }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {showScrollArrow && (
          <button
            type="button"
            onClick={handleScrollDown}
            className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10 bg-white/80 dark:bg-black/60 rounded-full p-2 shadow animate-bounce cursor-pointer"
            aria-label="Scroll down"
          >
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
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