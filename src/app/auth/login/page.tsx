"use client"

import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/app/actions/auth"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"
import brand from "@/lib/data/brand.json"

const Page = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const intent = searchParams.get("intent")

  const [redirectUrl, setRedirectUrl] = useState("/")

  useEffect(() => {
    const base = callbackUrl === "/" ? "/learn" : callbackUrl
    setRedirectUrl(intent ? `${base}?intent=${intent}` : base)
  }, [callbackUrl, intent])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 dark:bg-brand-950 text-center px-6">
      <Image
        src="/mascot.svg"
        alt="Mascot"
        width={160}
        height={160}
        className="mb-6 animate-bounce"
      />
      <h1 className="text-4xl font-bold text-brand-700 dark:text-brand-100 mb-2">
        Welcome Back!
      </h1>
      <p className="text-lg text-brand-600 dark:text-brand-200 mb-6">
        Choose a method to sign in and continue to your destination.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <Button
          variant="primaryOutline"
          className="flex items-center justify-center gap-2 h-12 w-full"
          onClick={() => signInWithGoogle(redirectUrl)}
        >
          <FcGoogle className="size-5" />
          <span>Continue with Google</span>
        </Button>

        <Button
          variant="primaryOutline"
          className="flex items-center justify-center gap-2 h-12 w-full"
        >
          <FaApple className="size-5 text-brand-950 dark:text-brand-100" />
          <span>Continue with Apple</span>
        </Button>
      </div>

      <div className="text-center text-xs text-brand-600 dark:text-brand-300 pt-6 max-w-xs">
        <p>
          By continuing, you agree to {brand.BRAND}{" "}
          <Link
            href="/terms"
            className="font-medium text-brand-500 dark:text-brand-400"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand-500 dark:text-brand-400"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default Page
