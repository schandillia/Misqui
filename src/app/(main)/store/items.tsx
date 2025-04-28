"use client"

import { refillGems } from "@/app/actions/user-progress"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTransition } from "react"
import { toast } from "sonner"

const POINTS_TO_REFILL = 10

type Props = {
  gems: number
  points: number
  hasActiveSubscription: boolean
}

export const Items = ({ gems, points, hasActiveSubscription }: Props) => {
  const [pending, startTransition] = useTransition()

  const onRefillGems = () => {
    if (pending || gems === 5 || points < POINTS_TO_REFILL) return

    startTransition(() => {
      refillGems().catch(() => toast.error("Something went wrong"))
    })
  }

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/gem.svg" alt="Gem" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Refill gems
          </p>
        </div>
        <Button
          onClick={onRefillGems}
          disabled={pending || gems === 5 || points < POINTS_TO_REFILL}
        >
          {gems === 5 ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="Points" height={20} width={20} />
              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>
    </ul>
  )
}
