"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
// Import useState and useEffect
import React, { useState, useEffect } from "react"

type Props = {
  label: string
  iconSrc: string
  href: string
}

export const SidebarItem = ({ label, iconSrc, href }: Props) => {
  const pathname = usePathname()
  // We still need the raw pathname check
  const isActivePath = pathname === href

  // State to track mounting
  const [mounted, setMounted] = useState(false)

  // Set mounted to true after initial render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine the variant:
  // - Before mounting (SSR and initial client render), use the default variant ("sidebar").
  // - After mounting, use the conditional logic based on the actual current path.
  const variant = mounted && isActivePath ? "sidebarOutline" : "sidebar"

  // Optional: If you want NO specific variant during SSR/initial render,
  // you could return null or a placeholder until mounted, but changing
  // the variant is usually fine and avoids layout shifts.
  // if (!mounted) {
  //   // Render with a guaranteed default variant or placeholder structure
  //   return ( /* Placeholder or Button with default variant */ );
  // }

  return (
    <Button
      // Use the state-derived variant
      variant={variant}
      className="justify-start h-[52px]"
      asChild
      // You could add suppressHydrationWarning here as a fallback,
      // but the mounted state pattern should prevent the need for it.
      // suppressHydrationWarning
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={32}
          width={32}
        />
        {label}
      </Link>
    </Button>
  )
}
