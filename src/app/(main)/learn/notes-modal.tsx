"use client"

import { Button } from "@/components/ui/button"
import { Dispatch, SetStateAction } from "react"
import Link from "next/link"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal"
import { NotesContent } from "@/app/(main)/learn/notes-content"

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
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalContent className="flex flex-col max-h-[90vh] overflow-hidden">
        <ResponsiveModalHeader className="flex-shrink-0">
          <ResponsiveModalTitle className="text-2xl font-bold text-center">
            {title}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <NotesContent loading={loading} error={error} notes={notes} />
        <ResponsiveModalFooter className="flex-shrink-0">
          <div className="flex gap-2 w-full">
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
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
