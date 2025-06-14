"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { BsApple } from "react-icons/bs"
import Link from "next/link"
import brand from "@/lib/data/brand.json"
import { HiOutlineRocketLaunch } from "react-icons/hi2"
import { signInWithGoogle } from "@/app/actions/auth"
import { usePathname, useSearchParams } from "next/navigation"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
type ButtonSize = VariantProps<typeof buttonVariants>["size"]

interface AuthButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  label?: string
  hasIcon?: boolean
}

export const AuthButton = ({
  variant = "ghost",
  size = "lg",
  className,
  label = "Login",
  hasIcon = false,
}: AuthButtonProps) => {
  const [showModal, setShowModal] = useState(false)

  const onClick = () => setShowModal(true)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const intent = searchParams.get("intent")

  const finalCallbackUrl = pathname === "/" ? "/learn" : pathname
  const redirectUrl = intent
    ? `${finalCallbackUrl}?intent=${intent}`
    : finalCallbackUrl

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(className, hasIcon && "mx-4")}
        onClick={onClick}
      >
        {label}
        {hasIcon && <HiOutlineRocketLaunch className="ml-2 size-6" />}
      </Button>

      <ResponsiveModal open={showModal} onOpenChange={setShowModal}>
        <ResponsiveModalContent side="bottom" className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <ResponsiveModalTitle>Let’s Begin!</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Pick one to get started
            </ResponsiveModalDescription>
          </div>

          <div className="grid gap-4">
            <Button
              variant="primaryOutline"
              className="flex h-12 items-center justify-center gap-2"
              onClick={() => signInWithGoogle(redirectUrl)}
            >
              <FcGoogle className="size-5" />
              <span>Continue with Google</span>
            </Button>

            <Button
              variant="primaryOutline"
              className="flex h-12 items-center justify-center gap-2"
            >
              <BsApple className="size-5 text-black dark:text-white" />
              <span>Continue with Apple</span>
            </Button>
          </div>

          <div className="pt-4 text-center text-xs text-muted-foreground">
            <p>
              By continuing, you agree to {brand.BRAND}{" "}
              <Link href="/terms" className="text-brand-500 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-brand-500 font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  )
}
