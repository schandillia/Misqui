"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useGemsModal } from "@/store/use-gems-modal"
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
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle
            className={cn("text-center text-2xl font-bold")}
          >
            You’re out of gems!
          </ResponsiveModalTitle>
          <ResponsiveModalDescription
            className={cn(
              "text-center text-base text-muted-foreground leading-tight mb-4"
            )}
          >
            Get Pro for unlimited gems, or purchase them in the store.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="w-full space-y-6">
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/images/mascots/mascot-bad.svg"
              alt="Mascot"
              height={80}
              width={80}
            />
          </div>
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onClick}
            >
              Get unlimited gems
            </Button>
            <Button
              variant="dangerOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              No, thanks
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
