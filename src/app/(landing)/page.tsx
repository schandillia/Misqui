import { Button } from "@/components/ui/button"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import { auth } from "@/auth"
import Link from "next/link"
import { AuthButton } from "@/components/auth/auth-button"

export default async function Home() {
  const session = await auth()

  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] shrink-0">
        <Image src="/hero.svg" alt="Mascot" fill priority />
      </div>

      <div className="flex flex-col items-center gap-8 max-w-[480px] w-full">
        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 dark:text-neutral-300 text-center">
          Learn, practice, and master new skills with {brand.BRAND}
        </h1>

        <div className="flex flex-col items-center gap-y-3 max-w-[330px]">
          {session?.user ? (
            <Button size="lg" variant="primary" className="w-full" asChild>
              <Link href="/learn">Continue learning</Link>
            </Button>
          ) : (
            // <Button size="lg" variant="primary" className="w-full">
            //   Get started
            // </Button>
            <AuthButton
              variant="primary"
              className="w-full"
              label="Get Started"
            />
          )}
        </div>
      </div>
    </div>
  )
}
