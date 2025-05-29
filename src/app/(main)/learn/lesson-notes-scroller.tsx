"use client"
import { useRef, useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function LessonNotesScroller({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollArrow, setShowScrollArrow] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      const el = containerRef.current
      if (!el) return
      setShowScrollArrow(
        el.scrollHeight > el.clientHeight &&
          Math.ceil(el.scrollTop + el.clientHeight) <
            Math.floor(el.scrollHeight)
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
          className="custom-notes-scrollbar h-full overflow-y-auto px-1 py-2"
        >
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {showScrollArrow && (
          <button
            type="button"
            onClick={handleScrollDown}
            className={cn(
              "bg-brand-500/70 dark:bg-brand-300/70 absolute bottom-2 left-1/2 z-10",
              "-translate-x-1/2 animate-bounce cursor-pointer rounded-full p-2 shadow"
            )}
            aria-label="Scroll down"
          >
            <ChevronDown className="dark:text-brand-700 text-brand-100 size-6" />
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
