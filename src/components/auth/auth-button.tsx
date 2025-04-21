"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"
import Link from "next/link"
import brand from "@/lib/data/brand.json"

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
}

export const AuthButton = ({
  variant = "ghost",
  size = "lg",
  className,
  label = "Start",
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
        className={className}
        onClick={onClick}
      >
        {label}
      </Button>

      {showModal && (
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          title="Sign In"
          description="Tap a button to get started"
        >
          <div className="w-full space-y-6 p-6">
            <div className="grid gap-4">
              <Button
                variant="primaryOutline"
                className="flex items-center justify-center gap-2 h-12"
                onClick={() => signInWithGoogle(redirectUrl)}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>

              <Button
                variant="primaryOutline"
                className="flex items-center justify-center gap-2 h-12"
              >
                <FaApple className="h-5 w-5" />
                <span>Continue with Apple</span>
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-4">
              <p>
                By continuing, you agree to {brand.BRAND}{" "}
                <Link href={"/terms"} className="font-medium text-brand-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href={"/privacy"} className="font-medium text-brand-500">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
