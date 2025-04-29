"use client"

import { FC } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name?: string | null
  image?: string | null
  className?: string
}

const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U"

export const UserAvatar: FC<UserAvatarProps> = ({ name, image, className }) => (
  <Avatar className={className}>
    <AvatarImage src={image ?? ""} alt={name ?? ""} />
    <AvatarFallback className="bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600">
      {getInitials(name)}
    </AvatarFallback>
  </Avatar>
)
