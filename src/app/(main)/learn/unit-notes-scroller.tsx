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
    <div className={`relative max-h-[60vh] overflow-y-auto px-1 py-2${showScrollArrow ? ' scrollbar-hide' : ''}`} style={{ minHeight: 80 }} ref={containerRef}>
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
  )
} 