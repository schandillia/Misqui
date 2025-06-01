"use client"

import { useTransition } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createStripeUrl } from "@/app/actions/user-subscription"

interface SubscriptionButtonProps {
  isPro: boolean
  className?: string
  proVariant?: VariantProps<typeof buttonVariants>["variant"]
  nonProVariant?: VariantProps<typeof buttonVariants>["variant"]
  proLabel?: string
  nonProLabel?: string
  size?: VariantProps<typeof buttonVariants>["size"]
}

export const SubscriptionButton = ({
  isPro,
  className,
  proVariant = "default",
  nonProVariant = "default",
  proLabel = "Manage",
  nonProLabel = "Upgrade",
  size = "default",
}: SubscriptionButtonProps) => {
  const [pending, startTransition] = useTransition()

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
    <Button
      variant={isPro ? proVariant : nonProVariant}
      size={size}
      className={cn("w-auto", className)}
      disabled={pending}
      onClick={onUpgrade}
    >
      {isPro ? proLabel : nonProLabel}
    </Button>
  )
}
