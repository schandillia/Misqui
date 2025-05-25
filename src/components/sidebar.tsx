import { cn } from "@/lib/utils"
import Image from "next/image"
import brand from "@/lib/data/brand.json"
import Link from "next/link"
import { SidebarItem } from "@/components/sidebar-item"
import { auth } from "@/auth"
import UserNavMenu from "@/components/nav/user-nav-menu"
import { AuthButton } from "@/components/auth/auth-button"
import ThemeToggle from "@/components/theme/theme-toggle"
import ColorSwitcher from "@/components/theme/color-switcher"
import { getUserSubscription } from "@/db/queries"

type Props = {
  className?: string
}

const sidebarItems = [
  { label: "Learn", iconSrc: "/images/icons/learn.svg", href: "/learn" },
  {
    label: "Leaderboard",
    iconSrc: "/images/icons/leaderboard.svg",
    href: "/leaderboard",
  },
  {
    label: "Missions",
    iconSrc: "/images/icons/missions.svg",
    href: "/missions",
  },
  { label: "Store", iconSrc: "/images/icons/store.svg", href: "/store" },
]

export const Sidebar = async ({ className }: Props) => {
  const sessionData = auth()
  const userSubscriptionData = getUserSubscription()

  const [session, userSubscription] = await Promise.all([
    sessionData,
    userSubscriptionData,
  ])

  const isPro = !!userSubscription?.isActive

  return (
    <div
      className={cn(
        "top-0 left-0 flex h-full flex-col truncate border-r-2 px-4 lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href="/learn">
        <div className="hidden items-center gap-x-3 pt-4 pb-7 pl-4 lg:flex">
          <Image
            src="/images/mascots/mascot.svg"
            alt="Mascot"
            width={35}
            height={35}
            className="align-middle"
          />
          <h1 className="text-brand-500 text-2xl font-extrabold tracking-wide">
            {brand.BRAND}
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            label={item.label}
            iconSrc={item.iconSrc}
            href={item.href}
          />
        ))}
      </div>
      <div className="flex flex-row items-center justify-center gap-x-4 py-2">
        <ThemeToggle />
        {isPro && <ColorSwitcher inSidebar />}
      </div>
      <div className="flex flex-col items-center gap-y-2 p-4">
        {session?.user ? (
          <UserNavMenu user={session.user} position="bottom" />
        ) : (
          <AuthButton />
        )}
      </div>
    </div>
  )
}
