"use client"

import { useEffect, useState } from "react"
import { usePracticeModal } from "@/store/use-practice-modal"
import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal"
import Image from "next/image"
import { cn } from "@/lib/utils"

export const PracticeModal = () => {
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close } = usePracticeModal()

  useEffect(() => setIsClient(true), [])

  if (!isClient) return null

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle
            className={cn("text-center text-2xl font-bold")}
          >
            Practice exercise
          </ResponsiveModalTitle>
          <ResponsiveModalDescription
            className={cn(
              "text-center text-base text-muted-foreground leading-tight mb-4"
            )}
          >
            Use practice sessions to regain gems and points. You cannot lose
            gems or points in practice exercises.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="w-full space-y-6">
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/images/icons/gem.svg"
              alt="Gem"
              height={100}
              width={100}
            />
          </div>
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={close}
            >
              I understand
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
