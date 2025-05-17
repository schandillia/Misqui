import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"

export const metadata: Metadata = {
  title: meta.SETTINGS.TITLE,
  description: meta.SETTINGS.DESCRIPTION,
}

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex-con flex h-full">
      <div className="flex h-full w-full flex-col">{children}</div>
    </div>
  )
}
export default Layout
