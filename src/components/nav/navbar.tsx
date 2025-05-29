import { AuthButton } from "@/components/auth/auth-button"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import { auth } from "@/auth"
import UserNavMenu from "@/components/nav/user-nav-menu"
import ThemeToggle from "@/components/theme/theme-toggle"

export const Navbar = async () => {
  const session = await auth()

  return (
    <nav className="h-20 w-full border-b-2 border-neutral-200 px-4 dark:border-neutral-800">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <div className="flex items-center gap-x-3 pl-4">
          <Image
            src="/images/mascots/mascot.svg"
            alt="Mascot"
            width={40}
            height={40}
            className="align-middle"
          />
          <h1 className="text-brand-500 text-2xl font-extrabold tracking-wide">
            {brand.BRAND}
          </h1>
        </div>
        <div className="flex items-center gap-x-2">
          {session?.user ? (
            <>
              <UserNavMenu user={session.user} />
            </>
          ) : (
            <>
              <AuthButton />
            </>
          )}
          <ThemeToggle type="compact" />
        </div>
      </div>
    </nav>
  )
}
