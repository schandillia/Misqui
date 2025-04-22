"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Dispatch, ReactNode, SetStateAction, useEffect } from "react"
import { Drawer } from "vaul"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createPortal } from "react-dom"

interface ModalProps {
  children?: ReactNode
  className?: string
  showModal?: boolean
  setShowModal?: Dispatch<SetStateAction<boolean>>
  onClose?: () => void
  desktopOnly?: boolean
  preventDefaultClose?: boolean
  title?: string
  description?: string
}

export const Modal = ({
  children,
  className,
  desktopOnly,
  onClose,
  preventDefaultClose,
  setShowModal,
  showModal,
  title,
  description,
}: ModalProps) => {
  const closeModal = ({ dragged }: { dragged?: boolean }) => {
    if (preventDefaultClose && !dragged) {
      return
    }

    if (onClose) {
      onClose()
    }

    if (setShowModal) {
      setShowModal(false)
    }
  }

  // Add body class when modal is open to prevent scrolling
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }

    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [showModal])

  const { isMobile } = useMediaQuery()

  // Create a global overlay element that covers the entire page
  const GlobalOverlay = () => {
    // Only render on client-side
    if (typeof document === "undefined") return null

    return createPortal(
      <div
        className="fixed inset-0 bg-black opacity-70 backdrop-blur z-50"
        onClick={() => {
          if (!preventDefaultClose && setShowModal) {
            setShowModal(false)
          }
        }}
      />,
      document.body
    )
  }

  if (isMobile && !desktopOnly) {
    return (
      <>
        {/* Render the global overlay when modal is shown */}
        {showModal && <GlobalOverlay />}

        <Drawer.Root
          open={setShowModal ? showModal : true}
          onOpenChange={(open) => {
            if (!open) {
              closeModal({ dragged: true })
            }
          }}
        >
          {/* We're not using Drawer.Overlay anymore since we have our own global overlay */}
          <Drawer.Portal>
            <Drawer.Content
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] border-t border-gray-200 dark:border-brand-800 bg-white dark:bg-brand-950",
                className
              )}
            >
              <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[20px] bg-inherit">
                <div className="my-3 h-1 w-12 rounded-full bg-gray-300" />
              </div>

              <div className="justify-between gap-4 p-4">
                <Drawer.Title
                  className={cn(
                    title ? "text-2xl font-bold text-center" : "sr-only"
                  )}
                >
                  {title || ""}
                </Drawer.Title>
                <Drawer.Description
                  className={cn(
                    description
                      ? "text-center text-muted-foreground"
                      : "sr-only"
                  )}
                >
                  {description || ""}
                </Drawer.Description>
                {children}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </>
    )
  }

  return (
    <Dialog
      open={setShowModal ? showModal : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal({ dragged: true })
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        autoFocus={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(title ? "text-2xl font-bold text-center" : "sr-only")}
          >
            {title || ""}
          </DialogTitle>
          <DialogDescription
            className={cn(description ? "text-center" : "sr-only")}
          >
            {description || ""}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
