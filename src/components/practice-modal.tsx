"use client"

import { useEffect, useState } from "react"
import { usePracticeModal } from "@/store/use-practice-modal"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import Image from "next/image"

export const PracticeModal = () => {
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close } = usePracticeModal()

  useEffect(() => setIsClient(true), [])

  if (!isClient) return null

  return (
    <Modal
      showModal={isOpen}
      setShowModal={close}
      title="Practice exercise"
      description="Use practice sessions to regain gems and points. You cannot lose gems or points in practice exercises."
    >
      <div className="w-full space-y-6">
        <div className="flex w-full items-center mb-5 justify-center">
          <Image
            src="/images/icons/gem.svg"
            alt="Gem"
            height={100}
            width={100}
          />
        </div>
        <div className="flex flex-col gap-y-4 w-full">
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
    </Modal>
  )
}
