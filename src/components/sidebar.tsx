import { cn } from "@/lib/utils"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import Link from "next/link"
import { SidebarItem } from "@/components/sidebar-item"
import { auth } from "@/auth"
import UserNavMenu from "@/components/nav/user-nav-menu"
import { AuthButton } from "@/components/auth/auth-button"
import ThemeToggle from "@/components/theme-toggle" // Import ThemeToggle

type Props = {
  className?: string
}

const sidebarItems = [
  { label: "Learn", iconSrc: "/learn.svg", href: "/learn" },
  { label: "Leaderboard", iconSrc: "/leaderboard.svg", href: "/leaderboard" },
  { label: "Quests", iconSrc: "/quests.svg", href: "/quests" },
  { label: "Store", iconSrc: "/store.svg", href: "/store" },
]

export const Sidebar = async ({ className }: Props) => {
  const session = await auth()

  return (
    <div
      className={cn(
        "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col truncate",
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
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            label={item.label}
            iconSrc={item.iconSrc}
            href={item.href}
          />
        ))}
      </div>
      <div className="flex justify-center py-2">
        <ThemeToggle />
      </div>
      <div className="p-4 flex flex-col items-center gap-y-2">
        {session?.user ? (
          <UserNavMenu user={session.user} position="bottom" />
        ) : (
          <AuthButton />
        )}
      </div>
    </div>
  )
}
