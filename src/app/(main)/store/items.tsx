"use client"

import { refillGems } from "@/app/actions/user-progress"
import { createStripeUrl } from "@/app/actions/user-subscription"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTransition } from "react"
import { toast } from "sonner"
import app from "@/lib/data/app.json"

type Props = {
  gems: number
  points: number
  hasActiveSubscription: boolean
}

export const Items = ({ gems, points, hasActiveSubscription }: Props) => {
  const [pending, startTransition] = useTransition()

  const onRefillGems = () => {
    if (pending || gems === app.GEMS_LIMIT || points < app.POINTS_TO_REFILL)
      return

    startTransition(() => {
      refillGems().catch(() => toast.error("Something went wrong"))
    })
  }

  const onUpgrade = () => {
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) window.location.href = response.data
        })
        .catch(() => toast.error("Something went wrong"))
    })
  }

  return (
    <ul className="w-full">
      <div className="flex w-full items-center gap-x-4 border-t-2 p-4">
        <Image src="/images/icons/gem.svg" alt="Gem" height={60} width={60} />
        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl dark:text-neutral-300">
            Refill gems
          </p>
        </div>
        <Button
          onClick={onRefillGems}
          disabled={
            pending || gems === app.GEMS_LIMIT || points < app.POINTS_TO_REFILL
          }
        >
          {gems === app.GEMS_LIMIT ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image
                src="/images/icons/points.svg"
                alt="Points"
                height={20}
                width={20}
              />
              <p>{app.POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>
      <div className="flex w-full items-center gap-x-4 border-t-2 p-4 pt-8">
        <Image
          src="/images/icons/gems_unlimited.svg"
          height={60}
          width={60}
          alt="Unlimited"
        />
        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl dark:text-neutral-300">
            Unlimited gems
          </p>
        </div>
        <Button disabled={pending} onClick={onUpgrade}>
          {hasActiveSubscription ? "settings" : "upgrade"}
        </Button>
      </div>
    </ul>
  )
}
