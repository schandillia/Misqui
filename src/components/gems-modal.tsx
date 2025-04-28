"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useGemsModal } from "@/store/use-gems-modal"
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

export const GemsModal = () => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close } = useGemsModal()

  useEffect(() => setIsClient(true), [])

  const onClick = () => {
    close()
    router.push("/store")
  }

  if (!isClient) return null

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex w-full items-center mb-5 justify-center">
            <Image src="/mascot-bad.svg" alt="Mascot" height={80} width={80} />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            You’re out of gems!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get Pro for unlimited gems, or purchase them in the store.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onClick}
            >
              Get unlimited gems
            </Button>
            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              No, thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
