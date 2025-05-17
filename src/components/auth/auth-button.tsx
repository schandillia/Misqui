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
                <FaApple className="size-5 text-black dark:text-white" />
                <span>Continue with Apple</span>
              </Button>
            </div>

            <div className="text-muted-foreground pt-4 text-center text-xs">
              <p>
                By continuing, you agree to {brand.BRAND}{" "}
                <Link href={"/terms"} className="text-brand-500 font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href={"/privacy"} className="text-brand-500 font-medium">
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
