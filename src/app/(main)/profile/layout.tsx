import { Metadata } from "next"
import type { ReactNode } from "react"
import meta from "@/lib/data/meta.json"

export const metadata: Metadata = {
  title: meta.PROFILE.TITLE,
  description: meta.PROFILE.DESCRIPTION,
}

const Layout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

export default Layout
