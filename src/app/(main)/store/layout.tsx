import { Metadata } from "next"
import type { ReactNode } from "react"
import meta from "@/lib/data/meta.json"

export const metadata: Metadata = {
  title: meta.STORE.TITLE,
  description: meta.STORE.DESCRIPTION,
}

const Layout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

export default Layout
