"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useExitModal } from "@/store/use-exit-modal"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import Image from "next/image"
import exitMessages from "@/lib/data/exit-messages.json"
import { mutate } from "swr"

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

  useEffect(() => {
    if (isOpen) {
      router.prefetch("/learn")
      fetch("/api/learn-data")
        .then((res) => res.json())
        .then((data) => {
          mutate("/api/learn-data", data, false)
        })
    }
  }, [isOpen, router])

  useEffect(() => setIsClient(true), [])

  const handleEndSession = () => {
    close()
    router.push("/learn")
  }

  if (!isClient) return null

  return (
    <Modal
      showModal={isOpen}
      setShowModal={close}
      title={randomMessage.title}
      description={randomMessage.description}
    >
      <div className="w-full space-y-6">
        <div className="mb-5 flex w-full items-center justify-center">
          <Image
            src="/images/mascots/mascot-sad.svg"
            alt="Mascot"
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
    </Modal>
  )
}
