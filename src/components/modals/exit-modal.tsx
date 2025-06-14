"use client"

import { useRouter } from "next/navigation"
import { useExitModal } from "@/store/use-exit-modal"
import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal"
import Image from "next/image"

export const ExitModal = () => {
  const router = useRouter()
  const { isOpen, close } = useExitModal()

  const handleEndSession = () => {
    close()
    router.push("/learn")
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-center text-2xl font-bold">
            Are you sure?
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-center text-muted-foreground text-base leading-tight mb-4">
            Do you want to end your learning session?
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="w-full space-y-6">
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/images/mascots/mascot-sad.svg"
              alt="Sad mascot indicating end of session"
              height={80}
              width={80}
            />
          </div>
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              className="button-shine-effect w-full"
              size="lg"
              onClick={close}
            >
              Keep learning
            </Button>
            <Button
              variant="dangerOutline"
              className="w-full"
              size="lg"
              onClick={handleEndSession}
            >
              End session
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
