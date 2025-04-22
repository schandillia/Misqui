import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 text-center p-6">
      <Image
        src="/mascot.svg"
        alt="Mascot"
        width={160}
        height={160}
        className="mb-6 animate-bounce"
      />
      <h2 className="text-4xl font-bold text-brand-700 mb-2">Oopsie Daisy!</h2>
      <p className="text-lg text-brand-600 mb-6">
        We couldn’t find what you were looking for.
      </p>
      <Link href="/" className={buttonVariants({ variant: "primary" })}>
        🏠 Go Back Home
      </Link>
    </div>
  )
}
