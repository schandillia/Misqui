import { AuthButton } from "@/components/auth/auth-button"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import { auth } from "@/auth"
import UserNavMenu from "@/components/nav/user-nav-menu"
import ThemeToggle from "@/components/theme-toggle"

export const Navbar = async () => {
  const session = await auth()

  return (
    <nav className="h-20 w-full border-b-2 border-neutral-200 dark:border-neutral-800 px-4">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        <div className="pl-4 gap-x-3 flex items-center">
          <Image
            src="/mascot.svg"
            alt="Mascot"
            width={40}
            height={40}
            className="align-middle"
          />
          <h1 className="text-2xl font-extrabold text-brand-500 tracking-wide">
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
