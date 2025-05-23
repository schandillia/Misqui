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
    <div className="bg-brand-50 dark:bg-brand-950 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Image
        src="/images/mascots/mascot.svg"
        alt="Mascot"
        width={160}
        height={160}
        className="mb-6 animate-bounce"
      />
      <h1 className="text-brand-700 dark:text-brand-100 mb-2 text-4xl font-bold">
        Welcome Back!
      </h1>
      <p className="text-brand-600 dark:text-brand-200 mb-6 text-lg">
        Pick one and continue with your adventure!
      </p>

      <div className="w-full max-w-sm space-y-4">
        <Button
          variant="primaryOutline"
          className="flex h-12 w-full items-center justify-center gap-2"
          onClick={() => signInWithGoogle(redirectUrl)}
        >
          <FcGoogle className="size-5" />
          <span>Continue with Google</span>
        </Button>

        <Button
          variant="primaryOutline"
          className="flex h-12 w-full items-center justify-center gap-2"
        >
          <FaApple className="text-brand-950 dark:text-brand-100 size-5" />
          <span>Continue with Apple</span>
        </Button>
      </div>

      <div className="text-brand-600 dark:text-brand-300 max-w-xs pt-6 text-center text-xs">
        <p>
          By continuing, you agree to {brand.BRAND}{" "}
          <Link
            href="/terms"
            className="text-brand-500 dark:text-brand-400 font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-brand-500 dark:text-brand-400 font-medium"
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
