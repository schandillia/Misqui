import { cn } from "@/lib/utils"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import Link from "next/link"
import { SidebarItem } from "@/components/sidebar-item"
import { auth } from "@/auth"
import UserNavMenu from "@/components/nav/user-nav-menu"
import { AuthButton } from "@/components/auth/auth-button"

type Props = {
  className?: string
}

export const Sidebar = async ({ className }: Props) => {
  const session = await auth()

  return (
    <div
      className={cn(
        "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
        className
      )}
    >
      <Link href="/learn">
        <div className="hidden lg:flex pt-4 pl-4 pb-7 gap-x-3 items-center">
          <Image
            src="/mascot.svg"
            alt="Mascot"
            width={25}
            height={25}
            className="align-middle"
          />
          <h1 className="text-2xl font-extrabold tracking-wide text-brand-500">
            {brand.BRAND}
          </h1>
        </div>
      </Link>

      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label="Learn" iconSrc="/learn.svg" href="/learn" />
        <SidebarItem
          label="Leaderboard"
          iconSrc="/leaderboard.svg"
          href="/leaderboard"
        />
        <SidebarItem label="Quests" iconSrc="/quests.svg" href="/quests" />
        <SidebarItem label="Shop" iconSrc="/shop.svg" href="/shop" />
      </div>

      {/* profile */}
      <div className="p-4">
        {session?.user ? (
          <>
            <UserNavMenu user={session.user} />
          </>
        ) : (
          <AuthButton />
        )}
      </div>
    </div>
  )
}
