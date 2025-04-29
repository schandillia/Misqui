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
import { logOut } from "@/app/actions/auth"

interface UserNavMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  position?: "top" | "bottom"
}

const UserInfo: FC<{ name?: string | null; email?: string | null }> = ({
  name,
  email,
}) => (
  <div className="flex flex-col space-y-1 uppercase text-left">
    <p className="text-sm font-medium leading-none text-brand-600">{name}</p>
    <p className="text-xs leading-none text-muted-foreground font-bold">
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
          <div className="flex gap-x-2 p-2 cursor-pointer w-full">
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
        className="w-56 mt-4 z-50"
        side={position}
      >
        <DropdownMenuLabel>
          <UserInfo name={user.name} email={user.email} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LuLayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <LuSettings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
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
