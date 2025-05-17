import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="bg-brand-50 dark:bg-brand-950 flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <Image
        src="/images/mascots/mascot.svg"
        alt="Mascot"
        width={160}
        height={160}
        className="mb-6 animate-bounce"
      />
      <h2 className="text-brand-700 dark:text-brand-100 mb-2 text-4xl font-bold">
        Oopsie Daisy!
      </h2>
      <p className="text-brand-600 dark:text-brand-200 mb-6 text-lg">
        We couldn’t find what you were looking for.
      </p>
      <Link href="/" className={buttonVariants({ variant: "primary" })}>
        🏠 Go Back Home
      </Link>
    </div>
  )
}
