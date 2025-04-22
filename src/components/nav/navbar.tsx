import { AuthButton } from "@/components/auth/auth-button"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import { auth } from "@/auth"
import UserNavMenu from "@/components/nav/user-nav-menu"

export const Navbar = async () => {
  const session = await auth()

  return (
    <nav className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        <div className="pl-4 gap-x-3 flex items-center">
          {" "}
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
        {session?.user ? (
          <>
            <UserNavMenu user={session.user} />
          </>
        ) : (
          <AuthButton />
        )}
      </div>
    </nav>
  )
}
