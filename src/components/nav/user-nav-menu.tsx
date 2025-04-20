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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { LuLayoutDashboard, LuLogOut, LuSettings } from "react-icons/lu"
import { logOut } from "@/app/actions/auth"

interface UserNavMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const UserNavMenu: FC<UserNavMenuProps> = ({ user }) => {
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          <AvatarFallback className="bg-gray-200 dark:bg-brand-100">
            {user.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-4 z-50">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
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
