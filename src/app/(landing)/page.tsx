import { Button } from "@/components/ui/button"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import { auth } from "@/auth"
import Link from "next/link"
import { AuthButton } from "@/components/auth/auth-button"
import { HiOutlineRocketLaunch } from "react-icons/hi2"

export default async function Home() {
  const session = await auth()

  return (
    <div
      className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center
        gap-8 p-4 lg:flex-row"
    >
      <div className="relative h-[240px] w-[240px] shrink-0 lg:h-[424px] lg:w-[424px]">
        <Image src="images/backgrounds/hero.svg" alt="Mascot" fill priority />
      </div>

      <div className="flex w-full max-w-[480px] flex-col items-center gap-8">
        <h1 className="text-center text-xl font-bold text-theme-gradient lg:text-3xl">
          Learn, practice, and master new skills with {brand.BRAND}
        </h1>

        <div className="flex max-w-[330px] flex-col items-center gap-y-3">
          {session?.user ? (
            <Button
              size="lg"
              variant="primary"
              className="button-shine-effect mx-4 w-full"
              asChild
            >
              <Link href="/learn">
                Continue your adventure!
                <HiOutlineRocketLaunch className="ml-2 size-6" />
              </Link>
            </Button>
          ) : (
            <AuthButton
              variant="primary"
              className="button-shine-effect w-full"
              label="Start your adventure!"
              hasIcon
            />
          )}
        </div>
      </div>
    </div>
  )
}
