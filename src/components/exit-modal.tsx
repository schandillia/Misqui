"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useExitModal } from "@/store/use-exit-modal"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import exitMessages from "@/lib/data/exit-messages.json"

export const ExitModal = () => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close } = useExitModal()
  const [randomMessage, setRandomMessage] = useState({
    title: "",
    description: "",
  })

  // Update random message when modal opens
  useEffect(() => {
    if (isOpen) {
      const message =
        exitMessages[Math.floor(Math.random() * exitMessages.length)]
      setRandomMessage({
        title: message.title,
        description: message.description,
      })
    }
  }, [isOpen])

  useEffect(() => setIsClient(true), [])

  if (!isClient) return null

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex w-full items-center mb-5 justify-center">
            <Image src="/mascot-sad.svg" alt="Mascot" height={80} width={80} />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {randomMessage.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {randomMessage.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Keep learning
            </Button>
            <Button
              variant="dangerOutline"
              className="w-full"
              size="lg"
              onClick={() => {
                close()
                router.push("/learn")
              }}
            >
              End session
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
