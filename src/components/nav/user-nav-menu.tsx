"use client"

import { FC } from "react"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"
import Link from "next/link"
import { LuLayoutDashboard, LuLogOut, LuSettings } from "react-icons/lu"
import { GrUserAdmin } from "react-icons/gr"
import { logOut } from "@/app/actions/auth"

interface UserNavMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "admin" | "user" | null
  }
  position?: "top" | "bottom"
}

const UserInfo: FC<{ name?: string | null; email?: string | null }> = ({
  name,
  email,
}) => (
  <div className="flex flex-col space-y-1 text-left uppercase">
    <p className="text-brand-600 dark:text-brand-400 text-sm leading-none font-medium">
      {name}
    </p>
    <p className="text-muted-foreground text-xs leading-none font-bold">
      {email}
    </p>
  </div>
)

const UserNavMenu: FC<UserNavMenuProps> = ({ user, position = "top" }) => {
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {position === "bottom" ? (
          <div className="flex w-full cursor-pointer gap-x-2 p-2">
            <UserAvatar
              name={user.name}
              image={user.image}
              className="size-8 cursor-pointer"
            />
            <UserInfo name={user.name} email={user.email} />
          </div>
        ) : (
          <UserAvatar
            name={user.name}
            image={user.image}
            className="size-8 cursor-pointer"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 mt-4 w-56"
        side={position}
      >
        <DropdownMenuLabel>
          <UserInfo name={user.name} email={user.email} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <GrUserAdmin className="mr-2 size-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LuLayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <LuSettings className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onSelect={() => logOut(pathname)}
        >
          <LuLogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserNavMenu
