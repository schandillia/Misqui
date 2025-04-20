import SignIn from "@/components/auth/sign-in"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import brand from "@/lib/data/brand.json"

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      {/* <SignIn /> */}
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        <div className="pt-8 pl-4 pb-7 gap-x-3 flex items-center">
          <Image src="/mascot.svg" alt="Mascot" width={40} height={40} />
          <h1 className="text-2xl font-extrabold text-purple-500 tracking-wide">
            {brand.BRAND}
          </h1>
        </div>
        <SignIn />
      </div>
    </header>
  )
}
